/**
 * API Routes for Nylas Email Integration
 */

import { Request, Response, Router } from 'express';
// Import functions from our Nylas SDK V3 implementation
import {
  generateNylasAuthUrl,
  exchangeCodeForToken,
  createFolderStructure,
  sendEmailWithNylas,
  checkNylasConnection,
  getMessagesFromCategory
} from './nylas-sdk-v3.js';
import { EmailData } from './emailService';

const router = Router();

// Route to generate auth URL for email connection
router.post('/nylas/auth-url', (req: Request, res: Response) => {
  try {
    const { email, redirectUri } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    // Generate callback URL using current host (force HTTPS for production)
    const protocol = req.get('x-forwarded-proto') || 'https'; // Force HTTPS in production
    const callbackUrl = `${protocol}://${req.get('host')}/callback`;
    console.log('Generated callback URL:', callbackUrl);
    const authUrl = generateNylasAuthUrl(email, callbackUrl);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// OAuth callback endpoint
router.get('/nylas/callback', async (req: Request, res: Response) => {
  try {
    const { code, redirect_uri } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    // Generate the same callback URL used for auth
    const protocol = req.get('x-forwarded-proto') || 'https';
    const callbackUrl = `${protocol}://${req.get('host')}/callback`;
    console.log('Exchanging code for access token with callback URL:', callbackUrl);
    
    // Exchange the auth code for an access token
    const accessToken = await exchangeCodeForToken(code, callbackUrl);
    
    // Store the grant ID in session (V3 API uses grant IDs instead of access tokens)
    if (req.session) {
      req.session.nylasGrantId = accessToken; // Variable name remains for backward compatibility
      
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
  if (!req.session?.nylasGrantId) {
    return res.json({ connected: false });
  }
  
  try {
    const connected = await checkNylasConnection(req.session.nylasGrantId);
    res.json({ connected });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.json({ connected: false, error: 'Failed to verify connection' });
  }
});

// Send email via Nylas
router.post('/nylas/send-email', async (req: Request, res: Response) => {
  const grantId = req.session?.nylasGrantId;
  
  if (!grantId) {
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
    
    const result = await sendEmailWithNylas(grantId, emailData, category);
    
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
  const grantId = req.session?.nylasGrantId;
  
  if (!grantId) {
    return res.status(401).json({
      error: 'Not authenticated with email provider',
      needsAuth: true
    });
  }
  
  try {
    const { category } = req.params;
    const { limit } = req.query;
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 20;
    
    const messages = await getMessagesFromCategory(grantId, category, limitNum);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send batch emails through Nylas
router.post('/nylas/send-batch', async (req: Request, res: Response) => {
  const grantId = req.session?.nylasGrantId;
  
  if (!grantId) {
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
        
        return sendEmailWithNylas(grantId, emailData, category);
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

// Set Nylas Grant ID directly
router.post('/nylas/set-grant-id', async (req: Request, res: Response) => {
  try {
    const { grantId } = req.body;
    
    if (!grantId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Grant ID is required' 
      });
    }
    
    console.log('Setting Nylas grant ID manually:', grantId);
    
    // Store the grant ID in session
    if (req.session) {
      req.session.nylasGrantId = grantId;
      console.log('Saved Nylas grant ID in session');
      
      // Verify the connection works
      const connected = await checkNylasConnection(grantId);
      
      if (connected) {
        // Create folder structure for the user using their grant ID
        console.log('Creating folder structure in email account...');
        await createFolderStructure(grantId);
        
        return res.json({
          success: true,
          message: "Nylas Grant ID set successfully and connection verified"
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "The provided Grant ID could not be verified with Nylas"
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        error: "Session not available"
      });
    }
  } catch (error) {
    console.error('Error setting Nylas Grant ID:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to set Nylas Grant ID',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;