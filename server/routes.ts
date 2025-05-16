import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// We'll import the Nylas routes dynamically to avoid module system conflicts

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Check if the user has a Nylas connection using V3 SDK
      try {
        const nylasSDK = await import('./nylas-sdk-v3.js');
        const hasNylasConnection = req.session?.nylasGrantId && 
          await nylasSDK.checkNylasConnection(req.session.nylasGrantId);
        
        let result;
        
        if (hasNylasConnection && req.session?.nylasGrantId) {
          // Use Nylas V3 SDK to send the email if the user has connected their account
          console.log('Using Nylas V3 SDK to send email with grant ID');
          const emailData = { to, subject, body, replyTo };
          // Use the email category if provided, otherwise use a default
          const emailCategory = category || 'Other';
          
          result = await nylasSDK.sendEmailWithNylas(
            req.session.nylasGrantId, 
            emailData, 
            emailCategory
          );
          
          if (result.success) {
            // Convert Nylas result to match our standard response format
            result = {
              success: true,
              queued: false,
              message: "Email sent successfully via your connected email account"
            };
          } else {
            // Fall back to SendGrid if Nylas fails
            console.log('Nylas email send failed, falling back to SendGrid');
            const { sendEmail } = await import('./sendgrid-helper');
            result = await sendEmail({ 
              to, subject, body, from, replyTo, resourceId, questionnaireId, userId
            });
          }
        } else {
          // Use SendGrid if no Nylas connection
          console.log('No Nylas connection, using SendGrid');
          const { sendEmail } = await import('./sendgrid-helper');
          result = await sendEmail({ 
            to, subject, body, from, replyTo, resourceId, questionnaireId, userId
          });
        }
        
        // Return response based on the result
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
        // Check if the user has a Nylas connection using V3 SDK
        const nylasSDK = await import('./nylas-sdk-v3.js');
        const hasNylasConnection = req.session?.nylasGrantId && 
          await nylasSDK.checkNylasConnection(req.session.nylasGrantId);
        
        let result;
        
        if (hasNylasConnection && req.session?.nylasGrantId) {
          // Use Nylas V3 SDK for batch email sending
          console.log('Using Nylas V3 SDK to send batch emails with grant ID');
          
          // Send all emails through Nylas
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
          
          // Check if all emails were sent successfully
          const allSuccessful = nylasResults.every(r => r.success);
          const successCount = nylasResults.filter(r => r.success).length;
          
          if (allSuccessful) {
            result = {
              success: true,
              queued: 0,
              sent: successCount,
              total: emails.length,
              message: `All ${successCount} emails sent successfully via your connected email account`
            };
          } else if (successCount > 0) {
            result = {
              success: true,
              queued: 0,
              sent: successCount,
              total: emails.length,
              message: `${successCount} of ${emails.length} emails sent successfully via your connected email account`
            };
          } else {
            // Fall back to SendGrid if all Nylas sends fail
            console.log('Nylas batch email send failed, falling back to SendGrid');
            const { sendBatchEmails } = await import('./sendgrid-helper');
            result = await sendBatchEmails(emails);
          }
        } else {
          // Use SendGrid for batch sending if no Nylas connection
          console.log('No Nylas connection, using SendGrid for batch emails');
          const { sendBatchEmails } = await import('./sendgrid-helper');
          result = await sendBatchEmails(emails);
        }
        
        // Return response
        res.json(result);
      } catch (nylasError) {
        // If there's any error with Nylas, fall back to SendGrid
        console.error("Nylas error in batch sending, falling back to SendGrid:", nylasError);
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

  // Handle Nylas OAuth callback
  app.get("/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        console.error('No authorization code provided in callback');
        return res.status(400).send('Error: No authorization code provided');
      }
      
      console.log('Received Nylas callback with code:', code);
      
      // Process the authorization code using Nylas SDK V3
      const nylasHelper = await import('./nylas-sdk-v3.js');
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
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      res.status(500).send('Error connecting your email account. Please try again.');
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
