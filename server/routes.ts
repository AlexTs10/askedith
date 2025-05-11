import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const { to, subject, body } = req.body;
      
      if (!to || !subject || !body) {
        return res.status(400).json({ message: "Missing required email fields" });
      }
      
      // Import the email service
      const { sendEmail } = await import('./emailService');
      
      // Send the email
      const result = await sendEmail({ to, subject, body });
      
      // Return response based on the result
      res.json(result);
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send email" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
