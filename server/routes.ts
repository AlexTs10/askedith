import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static assets from public directory
  app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));
  // Import and register Nylas routes dynamically
  try {
    // Use ESM dynamic import for the Nylas routes (updated to TypeScript version)
    const { default: nylasRoutes } = await import('./nylasRoutes');
    app.use('/api', nylasRoutes);
  } catch (error) {
    console.error('Failed to load Nylas routes:', error);
  }
  
  // Get all resources
  app.get("/api/resources", async (req, res) => {
    try {
      // Check for query parameters
      const { category, zipCode, radiusMiles } = req.query;
      
      // If zipCode is provided, get resources by location
      if (zipCode) {
        const radius = radiusMiles ? parseInt(radiusMiles as string, 10) : 25;
        const resources = await storage.getResourcesByLocation(zipCode as string, radius);
        return res.json(resources);
      }
      
      // If category is provided, get resources by category
      if (category) {
        const resources = await storage.getResourcesByCategory(category as string);
        return res.json(resources);
      }
      
      // Otherwise get all resources
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Get resource by ID
  app.get("/api/resources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const resource = await storage.getResource(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  // Email sending endpoint
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, body, priority, from, replyTo, resourceId, questionnaireId, userId, category } = req.body;
      
      if (!to || !subject || !body) {
        return res.status(400).json({ message: "Missing required email fields" });
      }
      
      // Try to use Nylas if available
      try {
        // Check if we're using the mock grant for testing
        const { isUsingMockGrant, sendEmailDirect } = await import('./direct-email-helper');
        
        // If using mock grant, use direct implementation
        if (req.session?.nylasGrantId && isUsingMockGrant(req)) {
          console.log('Using direct email implementation with mock grant ID');
          const emailData = { to, subject, body, replyTo };
          
          const result = await sendEmailDirect(emailData);
          
          if (result.success) {
            return res.json({
              success: true,
              queued: false,
              message: "Email sent successfully via your connected email account"
            });
          }
        }
        
        // Import the direct sending module
        const nylasDirect = await import('./nylas-direct-send.js');
        
        // Check if user has a Nylas grant ID (and not using mock)
        if (req.session?.nylasGrantId && !isUsingMockGrant(req)) {
          const nylasSDK = await import('./nylas-sdk-v3.js');
          const hasNylasConnection = await nylasSDK.checkNylasConnection(req.session.nylasGrantId);
          
          if (hasNylasConnection) {
            // Use connected account if available
            console.log('Using Nylas V3 SDK with grant ID');
            const emailData = { to, subject, body, replyTo };
            const emailCategory = category || 'Other';
            
            const result = await nylasSDK.sendEmailWithNylas(
              req.session.nylasGrantId, 
              emailData, 
              emailCategory
            );
            
            if (result.success) {
              return res.json({
                success: true,
                queued: false,
                message: "Email sent successfully via your connected email account"
              });
            } 
            // Fall through to SendGrid if Nylas fails
          }
        }
        
        // No Nylas connection or connection failed, use SendGrid
        console.log('Using SendGrid for email');
        const { sendEmail } = await import('./sendgrid-helper');
        const result = await sendEmail({ 
          to, subject, body, from, replyTo, resourceId, questionnaireId, userId
        });
        res.json(result);
        
      } catch (nylasError) {
        // If there's any error with Nylas, fall back to SendGrid
        console.error("Nylas error, falling back to SendGrid:", nylasError);
        const { sendEmail } = await import('./sendgrid-helper');
        const result = await sendEmail({ 
          to, subject, body, from, replyTo, resourceId, questionnaireId, userId
        });
        res.json(result);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ 
        success: false, 
        queued: false,
        message: error instanceof Error ? error.message : "Failed to send email" 
      });
    }
  });
  
  // Batch email sending endpoint
  app.post("/api/send-batch-emails", async (req, res) => {
    try {
      const { emails } = req.body;
      
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ message: "Missing or invalid emails array" });
      }
      
      // Validate all emails have required fields
      for (const email of emails) {
        if (!email.to || !email.subject || !email.body) {
          return res.status(400).json({ message: "All emails require to, subject, and body fields" });
        }
        // Ensure replyTo is passed through if available
        email.replyTo = email.replyTo || undefined;
        // Ensure category is defined
        email.category = email.category || 'Other';
      }
      
      try {
        // Check if we're using mock/test mode
        const { isUsingMockGrant, sendBatchEmailsDirect } = await import('./direct-email-helper');
        
        // If using test mode with mock grant ID
        if (req.session?.nylasGrantId && isUsingMockGrant(req)) {
          console.log('Using direct mock implementation for batch emails');
          const result = await sendBatchEmailsDirect(emails);
          return res.json(result);
        }
        
        // Check if we have Nylas available
        let useNylas = false;
        let hasNylasError = false;
        let nylasResults = null;
        
        if (req.session?.nylasGrantId && !isUsingMockGrant(req)) {
          try {
            const nylasSDK = await import('./nylas-sdk-v3.js');
            const hasNylasConnection = await nylasSDK.checkNylasConnection(req.session.nylasGrantId);
            
            if (hasNylasConnection) {
              // Use Nylas for batch email sending
              console.log('Using Nylas V3 SDK for batch emails');
              useNylas = true;
              
              // Send all emails through Nylas
              nylasResults = await Promise.all(
                emails.map(email => nylasSDK.sendEmailWithNylas(
                  req.session.nylasGrantId,
                  {
                    to: email.to,
                    subject: email.subject,
                    body: email.body,
                    replyTo: email.replyTo
                  },
                  email.category
                ))
              );
            }
          } catch (err) {
            console.error('Nylas error:', err);
            hasNylasError = true;
          }
        }
        
        // If Nylas was used successfully
        if (useNylas && nylasResults && !hasNylasError) {
          // Check if all emails were sent successfully
          const allSuccessful = nylasResults.every(r => r.success);
          const successCount = nylasResults.filter(r => r.success).length;
          
          if (allSuccessful || successCount > 0) {
            return res.json({
              success: true,
              queued: 0,
              sent: successCount,
              total: emails.length,
              message: `${successCount} of ${emails.length} emails sent successfully via your connected email account`
            });
          }
        }
        
        // Fall back to SendGrid if Nylas failed or wasn't used
        console.log('Using SendGrid for batch emails');
        const { sendBatchEmails } = await import('./sendgrid-helper');
        const result = await sendBatchEmails(emails);
        res.json(result);
      } catch (error) {
        // Fall back to SendGrid on any error
        console.error("Error in email sending, falling back to SendGrid:", error);
        const { sendBatchEmails } = await import('./sendgrid-helper');
        const result = await sendBatchEmails(emails);
        res.json(result);
      }
    } catch (error) {
      console.error("Batch email sending error:", error);
      res.status(500).json({ 
        success: false, 
        queued: 0,
        sent: 0,
        failed: 0,
        total: 0,
        message: error instanceof Error ? error.message : "Failed to send batch emails" 
      });
    }
  });
  
  // Email service status endpoint
  app.get("/api/email-service-status", async (req, res) => {
    try {
      const { checkEmailServiceStatus, needsSendGridKey } = await import('./emailService');
      const status = await checkEmailServiceStatus();
      
      // Check if we need to request SendGrid key (now async)
      const needsKey = await needsSendGridKey();
      const statusWithKey = {
        ...status,
        needsSendGridKey: needsKey
      };
      
      res.json(statusWithKey);
    } catch (error) {
      console.error("Email service status check error:", error);
      res.status(500).json({ 
        error: 'Failed to check email service status',
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add an extra route to handle the alternate dash format
  app.get("/alt-callback", (req, res) => {
    console.log("Alternate callback received, redirecting to main callback");
    res.redirect(`/callback?${new URLSearchParams(req.query as Record<string, string>).toString()}`);
  });
  
  // Manual code exchange endpoint for when the callback URL fails
  app.post("/api/nylas/manual-exchange", async (req, res) => {
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
      const nylasHelper = await import('./nylas-sdk-v3.js');
      const grantId = await nylasHelper.exchangeCodeForToken(code);
      
      console.log('Successfully obtained Nylas grant ID via manual exchange');
      
      // Store the grant ID in session
      if (req.session) {
        req.session.nylasGrantId = grantId;
        console.log('Saved Nylas grant ID in session');
        
        // Create folder structure for the user using their grant ID
        console.log('Creating folder structure in email account...');
        await nylasHelper.createFolderStructure(grantId);
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
  
  // Handle all variants of the Nylas OAuth callback URL
  // The OAuth provider might return with different URL formats
  app.get(["/callback", "/callback/", "/callback/*"], async (req, res) => {
    try {
      console.log('Callback received with query params:', req.query);
      const { code, error, error_description } = req.query;
      
      // Check for OAuth error response
      if (error) {
        console.error(`OAuth error: ${error} - ${error_description}`);
        return res.send(`
          <html>
            <head>
              <title>Email Connection Failed</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  margin-top: 50px;
                  background-color: #f7f7f7;
                }
                .container {
                  background-color: white;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 { color: #e11d48; }
                .error-icon {
                  font-size: 60px;
                  color: #e11d48;
                  margin-bottom: 20px;
                }
                .error-details {
                  background-color: #ffe4e6;
                  padding: 15px;
                  border-radius: 5px;
                  text-align: left;
                  margin: 20px 0;
                }
                .btn {
                  display: inline-block;
                  background-color: #0e7490;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="error-icon">✖</div>
                <h1>Email Connection Failed</h1>
                <p>There was an error connecting your email account.</p>
                <div class="error-details">
                  <strong>Error:</strong> ${error}<br>
                  <strong>Description:</strong> ${error_description || 'No description provided'}
                </div>
                <p>Please try again or use the Simple Email option instead.</p>
                <a href="/email-setup" class="btn">Return to Email Setup</a>
              </div>
            </body>
          </html>
        `);
      }
      
      if (!code || typeof code !== 'string') {
        console.error('No authorization code provided in callback');
        return res.status(400).send('Error: No authorization code provided');
      }
      
      console.log('Received Nylas callback with code:', code);
      
      // Process the authorization code using Nylas SDK V3
      const nylasHelper = await import('./nylas-sdk-v3.js');
      
      try {
        // Exchange code for token with detailed error logging
        console.log('Attempting to exchange code for token...');
        const grantId = await nylasHelper.exchangeCodeForToken(code);
        console.log('Successfully obtained Nylas grant ID');
        
        // Store the grant ID in session
        if (req.session) {
          req.session.nylasGrantId = grantId;
          console.log('Saved Nylas grant ID in session');
          
          // Create folder structure for the user using their grant ID
          console.log('Creating folder structure in email account...');
          const folderResult = await nylasHelper.createFolderStructure(grantId);
          console.log('Folder creation result:', folderResult);
        }
        
        // Display success page
        res.send(`
          <html>
            <head>
              <title>Email Connected Successfully</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  margin-top: 50px;
                  background-color: #f7f7f7;
                }
                .container {
                  background-color: white;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 { color: #0e7490; }
                .success-icon {
                  font-size: 60px;
                  color: #22c55e;
                  margin-bottom: 20px;
                }
                .btn {
                  display: inline-block;
                  background-color: #0e7490;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success-icon">✓</div>
                <h1>Email Connected Successfully!</h1>
                <p>Your email account has been successfully connected to AskEdith.</p>
                <p>We've created folders to organize provider responses by category.</p>
                <a href="/email-preview" class="btn">Return to Email Preview</a>
              </div>
              <script>
                // Notify parent window of successful connection
                if (window.opener) {
                  window.opener.postMessage({ type: 'NYLAS_CONNECTION_SUCCESS' }, '*');
                }
              </script>
            </body>
          </html>
        `);
      } catch (tokenError) {
        console.error('Token exchange error:', tokenError);
        return res.send(`
          <html>
            <head>
              <title>Email Connection Failed</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  margin-top: 50px;
                  background-color: #f7f7f7;
                }
                .container {
                  background-color: white;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 { color: #e11d48; }
                .error-icon {
                  font-size: 60px;
                  color: #e11d48;
                  margin-bottom: 20px;
                }
                .error-details {
                  background-color: #ffe4e6;
                  padding: 15px;
                  border-radius: 5px;
                  text-align: left;
                  margin: 20px 0;
                }
                .btn {
                  display: inline-block;
                  background-color: #0e7490;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="error-icon">✖</div>
                <h1>Email Connection Failed</h1>
                <p>There was an error processing your authorization.</p>
                <div class="error-details">
                  <strong>Error:</strong> ${tokenError.message || 'Unknown error during token exchange'}
                </div>
                <p>Please try again or use the Simple Email option instead.</p>
                <a href="/email-setup" class="btn">Return to Email Setup</a>
              </div>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      res.status(500).send(`
        <html>
          <head>
            <title>Email Connection Failed</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                margin-top: 50px;
                background-color: #f7f7f7;
              }
              .container {
                background-color: white;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              h1 { color: #e11d48; }
              .error-icon {
                font-size: 60px;
                color: #e11d48;
                margin-bottom: 20px;
              }
              .btn {
                display: inline-block;
                background-color: #0e7490;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">✖</div>
              <h1>Email Connection Failed</h1>
              <p>An unexpected error occurred. Please try again.</p>
              <a href="/email-setup" class="btn">Return to Email Setup</a>
            </div>
          </body>
        </html>
      `);
    }
  });

  // Store user email preference
  app.post("/api/store-user-email", (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: "Email address is required" 
        });
      }
      
      // Store the email in session
      if (req.session) {
        req.session.userEmail = email;
      }
      
      res.json({ 
        success: true, 
        message: "Email preference saved" 
      });
    } catch (error) {
      console.error("Error storing user email:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to store email preference" 
      });
    }
  });

  // Setup SendGrid API key
  app.post("/api/setup-sendgrid", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ 
          success: false, 
          message: "API key is required" 
        });
      }
      
      // Import config module
      const { setSendGridApiKey } = await import('./config');
      
      // Store the API key securely in our config
      await setSendGridApiKey(apiKey);
      
      // Set the API key in the environment for this session as well
      process.env.SENDGRID_API_KEY = apiKey;
      
      // Force reload the email service module
      delete require.cache[require.resolve('./emailService')];
      const emailService = await import('./emailService');
      
      // Reinitialize the email service with the new key
      await emailService.initializeSendGrid();
      
      // Check status after setting the key
      const status = await emailService.checkEmailServiceStatus();
      
      res.json({
        success: true,
        message: "SendGrid API key configured successfully",
        status
      });
    } catch (error) {
      console.error("SendGrid setup error:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to configure SendGrid"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}