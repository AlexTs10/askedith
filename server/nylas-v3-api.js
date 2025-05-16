/**
 * Nylas V3 API Direct Implementation
 * 
 * This module implements the Nylas V3 API directly, using the endpoints
 * and authentication flow documented in the Nylas V3 API reference.
 */

import fetch from 'node-fetch';

// Nylas API V3 configuration
const NYLAS_AUTH_API_URI = 'https://api.nylas.com'; // Auth API is still on the old domain
const NYLAS_API_URI = 'https://api.us.nylas.com/v3'; // V3 API endpoint
const NYLAS_CLIENT_ID = '12acd056-2644-46b2-9199-5d7fdcf9a86b';
const NYLAS_CLIENT_SECRET = process.env.NYLAS_CLIENT_SECRET;
const NYLAS_REDIRECT_URI = 'https://askcara-project.elias18.repl.co/callback';

// Email folder structure constants
const MAIN_FOLDER_NAME = 'AskEdith';
const RESOURCE_CATEGORIES = [
  'Veteran Benefits',
  'Aging Life Care Professionals',
  'Home Care Companies',
  'Government Agencies',
  'Financial Advisors'
];

console.log('Nylas V3 API module loaded with client ID:', NYLAS_CLIENT_ID);

/**
 * Generate an OAuth URL for connecting a user's email account
 * Using the V3 OAuth flow
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
  
  // Build authentication URL with proper parameters
  const authUrl = `${NYLAS_AUTH_API_URI}/oauth/authorize?` +
                 `client_id=${encodeURIComponent(NYLAS_CLIENT_ID)}` +
                 `&response_type=code` +
                 `&scope=${encodeURIComponent(scopes)}` +
                 `&redirect_uri=${encodeURIComponent(NYLAS_REDIRECT_URI)}` +
                 `&login_hint=${encodeURIComponent(email)}`;
  
  console.log('Nylas V3: Generated auth URL for OAuth flow');
  return authUrl;
}

/**
 * Exchange an authorization code for an access token
 * Using the V3 token exchange flow
 */
