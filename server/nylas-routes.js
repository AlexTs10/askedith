/**
 * API Routes for Nylas Email Integration
 */

import { Router } from 'express';
import * as nylasApi from './nylas-direct.js';

const router = Router();

// Route to generate auth URL for email connection
router.post('/nylas/auth-url', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    // Generate the redirect URI based on the current request
    const redirectUri = `${req.protocol}://${req.get('host')}/api/nylas/callback`;
    const authUrl = nylasApi.generateAuthUrl(email, redirectUri);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// OAuth callback endpoint
router.get('/nylas/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/nylas/callback`;
    const accessToken = await nylasApi.exchangeCodeForToken(code, redirectUri);
    
    // Store the token in session
    if (req.session) {
      req.session.nylasAccessToken = accessToken;
      
      // Create folder structure for the user
      await nylasApi.createFolderStructure(accessToken);
    }
    
    // Redirect back to the email preview page
    res.redirect('/email-preview');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to authenticate with email provider' });
  }
});

// Check connection status
router.get('/nylas/connection-status', async (req, res) => {
  if (!req.session?.nylasAccessToken) {
    return res.json({ connected: false });
  }
  
  try {
    const connected = await nylasApi.checkNylasConnection(req.session.nylasAccessToken);
    res.json({ connected });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.json({ connected: false, error: 'Failed to verify connection' });
  }
});

// Send email via Nylas
router.post('/nylas/send-email', async (req, res) => {
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
    const emailData = {
      to,
      subject,
      body,
      replyTo
    };
    
    const result = await nylasApi.sendEmailWithNylas(accessToken, emailData, category);
    
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
router.get('/nylas/messages/:category', async (req, res) => {
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
    
    const messages = await nylasApi.getMessagesFromCategory(accessToken, category, limitNum);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send batch emails through Nylas
router.post('/nylas/send-batch', async (req, res) => {
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
        
        const emailData = {
          to,
          subject,
          body,
          replyTo
        };
        
        return nylasApi.sendEmailWithNylas(accessToken, emailData, category);
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