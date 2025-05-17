/**
 * Nylas V3 SDK Implementation
 * 
 * This module implements Nylas integration using the official V3 SDK
 * following the recommended patterns from Nylas documentation.
 */

import Nylas from 'nylas';

// Nylas configuration
const NYLAS_CLIENT_ID = process.env.NYLAS_CLIENT_ID || '12acd056-2644-46b2-9199-5d7fdcf9a86b';
const NYLAS_CLIENT_SECRET = process.env.NYLAS_CLIENT_SECRET;
const NYLAS_API_KEY = process.env.NYLAS_CLIENT_SECRET; // In V3, the client secret is used as the API key
const NYLAS_API_URI = 'https://api.us.nylas.com'; // US region API URI

// Log Nylas configuration for debugging (excluding secrets)
console.log('Nylas Configuration:');
console.log('- Client ID:', NYLAS_CLIENT_ID);
console.log('- Client Secret:', NYLAS_CLIENT_SECRET ? '[SET]' : '[NOT SET]');
console.log('- API URI:', NYLAS_API_URI);

// Use your current Replit URL for the callback
// This ensures the OAuth flow can properly redirect back to your application
const REPL_SLUG = process.env.REPL_SLUG || 'workspace';
const REPL_OWNER = process.env.REPL_OWNER || 'elias134';
const NYLAS_REDIRECT_URI = `https://${REPL_SLUG}.${REPL_OWNER}.repl.co/callback`;

console.log('Using Nylas redirect URI:', NYLAS_REDIRECT_URI);
console.log('IMPORTANT: Make sure this URL is registered in the Nylas dashboard');

// Configure Nylas instance
let nylasClient;

try {
  nylasClient = new Nylas({
    apiKey: NYLAS_API_KEY,
    apiUri: NYLAS_API_URI,
  });
  console.log('Nylas SDK V3 initialized successfully');
} catch (error) {
  console.error('Failed to initialize Nylas SDK:', error);
}

// Email folder structure for organizing sent emails
const MAIN_FOLDER_NAME = 'AskEdith';
const RESOURCE_CATEGORIES = [
  'Veteran Benefits',
  'Aging Life Care Professionals',
  'Home Care Companies',
  'Government Agencies',
  'Financial Advisors'
];

/**
 * Generate an OAuth URL for connecting a user's email account
 */
export function generateNylasAuthUrl(email) {
  try {
    if (!nylasClient) {
      throw new Error('Nylas client not initialized');
    }
    
    // Detect the email provider to use appropriate parameters
    const isGmail = email.endsWith('@gmail.com');
    const isYahoo = email.endsWith('@yahoo.com');
    
    // Base configuration for all providers
    const authConfig = {
      clientId: NYLAS_CLIENT_ID,
      redirectUri: NYLAS_REDIRECT_URI,
      loginHint: email
    };
    
    // Add provider-specific parameters
    if (isGmail) {
      // Use the provided Google Cloud OAuth credentials
      const GOOGLE_CLIENT_ID = "1044417285008-shes6p79lclto98shfbhminm8ki557fm.apps.googleusercontent.com";
      const GOOGLE_CLIENT_SECRET = "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";
      
      // Gmail requires specific scopes and parameters
      authConfig.scope = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.labels'
      ];
      authConfig.access_type = 'offline'; // Request a refresh token
      authConfig.googleClientId = GOOGLE_CLIENT_ID;
      authConfig.googleClientSecret = GOOGLE_CLIENT_SECRET;
      
      console.log('Using Google OAuth credentials for authentication');
    }
    
    // Generate the OAuth URL with the appropriate configuration
    const authUrl = nylasClient.auth.urlForOAuth2(authConfig);
    
    console.log('Generated Nylas auth URL with SDK');
    return authUrl;
  } catch (error) {
    console.error('Error generating auth URL with Nylas SDK:', error);
    throw error;
  }
}

/**
 * Exchange an authorization code for a grant ID
 */