export async function exchangeCodeForToken(code) {
  try {
    console.log('Nylas V3: Exchanging code for token...');
    
    // Build the token exchange request
    const tokenUrl = `${NYLAS_AUTH_API_URI}/oauth/token`;
    const tokenRequestBody = {
      client_id: NYLAS_CLIENT_ID,
      client_secret: NYLAS_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: NYLAS_REDIRECT_URI
    };
    
    // Make the token exchange request
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequestBody)
    });
    
    // Handle the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nylas V3: Token exchange error:', errorText);
      throw new Error(`Failed to exchange token: ${response.status} - ${errorText}`);
    }
    
    // Parse and return the token
    const data = await response.json();
    console.log('Nylas V3: Token exchange successful');
    return data.access_token;
  } catch (error) {
    console.error('Nylas V3: Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Check if a Nylas connection is valid
 */
export async function checkNylasConnection(accessToken) {
  if (!accessToken) return false;
  
  try {
    const response = await fetch(`${NYLAS_API_URI}/grants/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Nylas V3: Error checking connection:', error);
    return false;
  }
}

/**
 * Create the AskEdith folder structure in the user's email account
 */
export async function createFolderStructure(accessToken) {
  try {
    // Get user's email provider info
    const accountInfo = await fetch(`${NYLAS_API_URI}/grants/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!accountInfo.ok) {
      throw new Error(`Failed to get account info: ${accountInfo.status}`);
    }
    
    const account = await accountInfo.json();
    const isGmail = account.provider === 'gmail';
    const folderIds = {};
    
    if (isGmail) {
      // For Gmail, use labels
      // First list existing labels
      const labelsResponse = await fetch(`${NYLAS_API_URI}/labels`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to get labels: ${labelsResponse.status}`);
      }
      
      const labels = await labelsResponse.json();
      
      // Create or find main label
      let mainLabel = labels.data.find(label => label.name === MAIN_FOLDER_NAME);
      if (!mainLabel) {
        const createResponse = await fetch(`${NYLAS_API_URI}/labels`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: MAIN_FOLDER_NAME })
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
          let categoryLabel = labels.data.find(label => label.name === labelName);
          
          if (!categoryLabel) {
            const createResponse = await fetch(`${NYLAS_API_URI}/labels`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name: labelName })
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
      // For other providers, use folders
      const foldersResponse = await fetch(`${NYLAS_API_URI}/folders`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!foldersResponse.ok) {
        throw new Error(`Failed to get folders: ${foldersResponse.status}`);
      }
      
      const folders = await foldersResponse.json();
      
      // Create or find main folder
      let mainFolder = folders.data.find(folder => folder.name === MAIN_FOLDER_NAME);
      if (!mainFolder) {
        const createResponse = await fetch(`${NYLAS_API_URI}/folders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: MAIN_FOLDER_NAME })
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
          let categoryFolder = folders.data.find(folder => 
            folder.name === category && 
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
                name: category,
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
    console.error('Nylas V3: Error creating folder structure:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send an email using the user's connected account
 */
export async function sendEmailWithNylas(accessToken, emailData, category) {
  try {
    // Prepare the email request
    const sendRequest = {
      subject: emailData.subject,
      to: [{ email: emailData.to }],
      body: emailData.body,
      from: emailData.from ? { email: emailData.from } : undefined,
      reply_to: emailData.replyTo ? [{ email: emailData.replyTo }] : undefined
    };
    
    // Send the email using the V3 API
    const sendResponse = await fetch(`${NYLAS_API_URI}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendRequest)
    });
    
    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Failed to send email: ${sendResponse.status} - ${errorText}`);
    }
    
    const message = await sendResponse.json();
    
    // Organize the sent message into the appropriate category folder/label
    if (category && message.id) {
      await categorizeSentMessage(accessToken, message.id, category);
    }
    
    return { success: true, messageId: message.id };
  } catch (error) {
    console.error('Nylas V3: Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Categorize a sent message by applying the appropriate label or moving to folder
 */
async function categorizeSentMessage(accessToken, messageId, category) {
  try {
    // First determine if we're working with Gmail (labels) or another provider (folders)
    const accountInfo = await fetch(`${NYLAS_API_URI}/grants/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!accountInfo.ok) {
      throw new Error(`Failed to get account info: ${accountInfo.status}`);
    }
    
    const account = await accountInfo.json();
    const isGmail = account.provider === 'gmail';
    
    if (isGmail) {
      // For Gmail, apply labels
      const labelsResponse = await fetch(`${NYLAS_API_URI}/labels`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to get labels: ${labelsResponse.status}`);
      }
      
      const labels = await labelsResponse.json();
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.data.find(label => label.name === labelName);
      
      if (categoryLabel) {
        // Apply label to message
        const updateResponse = await fetch(`${NYLAS_API_URI}/messages/${messageId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            label_ids: [categoryLabel.id] 
          })
        });
        
        return updateResponse.ok;
      }
    } else {
      // For other providers, move to folder
      const foldersResponse = await fetch(`${NYLAS_API_URI}/folders`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!foldersResponse.ok) {
        throw new Error(`Failed to get folders: ${foldersResponse.status}`);
      }
      
      const folders = await foldersResponse.json();
      const mainFolder = folders.data.find(folder => folder.name === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = folders.data.find(folder => 
          folder.name === category && 
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
            body: JSON.stringify({ 
              folder_id: categoryFolder.id 
            })
          });
          
          return updateResponse.ok;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Nylas V3: Error categorizing message:', error);
    return false;
  }
}

/**
 * Get messages from a specific category folder/label
 */
export async function getMessagesFromCategory(accessToken, category, limit = 20) {
  try {
    // Determine if we're working with Gmail or another provider
    const accountInfo = await fetch(`${NYLAS_API_URI}/grants/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!accountInfo.ok) {
      throw new Error(`Failed to get account info: ${accountInfo.status}`);
    }
    
    const account = await accountInfo.json();
    const isGmail = account.provider === 'gmail';
    
    // Find the appropriate folder/label ID for the category
    let containerId = null;
    
    if (isGmail) {
      // For Gmail, find the label
      const labelsResponse = await fetch(`${NYLAS_API_URI}/labels`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (labelsResponse.ok) {
        const labels = await labelsResponse.json();
        const labelName = `${MAIN_FOLDER_NAME}/${category}`;
        const categoryLabel = labels.data.find(label => label.name === labelName);
        
        if (categoryLabel) {
          containerId = categoryLabel.id;
        }
      }
    } else {
      // For other providers, find the folder
      const foldersResponse = await fetch(`${NYLAS_API_URI}/folders`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (foldersResponse.ok) {
        const folders = await foldersResponse.json();
        const mainFolder = folders.data.find(folder => folder.name === MAIN_FOLDER_NAME);
        
        if (mainFolder) {
          const categoryFolder = folders.data.find(folder => 
            folder.name === category && 
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
    
    // Fetch messages in the folder/with the label
    const queryParams = isGmail 
      ? `label_id=${containerId}&limit=${limit}`
      : `folder_id=${containerId}&limit=${limit}`;
      
    const messagesResponse = await fetch(`${NYLAS_API_URI}/messages?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!messagesResponse.ok) {
      throw new Error(`Failed to get messages: ${messagesResponse.status}`);
    }
    
    const messages = await messagesResponse.json();
    return messages.data || [];
  } catch (error) {
    console.error('Nylas V3: Error fetching messages:', error);
    return [];
  }
}