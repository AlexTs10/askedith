/**
 * Nylas Direct API Integration Helper
 * 
 * This file provides JavaScript functions to interact directly with the Nylas API
 * endpoints rather than using their SDK, which gives us more control over the requests.
 */

import fetch from 'node-fetch';

// Base URL for Nylas API
const API_BASE_URL = 'https://api.nylas.com';

// Resource categories
const MAIN_FOLDER_NAME = 'AskEdith';
const RESOURCE_CATEGORIES = [
  'Veteran Benefits',
  'Aging Life Care Professionals',
  'Home Care Companies',
  'Government Agencies',
  'Financial Advisors'
];

// Check if Nylas API credentials are available
if (!process.env.NYLAS_CLIENT_ID || !process.env.NYLAS_CLIENT_SECRET) {
  console.warn('Nylas API credentials not found or incomplete. Email integration will be limited.');
} else {
  console.log('Nylas credentials found. Email integration is available.');
}

/**
 * Generate an OAuth URL for connecting a user's email account
 */
export function generateAuthUrl(email, redirectUri) {
  try {
    // Ensure the scope format is correct - use space-separated scopes instead of comma-separated
    const scopes = 'email.modify email.send';
    const url = new URL(`${API_BASE_URL}/oauth/authorize`);
    url.searchParams.append('client_id', process.env.NYLAS_CLIENT_ID);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scopes', scopes);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('login_hint', email);
    
    console.log('Generated Nylas auth URL:', url.toString());
    return url.toString();
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
}

/**
 * Exchange an authorization code for an access token
 */
export async function exchangeCodeForToken(code, redirectUri) {
  try {
    console.log('Exchanging code for token with redirect URI:', redirectUri);
    
    const requestBody = {
      client_id: process.env.NYLAS_CLIENT_ID,
      client_secret: process.env.NYLAS_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
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
 * Make an authenticated request to the Nylas API
 */
async function nylasRequest(accessToken, endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nylas API error (${response.status}): ${errorText}`);
    }
    
    if (response.status === 204) { // No content
      return true;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Nylas request error:', error);
    throw error;
  }
}

/**
 * Get account information
 */
export async function getAccount(accessToken) {
  return nylasRequest(accessToken, '/account');
}

/**
 * Check if a user has a valid Nylas connection
 */
export async function checkNylasConnection(accessToken) {
  try {
    await getAccount(accessToken);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get all labels (for Gmail)
 */
async function getLabels(accessToken) {
  return nylasRequest(accessToken, '/labels');
}

/**
 * Create a new label (for Gmail)
 */
async function createLabel(accessToken, displayName) {
  return nylasRequest(accessToken, '/labels', 'POST', { 
    display_name: displayName 
  });
}

/**
 * Get all folders (for IMAP)
 */
async function getFolders(accessToken) {
  return nylasRequest(accessToken, '/folders');
}

/**
 * Create a new folder (for IMAP)
 */
async function createFolder(accessToken, displayName, parentId = null) {
  const body = { display_name: displayName };
  if (parentId) {
    body.parent_id = parentId;
  }
  return nylasRequest(accessToken, '/folders', 'POST', body);
}

/**
 * Create the AskEdith folder structure in the user's email account
 */
export async function createFolderStructure(accessToken) {
  try {
    // Get account info to determine provider
    const account = await getAccount(accessToken);
    const isGmail = account.provider === 'gmail';
    const folderIds = {};
    
    if (isGmail) {
      // Using labels for Gmail
      const labels = await getLabels(accessToken);
      
      // Create or find main label
      let mainLabel = labels.find(label => label.display_name === MAIN_FOLDER_NAME);
      if (!mainLabel) {
        mainLabel = await createLabel(accessToken, MAIN_FOLDER_NAME);
      }
      folderIds['main'] = mainLabel.id;
      
      // Create category labels
      for (const category of RESOURCE_CATEGORIES) {
        const labelName = `${MAIN_FOLDER_NAME}/${category}`;
        let categoryLabel = labels.find(label => label.display_name === labelName);
        
        if (!categoryLabel) {
          categoryLabel = await createLabel(accessToken, labelName);
        }
        
        folderIds[category] = categoryLabel.id;
      }
    } else {
      // Using folders for IMAP/Exchange
      const folders = await getFolders(accessToken);
      
      // Create or find main folder
      let mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
      if (!mainFolder) {
        mainFolder = await createFolder(accessToken, MAIN_FOLDER_NAME);
      }
      folderIds['main'] = mainFolder.id;
      
      // Create category folders
      for (const category of RESOURCE_CATEGORIES) {
        let categoryFolder = folders.find(folder => 
          folder.display_name === category && folder.parent_id === mainFolder.id
        );
        
        if (!categoryFolder) {
          categoryFolder = await createFolder(accessToken, category, mainFolder.id);
        }
        
        folderIds[category] = categoryFolder.id;
      }
    }
    
    return { success: true, folderIds };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    return { success: false, error };
  }
}

/**
 * Send an email using the user's connected account
 */
export async function sendEmailWithNylas(accessToken, emailData, category) {
  try {
    // Build draft content
    const draftData = {
      subject: emailData.subject,
      to: [{ email: emailData.to, name: '' }],
      body: emailData.body,
    };
    
    if (emailData.replyTo) {
      draftData.reply_to = [{ email: emailData.replyTo, name: '' }];
    }
    
    // Send the email
    const message = await nylasRequest(accessToken, '/send', 'POST', draftData);
    
    // Try to categorize the sent message
    try {
      await categorizeSentMessage(accessToken, message.id, category);
    } catch (error) {
      console.warn('Failed to categorize message, but email was sent:', error);
    }
    
    return { success: true, messageId: message.id };
  } catch (error) {
    console.error('Error sending email with Nylas:', error);
    return { success: false, error };
  }
}

/**
 * Add a label to a message (Gmail)
 */
async function addLabelToMessage(accessToken, messageId, labelId) {
  return nylasRequest(accessToken, `/messages/${messageId}`, 'PUT', {
    label_ids: [labelId]
  });
}

/**
 * Move a message to a folder (IMAP)
 */
async function moveMessageToFolder(accessToken, messageId, folderId) {
  return nylasRequest(accessToken, `/messages/${messageId}`, 'PUT', {
    folder_id: folderId
  });
}

/**
 * Categorize a sent message by moving it to the appropriate folder/label
 */
async function categorizeSentMessage(accessToken, messageId, category) {
  try {
    // Get account info to determine provider
    const account = await getAccount(accessToken);
    const isGmail = account.provider === 'gmail';
    
    // Find the appropriate folder/label for this category
    if (isGmail) {
      // Using labels for Gmail
      const labels = await getLabels(accessToken);
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.display_name === labelName);
      
      if (categoryLabel) {
        await addLabelToMessage(accessToken, messageId, categoryLabel.id);
        return true;
      }
    } else {
      // Using folders for IMAP/Exchange
      const folders = await getFolders(accessToken);
      const mainFolder = folders.find(folder => folder.display_name === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = folders.find(folder => 
          folder.display_name === category && folder.parent_id === mainFolder.id
        );
        
        if (categoryFolder) {
          await moveMessageToFolder(accessToken, messageId, categoryFolder.id);
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
 * Get messages from a specific category folder/label
 */
export async function getMessagesFromCategory(accessToken, category, limit = 20) {
  try {
    // Get account info to determine provider
    const account = await getAccount(accessToken);
    const isGmail = account.provider === 'gmail';
    
    // Find the appropriate folder/label ID for this category
    let categoryId = null;
    
    if (isGmail) {
      // Using labels for Gmail
      const labels = await getLabels(accessToken);
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.display_name === labelName);
      
      if (!categoryLabel) {
        return [];
      }
      
      categoryId = categoryLabel.id;
    } else {
      // Using folders for IMAP/Exchange
      const folders = await getFolders(accessToken);
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
      
      categoryId = categoryFolder.id;
    }
    
    // Get messages from the category
    const endpoint = isGmail 
      ? `/messages?in=${categoryId}&limit=${limit}`
      : `/messages?in_folder=${categoryId}&limit=${limit}`;
    
    return await nylasRequest(accessToken, endpoint);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}