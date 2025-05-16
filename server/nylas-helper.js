/**
 * Nylas API Integration Helper
 * 
 * This file provides JavaScript functions to interact with the Nylas API
 * without TypeScript constraints, allowing us to work with the actual SDK structure.
 */

import Nylas from 'nylas';

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
  
  // Configure Nylas with credentials
  Nylas.config({
    clientId: process.env.NYLAS_CLIENT_ID,
    clientSecret: process.env.NYLAS_CLIENT_SECRET
  });
}

/**
 * Generate an OAuth URL for connecting a user's email account
 */
export function generateAuthUrl(email, redirectUri) {
  try {
    return Nylas.urlForAuthentication({
      redirectURI: redirectUri,
      loginHint: email,
      scopes: ['email.modify', 'email.send']
    });
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
    const token = await Nylas.exchangeCodeForToken(code);
    return token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Create the AskEdith folder structure in the user's email account
 */
export async function createFolderStructure(accessToken) {
  try {
    // Create a Nylas client with the user's access token
    const nylas = Nylas.with(accessToken);
    const account = await nylas.account.get();
    
    // Determine if we should use labels (Gmail) or folders (IMAP)
    const isGmail = account.provider === 'gmail';
    const folderIds = {};
    
    if (isGmail) {
      // Using labels for Gmail
      const labels = await nylas.labels.list();
      
      // Create or find main label
      let mainLabel = labels.find(label => label.displayName === MAIN_FOLDER_NAME);
      if (!mainLabel) {
        mainLabel = await nylas.labels.build({
          displayName: MAIN_FOLDER_NAME
        }).save();
      }
      folderIds['main'] = mainLabel.id;
      
      // Create category labels
      for (const category of RESOURCE_CATEGORIES) {
        const labelName = `${MAIN_FOLDER_NAME}/${category}`;
        let categoryLabel = labels.find(label => label.displayName === labelName);
        
        if (!categoryLabel) {
          categoryLabel = await nylas.labels.build({
            displayName: labelName
          }).save();
        }
        
        folderIds[category] = categoryLabel.id;
      }
    } else {
      // Using folders for IMAP/Exchange
      const folders = await nylas.folders.list();
      
      // Create or find main folder
      let mainFolder = folders.find(folder => folder.displayName === MAIN_FOLDER_NAME);
      if (!mainFolder) {
        mainFolder = await nylas.folders.build({
          displayName: MAIN_FOLDER_NAME
        }).save();
      }
      folderIds['main'] = mainFolder.id;
      
      // Create category folders
      for (const category of RESOURCE_CATEGORIES) {
        let categoryFolder = folders.find(folder => 
          folder.displayName === category && folder.parentId === mainFolder.id
        );
        
        if (!categoryFolder) {
          categoryFolder = await nylas.folders.build({
            displayName: category,
            parentId: mainFolder.id
          }).save();
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
    const nylas = Nylas.with(accessToken);
    
    // Create draft
    const draft = nylas.drafts.build({
      subject: emailData.subject,
      to: [{ email: emailData.to, name: '' }],
      body: emailData.body,
      replyTo: emailData.replyTo ? [{ email: emailData.replyTo, name: '' }] : undefined
    });
    
    // Send the email
    const message = await draft.send();
    
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
 * Categorize a sent message by moving it to the appropriate folder/label
 */
async function categorizeSentMessage(accessToken, messageId, category) {
  try {
    const nylas = Nylas.with(accessToken);
    const account = await nylas.account.get();
    const isGmail = account.provider === 'gmail';
    
    // Get the message object
    const message = await nylas.messages.find(messageId);
    
    if (isGmail) {
      // Using labels for Gmail
      const labels = await nylas.labels.list();
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.displayName === labelName);
      
      if (categoryLabel) {
        await message.addLabel(categoryLabel.id);
        return true;
      }
    } else {
      // Using folders for IMAP/Exchange
      const folders = await nylas.folders.list();
      const mainFolder = folders.find(folder => folder.displayName === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = folders.find(folder => 
          folder.displayName === category && folder.parentId === mainFolder.id
        );
        
        if (categoryFolder) {
          await message.moveToFolder(categoryFolder.id);
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
 * Check if a user has a valid Nylas connection
 */
export async function checkNylasConnection(accessToken) {
  try {
    const nylas = Nylas.with(accessToken);
    await nylas.account.get();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get messages from a specific category folder/label
 */
export async function getMessagesFromCategory(accessToken, category, limit = 20) {
  try {
    const nylas = Nylas.with(accessToken);
    const account = await nylas.account.get();
    const isGmail = account.provider === 'gmail';
    
    if (isGmail) {
      // Using labels for Gmail
      const labels = await nylas.labels.list();
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.displayName === labelName);
      
      if (!categoryLabel) {
        return [];
      }
      
      return await nylas.messages.list({
        in: categoryLabel.id,
        limit
      });
    } else {
      // Using folders for IMAP/Exchange
      const folders = await nylas.folders.list();
      const mainFolder = folders.find(folder => folder.displayName === MAIN_FOLDER_NAME);
      
      if (!mainFolder) {
        return [];
      }
      
      const categoryFolder = folders.find(folder => 
        folder.displayName === category && folder.parentId === mainFolder.id
      );
      
      if (!categoryFolder) {
        return [];
      }
      
      return await nylas.messages.list({
        in: categoryFolder.id,
        limit
      });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}