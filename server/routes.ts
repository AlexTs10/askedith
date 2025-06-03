import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";
import emailService from "./emailService";

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
  
  // API endpoint to provide Mapbox public key to frontend
  app.get("/api/mapbox-key", (req, res) => {
    res.json({ 
      mapboxPublicKey: process.env.MAPBOX_PUBLIC_KEY || '' 
    });
  });

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
      
      // Check if user has a Nylas grant ID in session
      if (req.session?.nylasGrantId) {
        try {
          const nylasSDK = await import('./nylas-sdk-v3');
          const hasNylasConnection = await nylasSDK.checkNylasConnection(req.session.nylasGrantId);
          
          if (hasNylasConnection) {
            console.log('Using Nylas V3 SDK with grant ID for single email');
            const emailData = { to, subject, body, replyTo }; // Pass replyTo
            const emailCategory = category || 'Other';
            
            const result = await nylasSDK.sendEmailWithNylas(
              req.session.nylasGrantId, 
              emailData, 
              emailCategory
            );
            
            if (result.success) {
              return res.json({
                success: true,
                queued: false, // Not queued if sent via Nylas directly
                messageId: result.messageId, // Nylas returns a messageId
                message: "Email sent successfully via your connected email account"
              });
            } else {
              // Nylas send failed, log error and potentially fall through or return error
              console.error("Nylas sendEmailWithNylas failed:", result.error);
              // Decide if you want to fallback here or just error out
              // For now, let's error out if Nylas was attempted and failed.
              return res.status(500).json({
                  success: false,
                  message: "Failed to send email via connected account. " + (result.error || "")
              });
            }
          }
        } catch (nylasError) {
          console.error("Error attempting to send with Nylas:", nylasError);
          // Fall through to fallback email service if Nylas layer itself had an issue
        }
      }
      
      // Fallback: If no Nylas grantId or if the Nylas block had an exception (not a send failure)
      console.log('No Nylas grant ID or Nylas system error, using fallback email service for single email');
      const fallbackResult = await emailService.sendEmail({ 
        to, subject, body, from, replyTo, resourceId, questionnaireId, userId, category // pass category to fallback too
      });
      res.json(fallbackResult); // This will use the console log fallback
      
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
      
      for (const email of emails) {
        if (!email.to || !email.subject || !email.body) {
          return res.status(400).json({ message: "All emails require to, subject, and body fields" });
        }
        email.replyTo = email.replyTo || undefined;
        email.category = email.category || 'Other';
      }
      
      // Check if Nylas is available and connected for the user
      if (req.session?.nylasGrantId) {
        try {
          const nylasSDK = await import('./nylas-sdk-v3.js');
          const hasNylasConnection = await nylasSDK.checkNylasConnection(req.session.nylasGrantId);

          if (hasNylasConnection) {
            console.log('Using Nylas V3 SDK for batch emails');
            // This is where you'd call a batch send if your Nylas SDK wrapper has one,
            // or loop and send individually as currently in /api/nylas/send-batch
            // For consistency, let's assume the client will call /api/nylas/send-batch if Nylas is connected.
            // So, this primary /api/send-batch-emails will be for fallbacks.
            // However, the original code had Nylas logic here, so let's adapt it slightly.
            
            const nylasResults = await Promise.all(
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

            const successCount = nylasResults.filter(r => r.success).length;
            
            return res.json({
              success: successCount > 0,
              queued: 0, // Not queued if sent via Nylas
              sent: successCount,
              failed: emails.length - successCount,
              total: emails.length,
              message: `${successCount} of ${emails.length} emails sent successfully via your connected email account.`
            });
          }
        } catch (nylasError) {
          console.error("Error attempting to send batch with Nylas:", nylasError);
          // Fall through to fallback
        }
      }
      
      // Fallback: No Nylas grantId or Nylas system error
      console.log('No Nylas grant ID or Nylas system error, using fallback email service for batch emails');
      const fallbackResult = await emailService.sendBatchEmails(emails);
      res.json(fallbackResult); // This will use the console log fallback

    } catch (error) {
      console.error("Batch email sending error:", error);
      res.status(500).json({ 
        success: false, 
        queued: 0,
        sent: 0,
        failed: emails?.length || 0,
        total: emails?.length || 0,
        message: error instanceof Error ? error.message : "Failed to send batch emails" 
      });
    }
  });

  // Email service status endpoint
  app.get("/api/email-service-status", async (req, res) => {
    try {
      // No longer need needsSendGridKey from emailService
      const { checkEmailServiceStatus } = await import('./emailService');
      const status = await checkEmailServiceStatus();
      // The needsSendGridKey field is removed from the response of checkEmailServiceStatus
      res.json(status);
    } catch (error) {
      console.error("Email service status check error:", error);
      res.status(500).json({ 
        error: 'Failed to check email service status',
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add an extra route to handle the alternate dash format for callback
  app.get("/alt-callback", (req, res) => {
    console.log("Alternate callback received, redirecting to main callback");
    res.redirect(`/callback?${new URLSearchParams(req.query as Record<string, string>).toString()}`);
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
        // Generate the same callback URL used for auth
        const protocol = req.get('x-forwarded-proto') || 'https';
        const callbackUrl = `${protocol}://${req.get('host')}/callback`;
        
        // Exchange code for token with detailed error logging
        console.log('Attempting to exchange code for token...');
        const grantId = await nylasHelper.exchangeCodeForToken(code, callbackUrl);
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
        const html = `
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
                  window.opener.postMessage({
                    type: 'NYLAS_CONNECTION_SUCCESS',
                    grantId: '«GRANT_ID»'   // injected below
                  }, '*');
                }
              </script>
            </body>
          </html>
        `.replace('«GRANT_ID»', grantId);
        res.send(html);
      } catch (tokenError: any) {
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
    } catch (error: any) {
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