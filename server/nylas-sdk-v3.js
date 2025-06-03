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

// Note: Redirect URIs are now passed directly from the calling function
// This eliminates the need for hardcoded URLs and supports multiple environments

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
 * @param {string} email - User's email address
 * @param {string} callbackUrl - Callback URL for OAuth redirect
 */
export function generateNylasAuthUrl(email, callbackUrl) {
  try {
    if (!nylasClient) {
      throw new Error('Nylas client not initialized');
    }
    
    console.log('Using Nylas redirect URI:', callbackUrl);
    
    // Detect the email provider to use appropriate parameters
    const isGmail = email.endsWith('@gmail.com');
    const isYahoo = email.endsWith('@yahoo.com');
    
    // Base configuration for all providers
    const authConfig = {
      clientId: NYLAS_CLIENT_ID,
      redirectUri: callbackUrl,
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
        'https://www.googleapis.com/auth/gmail.labels',
        'https://www.googleapis.com/auth/gmail.modify'
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
export async function exchangeCodeForToken(code, redirectUri) {
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
      redirectUri: redirectUri,
      googleClientId: GOOGLE_CLIENT_ID,
      googleClientSecret: GOOGLE_CLIENT_SECRET
    };
    
    console.log('Token exchange parameters:', {
      ...exchangeParams,
      clientSecret: '***hidden***',
      googleClientSecret: '***hidden***'
    });
    
    const response = await nylasClient.auth.exchangeCodeForToken(exchangeParams);

    const grantId = response.grantId;
    if (!grantId) {
      throw new Error(
        `Token-exchange succeeded but no grantId was returned: ${JSON.stringify(
          response,
        )}`,
      );
    }
    console.log('Successfully obtained grant ID', grantId);
    return grantId;

  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Helper function to fetch a grant directly using nylasClient.request
 * @param {string} grantId - The ID of the grant to fetch.
 * @returns {Promise<object|null>} The grant object or null if not found/error.
 */
async function fetchGrantDirectly(grantId) {
  if (!nylasClient) {
    throw new Error('Nylas client not initialized for fetchGrantDirctly');
  }
  try {
    const grantResponse = await nylasClient.request({
      method: 'GET',
      path: `/v3/grants/${grantId}`,
    });
    return grantResponse.data; // Assuming the grant data is in response.data
  } catch (error) {
    // Handle 404 specifically for "not found"
    if (error.statusCode === 404) {
      console.log(`fetchGrantDiectly: Grant ID ${grantId} not found (404).`);
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}


/**
 * Check if a user has a valid Nylas connection using the grant ID
 */
export async function checkNylasConnection(grantId) {
  if (!grantId || !nylasClient) {
    console.log('checkNylasonnection: No grantId or Nylas client not initialized.');
    return false;
  }
  
  try {
    console.log(`checkNylasCnnection: Attempting to find grant with ID: ${grantId}`);
    const grant = await fetchGrantDirectly(grantId);
    
    console.log(`checkNylasConection: Grant found:`, grant);
    return !!grant; 
  } catch (error) {
    // fetchGrantDrectly already handles 404 by returning null,
    // so this catch block is for other unexpected errors.
    console.error(`checkNylasCnnection: Error checking Nylas connection for grant ID ${grantId}:`, error);
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
    // Get all folders (labels for Gmail are also returned here)
    const foldersResponse = await nylasClient.folders.list({
      identifier: grantId,
    });

    const folders = foldersResponse.data;
    let mainFolder = folders.find(folder => folder.name === MAIN_FOLDER_NAME);

    // Create main folder if it doesn't exist
    if (!mainFolder) {
      mainFolder = await nylasClient.folders.create({
        identifier: grantId,
        requestBody: {
          name: MAIN_FOLDER_NAME,
        },
      });
    }

    const folderIds = { main: mainFolder.id };

    console.log("Folder structure creation successful:", folderIds);
    return { success: true, folderIds };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    return { success: false, error: error.message || JSON.stringify(error) };
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
    
    // Always attempt to categorize the message if sending was successful
    if (sentMessage.data && sentMessage.data.id) {
      // Call categorizeSentMessage without the category parameter
      // as it now always categorizes into the main AskEdith folder/label
      await categorizeSentMessage(grantId, sentMessage.data.id);
    }
    
    return { success: true, messageId: sentMessage.data ? sentMessage.data.id : null };
  } catch (error) {
    console.error('Error sending email with Nylas:', error);
    return { success: false, error: error.message || JSON.stringify(error) };
  }
}

/**
 * Categorize a sent message by applying the main 'AskEdith' folder/label.
 * Aligns with Nylas V3 best practice of using the `folders` array in the
 * message update request body for both folders and labels.
 */
async function categorizeSentMessage(grantId, messageId) {
  try {
    if (!nylasClient) {
      throw new Error('Nylas client not initialized for categorizeSentMessage');
    }

    // List all folders and labels for the grant.
    // The Folders API endpoint is unified for both.
    const allFoldersAndLabels = await nylasClient.folders.list({ identifier: grantId });
    
    // Find the 'AskEdith' folder/label by its name.
    const askEdithFolder = allFoldersAndLabels.data.find(item => item.name === MAIN_FOLDER_NAME);

    if (askEdithFolder && askEdithFolder.id) {
      // Apply the folder/label to the message.
      // The `folders` array in the request body is used for both applying labels (Gmail)
      // and moving to folders (other providers).
      await nylasClient.messages.update({
        identifier: grantId,
        messageId: messageId,
        requestBody: {
          // Use the 'folders' field with the ID of the 'AskEdith' folder/label.
          // This is the unified approach as per V3 documentation for organizing messages.
          folders: [askEdithFolder.id],
        },
      });
      console.log(`Message ${messageId} successfully categorized into '${MAIN_FOLDER_NAME}' (ID: ${askEdithFolder.id}).`);
      return true;
    } else {
      console.warn(`Could not find the '${MAIN_FOLDER_NAME}' folder/label for grant ID ${grantId}. Message ${messageId} not categorized.`);
      return false;
    }
  } catch (error) {
    console.error(`Error categorizing message ${messageId} for grant ID ${grantId}:`, error);
    // Log more detailed error if available from Nylas API response
    if (error.response && error.response.data) {
      console.error('Nylas API Error details:', error.response.data);
    }
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
    const grant = await fetchGrantDirectly(grantId);
    if (!grant) {
      console.error(`GetMessages: Grant with ID ${grantId} not found.`);
      return [];
    }
    
    const isGmail = grant.provider === 'gmail';
    
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