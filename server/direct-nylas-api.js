/**
 * Direct Nylas API Integration
 * 
 * This file provides a simple, direct REST API implementation for the Nylas API
 * without any SDK dependencies, ensuring compatibility with any Nylas API version.
 */

import fetch from 'node-fetch';

// Constants
const API_BASE_URL = 'https://api.nylas.com';
const REDIRECT_URI = 'https://askcara-project.elias18.repl.co/callback';
const CLIENT_ID = process.env.NYLAS_CLIENT_ID;
const CLIENT_SECRET = process.env.NYLAS_CLIENT_SECRET;

// Resource categories for folder organization
const MAIN_FOLDER_NAME = 'AskEdith';
const RESOURCE_CATEGORIES = [
  'Veteran Benefits',
  'Aging Life Care Professionals',
  'Home Care Companies',
  'Government Agencies',
  'Financial Advisors'
];

// Validate required environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('Nylas API credentials not found. Set NYLAS_CLIENT_ID and NYLAS_CLIENT_SECRET env variables.');
} else {
  console.log('Nylas API credentials found.');
}

/**
 * Generate an OAuth URL for connecting a user's email account
 */
export function generateAuthUrl(email) {
  try {
    // Based on Nylas V3 docs, these are the scopes needed for Gmail integration
    const scopes = 'email.read_only email.modify email.send email.folders.read_only email.folders.modify';
    
    // Build the OAuth URL as a template string with proper encoding
    const authUrl = `${API_BASE_URL}/oauth/authorize` + 
                   `?client_id=${encodeURIComponent(CLIENT_ID)}` +
                   `&response_type=code` +
                   `&scope=${encodeURIComponent(scopes)}` +
                   `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                   `&login_hint=${encodeURIComponent(email)}`;
    
    console.log('Generated Nylas auth URL:', authUrl);
    return authUrl;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
}

/**
 * Exchange an authorization code for an access token
 */
export async function exchangeCodeForToken(code) {
  try {
    // Build the request body with all required OAuth parameters
    const requestBody = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    };
    
    console.log('Token exchange request:', {
      url: `${API_BASE_URL}/oauth/token`,
      body: { ...requestBody, client_secret: '***hidden***' }
    });
    
    const response = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange error response:', errorText);
      throw new Error(`Failed to exchange code: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Token exchange successful, received access token');
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Check if a user has a valid Nylas connection
 */
export async function checkNylasConnection(accessToken) {
  if (!accessToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/account`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking Nylas connection:', error);
    return false;
  }
}

/**
 * Create the AskEdith folder structure in the user's email account
 */
export async function createFolderStructure(accessToken) {
  if (!accessToken) {
    return { success: false, error: 'No access token provided' };
  }
  
  try {
    // First get account details to determine if it's Gmail or IMAP
    const accountResponse = await fetch(`${API_BASE_URL}/account`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!accountResponse.ok) {
      throw new Error(`Failed to get account: ${accountResponse.status}`);
    }
    
    const account = await accountResponse.json();
    const isGmail = account.provider === 'gmail';
    const folderIds = {};
    
    if (isGmail) {
      // Using labels for Gmail
      const labelsResponse = await fetch(`${API_BASE_URL}/labels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to get labels: ${labelsResponse.status}`);
      }
      
      const labels = await labelsResponse.json();
      
      // Create or find main label
      let mainLabel = labels.find(label => label.display_name === MAIN_FOLDER_NAME);
      if (!mainLabel) {
        const createResponse = await fetch(`${API_BASE_URL}/labels`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            display_name: MAIN_FOLDER_NAME
          })
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create main label: ${createResponse.status}`);
        }
        
        mainLabel = await createResponse.json();
      }
      
      folderIds['main'] = mainLabel.id;
      
      // Create category labels
      for (const category of RESOURCE_CATEGORIES) {
        const labelName = `${MAIN_FOLDER_NAME}/${category}`;
        let categoryLabel = labels.find(label => label.display_name === labelName);
        
        if (!categoryLabel) {
          const createResponse = await fetch(`${API_BASE_URL}/labels`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              display_name: labelName
            })
          });
          
          if (!createResponse.ok) {
            console.warn(`Failed to create label ${labelName}: ${createResponse.status}`);
            continue;
          }
          
          categoryLabel = await createResponse.json();
        }
        
        folderIds[category] = categoryLabel.id;
      }
    } else {
      // Using folders for IMAP/Exchange
      const foldersResponse = await fetch(`${API_BASE_URL}/folders`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!foldersResponse.ok) {
        throw new Error(`Failed to get folders: ${foldersResponse.status}`);
      }
      
      const folders = await foldersResponse.json();
      
      // Create or find main folder
      let mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
      if (!mainFolder) {
        const createResponse = await fetch(`${API_BASE_URL}/folders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            display_name: MAIN_FOLDER_NAME
          })
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create main folder: ${createResponse.status}`);
        }
        
        mainFolder = await createResponse.json();
      }
      
      folderIds['main'] = mainFolder.id;
      
      // Create category folders
      for (const category of RESOURCE_CATEGORIES) {
        let categoryFolder = folders.find(folder => 
          folder.display_name === category && folder.parent_id === mainFolder.id
        );
        
        if (!categoryFolder) {
          const createResponse = await fetch(`${API_BASE_URL}/folders`, {
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
          
          if (!createResponse.ok) {
            console.warn(`Failed to create folder ${category}: ${createResponse.status}`);
            continue;
          }
          
          categoryFolder = await createResponse.json();
        }
        
        folderIds[category] = categoryFolder.id;
      }
    }
    
    return { success: true, folderIds };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send an email using the user's connected account
 */
export async function sendEmailWithNylas(accessToken, emailData, category) {
  if (!accessToken) {
    return { success: false, error: 'No access token provided' };
  }
  
  try {
    // Create draft and send email
    const sendResponse = await fetch(`${API_BASE_URL}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: emailData.subject,
        to: [{ email: emailData.to, name: '' }],
        body: emailData.body,
        reply_to: emailData.replyTo ? [{ email: emailData.replyTo, name: '' }] : undefined
      })
    });
    
    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Failed to send email: ${sendResponse.status} - ${errorText}`);
    }
    
    const message = await sendResponse.json();
    
    // Try to categorize the sent message
    try {
      await categorizeSentMessage(accessToken, message.id, category);
    } catch (error) {
      console.warn('Failed to categorize message, but email was sent:', error);
    }
    
    return { success: true, messageId: message.id };
  } catch (error) {
    console.error('Error sending email with Nylas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Categorize a sent message by moving it to the appropriate folder/label
 */
async function categorizeSentMessage(accessToken, messageId, category) {
  if (!accessToken || !messageId || !category) {
    return false;
  }
  
  try {
    // First get account details to determine if it's Gmail or IMAP
    const accountResponse = await fetch(`${API_BASE_URL}/account`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!accountResponse.ok) {
      throw new Error(`Failed to get account: ${accountResponse.status}`);
    }
    
    const account = await accountResponse.json();
    const isGmail = account.provider === 'gmail';
    
    if (isGmail) {
      // Using labels for Gmail
      const labelsResponse = await fetch(`${API_BASE_URL}/labels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to get labels: ${labelsResponse.status}`);
      }
      
      const labels = await labelsResponse.json();
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.display_name === labelName);
      
      if (categoryLabel) {
        // Add label to message
        const updateResponse = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
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
      // Using folders for IMAP/Exchange
      const foldersResponse = await fetch(`${API_BASE_URL}/folders`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!foldersResponse.ok) {
        throw new Error(`Failed to get folders: ${foldersResponse.status}`);
      }
      
      const folders = await foldersResponse.json();
      const mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = folders.find(folder => 
          folder.display_name === category && folder.parent_id === mainFolder.id
        );
        
        if (categoryFolder) {
          // Move message to folder
          const updateResponse = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
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
    console.error('Error categorizing message:', error);
    return false;
  }
}

/**
 * Get messages from a specific category folder/label
 */
export async function getMessagesFromCategory(accessToken, category, limit = 20) {
  if (!accessToken || !category) {
    return [];
  }
  
  try {
    // First determine if we need to use labels or folders
    const accountResponse = await fetch(`${API_BASE_URL}/account`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!accountResponse.ok) {
      throw new Error(`Failed to get account: ${accountResponse.status}`);
    }
    
    const account = await accountResponse.json();
    const isGmail = account.provider === 'gmail';
    
    if (isGmail) {
      // Using labels for Gmail
      const labelsResponse = await fetch(`${API_BASE_URL}/labels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to get labels: ${labelsResponse.status}`);
      }
      
      const labels = await labelsResponse.json();
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.display_name === labelName);
      
      if (!categoryLabel) {
        return [];
      }
      
      const messagesResponse = await fetch(`${API_BASE_URL}/messages?in=${categoryLabel.id}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!messagesResponse.ok) {
        throw new Error(`Failed to get messages: ${messagesResponse.status}`);
      }
      
      return await messagesResponse.json();
    } else {
      // Using folders for IMAP/Exchange
      const foldersResponse = await fetch(`${API_BASE_URL}/folders`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!foldersResponse.ok) {
        throw new Error(`Failed to get folders: ${foldersResponse.status}`);
      }
      
      const folders = await foldersResponse.json();
      const mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
      
      if (!mainFolder) {
        return [];
      }
      
      const categoryFolder = folders.find(folder => 
        folder.display_name === category && folder.parent_id === mainFolder.id
      );
      
      if (!categoryFolder) {
        return [];
      }
      
      const messagesResponse = await fetch(`${API_BASE_URL}/messages?in=${categoryFolder.id}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!messagesResponse.ok) {
        throw new Error(`Failed to get messages: ${messagesResponse.status}`);
      }
      
      return await messagesResponse.json();
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}