export async function exchangeCodeForToken(code) {
  try {
    if (!nylasClient) {
      throw new Error('Nylas client not initialized');
    }
    
    console.log('Exchanging code for token using Nylas SDK');
    
    // Google OAuth credentials
    const GOOGLE_CLIENT_ID = "1044417285008-shes6p79lclto98shfbhminm8ki557fm.apps.googleusercontent.com";
    const GOOGLE_CLIENT_SECRET = "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";
    
    // Exchange the authorization code for a grant ID
    const exchangeParams = {
      clientId: NYLAS_CLIENT_ID,
      clientSecret: NYLAS_CLIENT_SECRET,
      code: code,
      redirectUri: NYLAS_REDIRECT_URI,
    };
    
    // Always include Google credentials regardless of code content
    // This helps with authentication regardless of the email provider
    exchangeParams.googleClientId = GOOGLE_CLIENT_ID;
    exchangeParams.googleClientSecret = GOOGLE_CLIENT_SECRET;
    console.log('Including Google OAuth credentials for token exchange');
    
    const response = await nylasClient.auth.exchangeCodeForToken(exchangeParams);
    
    console.log('Successfully exchanged code for grant ID');
    
    // In V3, we get a grant ID instead of an access token
    return response.grantId;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Check if a user has a valid Nylas connection using the grant ID
 */
export async function checkNylasConnection(grantId) {
  if (!grantId || !nylasClient) {
    return false;
  }
  
  try {
    // Attempt to access user account with the grant ID
    const response = await nylasClient.grants.find({
      identifier: grantId,
    });
    
    return !!response;
  } catch (error) {
    console.error('Error checking Nylas connection:', error);
    return false;
  }
}

/**
 * Create the folder structure for organizing emails
 */
export async function createFolderStructure(grantId) {
  if (!grantId || !nylasClient) {
    return { success: false, error: 'No grant ID or Nylas client not initialized' };
  }
  
  try {
    // Get the grant to check provider (Gmail vs other)
    const grant = await nylasClient.grants.find({
      identifier: grantId,
    });
    
    const isGmail = grant.provider === 'gmail';
    const folderIds = {};
    
    if (isGmail) {
      // For Gmail, use labels
      const labelsResponse = await nylasClient.labels.list({
        identifier: grantId,
      });
      
      // Create or find main label
      let mainLabel = labelsResponse.data.find(label => label.name === MAIN_FOLDER_NAME);
      if (!mainLabel) {
        mainLabel = await nylasClient.labels.create({
          identifier: grantId,
          requestBody: {
            name: MAIN_FOLDER_NAME,
          },
        });
      }
      
      folderIds['main'] = mainLabel.id;
      
      // Create category labels
      for (const category of RESOURCE_CATEGORIES) {
        const labelName = `${MAIN_FOLDER_NAME}/${category}`;
        let categoryLabel = labelsResponse.data.find(label => label.name === labelName);
        
        if (!categoryLabel) {
          try {
            categoryLabel = await nylasClient.labels.create({
              identifier: grantId,
              requestBody: {
                name: labelName,
              },
            });
            folderIds[category] = categoryLabel.id;
          } catch (error) {
            console.error(`Failed to create label for ${category}:`, error);
          }
        } else {
          folderIds[category] = categoryLabel.id;
        }
      }
    } else {
      // For other providers, use folders
      const foldersResponse = await nylasClient.folders.list({
        identifier: grantId,
      });
      
      // Create or find main folder
      let mainFolder = foldersResponse.data.find(folder => folder.name === MAIN_FOLDER_NAME);
      if (!mainFolder) {
        mainFolder = await nylasClient.folders.create({
          identifier: grantId,
          requestBody: {
            name: MAIN_FOLDER_NAME,
          },
        });
      }
      
      folderIds['main'] = mainFolder.id;
      
      // Create category folders
      for (const category of RESOURCE_CATEGORIES) {
        let categoryFolder = foldersResponse.data.find(
          folder => folder.name === category && folder.parentId === mainFolder.id
        );
        
        if (!categoryFolder) {
          try {
            categoryFolder = await nylasClient.folders.create({
              identifier: grantId,
              requestBody: {
                name: category,
                parentId: mainFolder.id,
              },
            });
            folderIds[category] = categoryFolder.id;
          } catch (error) {
            console.error(`Failed to create folder for ${category}:`, error);
          }
        } else {
          folderIds[category] = categoryFolder.id;
        }
      }
    }
    
    return { success: true, folderIds };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send an email using the connected account
 */
export async function sendEmailWithNylas(grantId, emailData, category) {
  if (!grantId || !nylasClient) {
    return { success: false, error: 'No grant ID or Nylas client not initialized' };
  }
  
  try {
    // Prepare email data for the API
    const requestBody = {
      subject: emailData.subject,
      to: [{ email: emailData.to }],
      body: emailData.body,
    };
    
    // Add reply-to if available
    if (emailData.replyTo) {
      requestBody.replyTo = [{ email: emailData.replyTo }];
    }
    
    // Send the email
    const sentMessage = await nylasClient.messages.send({
      identifier: grantId,
      requestBody,
    });
    
    // Try to categorize the message
    if (category && sentMessage.id) {
      await categorizeSentMessage(grantId, sentMessage.id, category);
    }
    
    return { success: true, messageId: sentMessage.id };
  } catch (error) {
    console.error('Error sending email with Nylas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Categorize a sent message using labels or folders
 */
async function categorizeSentMessage(grantId, messageId, category) {
  try {
    // Get the grant to check provider (Gmail vs other)
    const grant = await nylasClient.grants.find({
      identifier: grantId,
    });
    
    const isGmail = grant.provider === 'gmail';
    
    if (isGmail) {
      // For Gmail, use labels
      const labelsResponse = await nylasClient.labels.list({
        identifier: grantId,
      });
      
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labelsResponse.data.find(label => label.name === labelName);
      
      if (categoryLabel) {
        // Add label to message
        await nylasClient.messages.update({
          identifier: grantId,
          id: messageId,
          requestBody: {
            labelIds: [categoryLabel.id],
          },
        });
        
        return true;
      }
    } else {
      // For other providers, use folders
      const foldersResponse = await nylasClient.folders.list({
        identifier: grantId,
      });
      
      const mainFolder = foldersResponse.data.find(folder => folder.name === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = foldersResponse.data.find(
          folder => folder.name === category && folder.parentId === mainFolder.id
        );
        
        if (categoryFolder) {
          // Move message to folder
          await nylasClient.messages.update({
            identifier: grantId,
            id: messageId,
            requestBody: {
              folderId: categoryFolder.id,
            },
          });
          
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error categorizing message:', error);
    return false;
  }
}

/**
 * Get messages from a specific category
 */
export async function getMessagesFromCategory(grantId, category, limit = 20) {
  if (!grantId || !nylasClient) {
    return [];
  }
  
  try {
    // Get the grant to check provider (Gmail vs other)
    const grant = await nylasClient.grants.find({
      identifier: grantId,
    });
    
    const isGmail = grant.provider === 'gmail';
    let containerId = null;
    
    if (isGmail) {
      // For Gmail, find the label
      const labelsResponse = await nylasClient.labels.list({
        identifier: grantId,
      });
      
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labelsResponse.data.find(label => label.name === labelName);
      
      if (categoryLabel) {
        // Get messages with the label
        const messagesResponse = await nylasClient.messages.list({
          identifier: grantId,
          queryParams: {
            labelId: categoryLabel.id,
            limit,
          },
        });
        
        return messagesResponse.data;
      }
    } else {
      // For other providers, find the folder
      const foldersResponse = await nylasClient.folders.list({
        identifier: grantId,
      });
      
      const mainFolder = foldersResponse.data.find(folder => folder.name === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = foldersResponse.data.find(
          folder => folder.name === category && folder.parentId === mainFolder.id
        );
        
        if (categoryFolder) {
          // Get messages in the folder
          const messagesResponse = await nylasClient.messages.list({
            identifier: grantId,
            queryParams: {
              folderId: categoryFolder.id,
              limit,
            },
          });
          
          return messagesResponse.data;
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error getting messages from category:', error);
    return [];
  }
}