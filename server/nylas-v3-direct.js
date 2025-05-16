/**
 * Direct Nylas V3 API Integration
 * 
 * This module provides a direct implementation of the Nylas V3 API
 * without relying on any SDK, using only native fetch for HTTP requests.
 */

import fetch from 'node-fetch';

// Nylas API constants - updated based on Nylas Support recommendation
const NYLAS_API_URI = 'https://api.us.nylas.com/v3';
const NYLAS_AUTH_URI = 'https://api.nylas.com/oauth/authorize'; // Auth still uses old endpoint
const NYLAS_TOKEN_URI = 'https://api.nylas.com/oauth/token'; // Token exchange still uses old endpoint
const NYLAS_CLIENT_ID = '12acd056-2644-46b2-9199-5d7fdcf9a86b'; // Using direct client ID
const NYLAS_CLIENT_SECRET = process.env.NYLAS_CLIENT_SECRET;
const NYLAS_REDIRECT_URI = 'https://askcara-project.elias18.repl.co/callback';

// Email folder structure
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
  // Scopes required for our application
  const scopes = [
    'email.read_only',
    'email.modify',
    'email.send',
    'email.folders.read_only',
    'email.folders.modify'
  ].join(' ');
  
  // Build the direct URL
  const url = new URL(NYLAS_AUTH_URI);
  url.searchParams.append('client_id', NYLAS_CLIENT_ID);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scopes);
  url.searchParams.append('redirect_uri', NYLAS_REDIRECT_URI);
  url.searchParams.append('login_hint', email);
  
  console.log('Nylas V3: Generated auth URL with client ID:', NYLAS_CLIENT_ID);
  return url.toString();
}

/**
 * Exchange an authorization code for an access token
 */
