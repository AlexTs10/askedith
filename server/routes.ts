import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Import the Nylas routes
const nylasRoutes = require('./nylas-routes');

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Nylas routes
  app.use('/api', nylasRoutes);
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
      const { to, subject, body, priority, from, replyTo, resourceId, questionnaireId, userId } = req.body;
      
      if (!to || !subject || !body) {
        return res.status(400).json({ message: "Missing required email fields" });
      }
      
      // Import the email service
      const emailService = await import('./emailService');
      
      // Send the email
      const result = await emailService.sendEmail({ 
        to, 
        subject, 
        body,
        from,
        replyTo, // Include replyTo field for proper email configuration
        resourceId,
        questionnaireId,
        userId,
        priority
      });
      
      // Return response based on the result
      res.json(result);
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
      }
      
      // Import the email service
      const { sendBatchEmails } = await import('./emailService');
      
      // Send the emails in batch
      const result = await sendBatchEmails(emails);
      
      // Return response
      res.json(result);
    } catch (error) {
      console.error("Batch email sending error:", error);
      res.status(500).json({ 
        success: false, 
        queued: 0,
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
