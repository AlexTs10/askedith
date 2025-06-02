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
} from './nylas-sdk-v3';
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
    // The redirectUri from client is not used here; server generates it.
    // This ensures consistency with how the /callback route will receive it.
    const protocol = req.get('x-forwarded-proto') || 'https'; 
    const dynamicCallbackUrl = `${protocol}://${req.get('host')}/callback`;
    console.log('Generated callback URL for auth:', dynamicCallbackUrl);
    const authUrl = generateNylasAuthUrl(email, dynamicCallbackUrl);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Manual code exchange endpoint for when the callback URL fails
router.post("/nylas/manual-exchange", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: "Authorization code is required" 
      });
    }
    
    console.log('Manually exchanging code for token:', code);
    
    // Process the authorization code using Nylas SDK V3
    // For manual exchange, the redirect URI used in the initial auth flow is implicitly the one Nylas expects.
    // We don't need to pass it again if `exchangeCodeForToken` in `nylas-sdk-v3.js` uses a fixed one or it's configured in Nylas.
    // However, to be safe and consistent, let's assume the registered redirect URI.
    // The `exchangeCodeForToken` function in nylas-sdk-v3.js takes redirectUri as a parameter.
    // It should be the same one used in the auth URL generation.
    const protocol = req.get('x-forwarded-proto') || 'https';
    const callbackUrl = `${protocol}://${req.get('host')}/callback`; // This must match the one used for generating the auth URL.


    const grantId = await exchangeCodeForToken(code, callbackUrl);
    
    console.log('Successfully obtained Nylas grant ID via manual exchange');
    
    // Store the grant ID in session
    if (req.session) {
      req.session.nylasGrantId = grantId;
      console.log('Saved Nylas grant ID in session');
      
      // Create folder structure for the user using their grant ID
      console.log('Creating folder structure in email account...');
      await createFolderStructure(grantId);
    }
    
    res.json({ 
      success: true, 
      message: "Email account connected successfully" 
    });
  } catch (error) {
    console.error('Error processing manual code exchange:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to connect your email account" 
    });
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

// Send email via Nylas (This endpoint is used by client if a connection is established)
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
    
    const results: { success: boolean }[] = await Promise.all(
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