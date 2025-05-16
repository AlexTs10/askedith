/**
 * API Routes for Nylas Email Integration
 */

import { Request, Response, Router } from 'express';
import {
  generateAuthUrl,
  exchangeCodeForToken,
  createFolderStructure,
  sendEmailWithNylas,
  checkNylasConnection,
  getMessagesFromCategory
} from './nylasService';
import { EmailData } from './emailService';

const router = Router();

// Generate OAuth URL for connecting email
router.post('/nylas/auth-url', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // The redirect URI should be registered in your Nylas dashboard
    const redirectUri = `${req.protocol}://${req.get('host')}/api/nylas/callback`;
    const authUrl = generateAuthUrl(email, redirectUri);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Handle OAuth callback and token exchange
router.get('/nylas/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/nylas/callback`;
    const accessToken = await exchangeCodeForToken(code, redirectUri);
    
    // Store the token in the session
    if (req.session) {
      req.session.nylasAccessToken = accessToken;
    }
    
    // Create the folder structure after authentication
    await createFolderStructure(accessToken);
    
    // Redirect to the email preview page
    res.redirect('/email-preview');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Check if user has connected their email
router.get('/nylas/connection-status', (req: Request, res: Response) => {
  try {
    const accessToken = req.session?.nylasAccessToken;
    
    if (!accessToken) {
      return res.json({ connected: false });
    }
    
    checkNylasConnection(accessToken)
      .then(connected => {
        res.json({ connected });
      })
      .catch(error => {
        console.error('Error checking connection:', error);
        res.json({ connected: false, error: 'Failed to check connection status' });
      });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ connected: false, error: 'Failed to check connection status' });
  }
});

// Send email using Nylas
router.post('/nylas/send-email', async (req: Request, res: Response) => {
  try {
    const accessToken = req.session?.nylasAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Not authenticated with email provider',
        needsAuth: true 
      });
    }
    
    const { to, subject, body, category, replyTo } = req.body;
    
    if (!to || !subject || !body || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const emailData: EmailData = {
      to,
      subject,
      body,
      replyTo
    };
    
    const result = await sendEmailWithNylas(accessToken, emailData, category);
    
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Get messages from a specific category
router.get('/nylas/messages/:category', async (req: Request, res: Response) => {
  try {
    const accessToken = req.session?.nylasAccessToken;
    const { category } = req.params;
    const { limit } = req.query;
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Not authenticated with email provider',
        needsAuth: true 
      });
    }
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 20;
    
    const messages = await getMessagesFromCategory(accessToken, category, limitNum);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send batch of emails through Nylas
router.post('/nylas/send-batch', async (req: Request, res: Response) => {
  try {
    const accessToken = req.session?.nylasAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Not authenticated with email provider',
        needsAuth: true 
      });
    }
    
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'Invalid emails array' });
    }
    
    const results = await Promise.all(
      emails.map(async (email: any) => {
        if (!email.to || !email.subject || !email.body || !email.category) {
          return { success: false, error: 'Missing required fields', email };
        }
        
        const emailData: EmailData = {
          to: email.to,
          subject: email.subject,
          body: email.body,
          replyTo: email.replyTo
        };
        
        return sendEmailWithNylas(accessToken, emailData, email.category);
      })
    );
    
    const allSucceeded = results.every(result => result.success);
    
    if (allSucceeded) {
      res.json({ success: true, results });
    } else {
      res.status(207).json({ 
        success: false, 
        message: 'Some emails failed to send',
        results 
      });
    }
  } catch (error) {
    console.error('Error sending batch emails:', error);
    res.status(500).json({ success: false, error: 'Failed to send batch emails' });
  }
});

export default router;