import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";
import authRoutes from "./authRoutes";

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

  app.use('/api', authRoutes);
  
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


  const httpServer = createServer(app);
  return httpServer;
}