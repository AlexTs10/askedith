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

// Route to generate auth URL for email connection
router.post('/nylas/auth-url', (req: Request, res: Response) => {
  try {
    const { email, redirectUri } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    // Use the provided redirectUri from the frontend or generate one
    const callbackUri = redirectUri || `${req.protocol}://${req.get('host')}/callback`;
    console.log('Using callback URI for Nylas:', callbackUri);
    
    const authUrl = generateAuthUrl(email, callbackUri);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// OAuth callback endpoint
router.get('/nylas/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    // Use the same redirect URI that was used to generate the auth URL
    // This needs to match exactly what was provided to generateAuthUrl
    const redirectUri = `${req.protocol}://${req.get('host')}/callback`;
    console.log('Using redirect URI for token exchange:', redirectUri);
    
    const accessToken = await exchangeCodeForToken(code, redirectUri);
    
    // Store the token in session
    if (req.session) {
      req.session.nylasAccessToken = accessToken;
      
      // Create folder structure for the user
      await createFolderStructure(accessToken);
    }
    
    // Redirect back to the email preview page
    res.redirect('/email-preview');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to authenticate with email provider' });
  }
});

// Check connection status
router.get('/nylas/connection-status', async (req: Request, res: Response) => {
  if (!req.session?.nylasAccessToken) {
    return res.json({ connected: false });
  }
  
  try {
    const connected = await checkNylasConnection(req.session.nylasAccessToken);
    res.json({ connected });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.json({ connected: false, error: 'Failed to verify connection' });
  }
});

// Send email via Nylas
router.post('/nylas/send-email', async (req: Request, res: Response) => {
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
  
  try {
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
  const accessToken = req.session?.nylasAccessToken;
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'Not authenticated with email provider',
      needsAuth: true
    });
  }
  
  try {
    const { category } = req.params;
    const { limit } = req.query;
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 20;
    
    const messages = await getMessagesFromCategory(accessToken, category, limitNum);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send batch emails through Nylas
router.post('/nylas/send-batch', async (req: Request, res: Response) => {
  const accessToken = req.session?.nylasAccessToken;
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'Not authenticated with email provider',
      needsAuth: true
    });
  }
  
  try {
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'Invalid emails array' });
    }
    
    const results = await Promise.all(
      emails.map(async (email) => {
        const { to, subject, body, category, replyTo } = email;
        
        if (!to || !subject || !body || !category) {
          return { success: false, error: 'Missing required fields', email };
        }
        
        const emailData: EmailData = {
          to,
          subject,
          body,
          replyTo
        };
        
        return sendEmailWithNylas(accessToken, emailData, category);
      })
    );
    
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
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