export async function exchangeCodeForToken(code) {
  try {
    console.log('Nylas V3: Exchanging code for token with client ID:', NYLAS_CLIENT_ID);
    
    const response = await fetch(NYLAS_TOKEN_URI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: NYLAS_CLIENT_ID,
        client_secret: NYLAS_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: NYLAS_REDIRECT_URI
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nylas V3: Token exchange error:', errorText);
      throw new Error(`Failed to exchange token: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Nylas V3: Token exchange successful');
    return data.access_token;
  } catch (error) {
    console.error('Nylas V3: Token exchange error:', error);
    throw error;
  }
}

/**
 * Get account information
 */
export async function getAccountInfo(accessToken) {
  try {
    const response = await fetch(`${NYLAS_API_URI}/account`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get account info: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting account info:', error);
    throw error;
  }
}

/**
 * Check if a Nylas connection is valid
 */
export async function checkNylasConnection(accessToken) {
  if (!accessToken) return false;
  
  try {
    const response = await fetch(`${NYLAS_API_URI}/account`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking Nylas connection:', error);
    return false;
  }
}

/**
 * Create the folder structure for our application
 */
export async function createFolderStructure(accessToken) {
  try {
    // First get account to check if it's Gmail (labels) or IMAP/Exchange (folders)
    const account = await getAccountInfo(accessToken);
    const isGmail = account.provider === 'gmail';
    const folderIds = {};
    
    if (isGmail) {
      // Get existing labels
      const labelsResponse = await fetch(`${NYLAS_API_URI}/labels`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to get labels: ${labelsResponse.status}`);
      }
      
      const labels = await labelsResponse.json();
      
      // Create or find main label
      let mainLabel = labels.find(label => label.display_name === MAIN_FOLDER_NAME);
      if (!mainLabel) {
        const createResponse = await fetch(`${NYLAS_API_URI}/labels`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ display_name: MAIN_FOLDER_NAME })
        });
        
        if (createResponse.ok) {
          mainLabel = await createResponse.json();
        } else {
          console.error('Failed to create main label:', await createResponse.text());
        }
      }
      
      if (mainLabel) {
        folderIds['main'] = mainLabel.id;
        
        // Create category labels
        for (const category of RESOURCE_CATEGORIES) {
          const labelName = `${MAIN_FOLDER_NAME}/${category}`;
          let categoryLabel = labels.find(label => label.display_name === labelName);
          
          if (!categoryLabel) {
            const createResponse = await fetch(`${NYLAS_API_URI}/labels`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ display_name: labelName })
            });
            
            if (createResponse.ok) {
              categoryLabel = await createResponse.json();
              folderIds[category] = categoryLabel.id;
            } else {
              console.error(`Failed to create ${category} label:`, await createResponse.text());
            }
          } else {
            folderIds[category] = categoryLabel.id;
          }
        }
      }
    } else {
      // For IMAP/Exchange - use folders
      const foldersResponse = await fetch(`${NYLAS_API_URI}/folders`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!foldersResponse.ok) {
        throw new Error(`Failed to get folders: ${foldersResponse.status}`);
      }
      
      const folders = await foldersResponse.json();
      
      // Create or find main folder
      let mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
      if (!mainFolder) {
        const createResponse = await fetch(`${NYLAS_API_URI}/folders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ display_name: MAIN_FOLDER_NAME })
        });
        
        if (createResponse.ok) {
          mainFolder = await createResponse.json();
        } else {
          console.error('Failed to create main folder:', await createResponse.text());
        }
      }
      
      if (mainFolder) {
        folderIds['main'] = mainFolder.id;
        
        // Create category folders
        for (const category of RESOURCE_CATEGORIES) {
          let categoryFolder = folders.find(folder => 
            folder.display_name === category && 
            folder.parent_id === mainFolder.id
          );
          
          if (!categoryFolder) {
            const createResponse = await fetch(`${NYLAS_API_URI}/folders`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                display_name: category,
                parent_id: mainFolder.id
              })
            });
            
            if (createResponse.ok) {
              categoryFolder = await createResponse.json();
              folderIds[category] = categoryFolder.id;
            } else {
              console.error(`Failed to create ${category} folder:`, await createResponse.text());
            }
          } else {
            folderIds[category] = categoryFolder.id;
          }
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
 * Send an email using the Nylas API
 */
export async function sendEmailWithNylas(accessToken, emailData, category) {
  try {
    const requestBody = {
      subject: emailData.subject,
      to: [{ email: emailData.to }],
      body: emailData.body,
    };
    
    // Add reply-to if present
    if (emailData.replyTo) {
      requestBody.reply_to = [{ email: emailData.replyTo }];
    }
    
    // Send the email
    const sendResponse = await fetch(`${NYLAS_API_URI}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Failed to send email: ${sendResponse.status} - ${errorText}`);
    }
    
    const message = await sendResponse.json();
    
    // Try to categorize the sent message
    if (category && message.id) {
      await categorizeSentMessage(accessToken, message.id, category);
    }
    
    return { success: true, messageId: message.id };
  } catch (error) {
    console.error('Error sending email with Nylas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Categorize a sent message by applying the appropriate label or moving to folder
 */
async function categorizeSentMessage(accessToken, messageId, category) {
  try {
    // First get account details to determine if it's Gmail or IMAP
    const account = await getAccountInfo(accessToken);
    const isGmail = account.provider === 'gmail';
    
    // Get folders/labels
    if (isGmail) {
      // Gmail uses labels
      const labelsResponse = await fetch(`${NYLAS_API_URI}/labels`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to get labels: ${labelsResponse.status}`);
      }
      
      const labels = await labelsResponse.json();
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.display_name === labelName);
      
      if (categoryLabel) {
        // Apply label to message
        const updateResponse = await fetch(`${NYLAS_API_URI}/messages/${messageId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ label_ids: [categoryLabel.id] })
        });
        
        return updateResponse.ok;
      }
    } else {
      // IMAP/Exchange uses folders
      const foldersResponse = await fetch(`${NYLAS_API_URI}/folders`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!foldersResponse.ok) {
        throw new Error(`Failed to get folders: ${foldersResponse.status}`);
      }
      
      const folders = await foldersResponse.json();
      const mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = folders.find(folder => 
          folder.display_name === category && 
          folder.parent_id === mainFolder.id
        );
        
        if (categoryFolder) {
          // Move message to folder
          const updateResponse = await fetch(`${NYLAS_API_URI}/messages/${messageId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder_id: categoryFolder.id })
          });
          
          return updateResponse.ok;
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
export async function getMessagesFromCategory(accessToken, category, limit = 20) {
  try {
    // Get account details
    const account = await getAccountInfo(accessToken);
    const isGmail = account.provider === 'gmail';
    
    // Find the appropriate folder/label
    let containerId = null;
    
    if (isGmail) {
      // Gmail uses labels
      const labelsResponse = await fetch(`${NYLAS_API_URI}/labels`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (labelsResponse.ok) {
        const labels = await labelsResponse.json();
        const labelName = `${MAIN_FOLDER_NAME}/${category}`;
        const categoryLabel = labels.find(label => label.display_name === labelName);
        
        if (categoryLabel) {
          containerId = categoryLabel.id;
        }
      }
    } else {
      // IMAP/Exchange uses folders
      const foldersResponse = await fetch(`${NYLAS_API_URI}/folders`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (foldersResponse.ok) {
        const folders = await foldersResponse.json();
        const mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
        
        if (mainFolder) {
          const categoryFolder = folders.find(folder => 
            folder.display_name === category && 
            folder.parent_id === mainFolder.id
          );
          
          if (categoryFolder) {
            containerId = categoryFolder.id;
          }
        }
      }
    }
    
    if (!containerId) {
      return [];
    }
    
    // Get messages in the folder/with the label
    const messagesResponse = await fetch(
      `${NYLAS_API_URI}/messages?in=${containerId}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!messagesResponse.ok) {
      throw new Error(`Failed to get messages: ${messagesResponse.status}`);
    }
    
    return await messagesResponse.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}