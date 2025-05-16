/**
 * Nylas Email Integration Service for AskEdith
 * 
 * This service handles integration with the Nylas API to:
 * 1. Allow users to connect their email accounts
 * 2. Create organized folder structures for resource categories
 * 3. Send emails from the user's account
 * 4. Route and organize replies
 */

import Nylas from 'nylas';
import { EmailData } from './emailService';

// Resource categories
const MAIN_FOLDER_NAME = 'AskEdith';
const RESOURCE_CATEGORIES = [
  'Veteran Benefits',
  'Aging Life Care Professionals',
  'Home Care Companies',
  'Government Agencies',
  'Financial Advisors'
];

// Initialize Nylas with environment variables
Nylas.config({
  clientId: process.env.NYLAS_CLIENT_ID,
  clientSecret: process.env.NYLAS_CLIENT_SECRET
});

// Log the initialization status
if (!process.env.NYLAS_CLIENT_ID || !process.env.NYLAS_CLIENT_SECRET) {
  console.warn('Nylas API credentials not found or incomplete. Email integration will be limited.');
} else {
  console.log('Nylas credentials found. Email integration is available.');
}

/**
 * Generate an OAuth URL for connecting a user's email account
 */
export function generateAuthUrl(email: string, redirectUri: string): string {
  return Nylas.urlForAuthentication({
    redirectURI: redirectUri,
    loginHint: email,
    scopes: ['email.modify', 'email.send']
  });
}

/**
 * Exchange an authorization code for an access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  try {
    const token = await Nylas.exchangeCodeForToken(code);
    return token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to authenticate with email provider');
  }
}

/**
 * Create the AskEdith folder structure in the user's email account
 */
export async function createFolderStructure(accessToken: string): Promise<{
  success: boolean;
  folderIds?: Record<string, string>;
  error?: any;
}> {
  try {
    // Create a Nylas client with the user's access token
    const nylas = Nylas.with(accessToken);
    const account = await nylas.account.get();
    
    // Determine if we should use labels (Gmail) or folders (IMAP)
    const isGmail = account.provider === 'gmail';
    const folderIds: Record<string, string> = {};
    
    if (isGmail) {
      // Using labels for Gmail
      const labels = await nylas.labels.list();
      
      // Create or find main label
      let mainLabel = labels.find((label: any) => label.displayName === MAIN_FOLDER_NAME);
      if (!mainLabel) {
        mainLabel = await nylas.labels.build({
          displayName: MAIN_FOLDER_NAME
        }).save();
      }
      folderIds['main'] = mainLabel.id;
      
      // Create category labels
      for (const category of RESOURCE_CATEGORIES) {
        const labelName = `${MAIN_FOLDER_NAME}/${category}`;
        let categoryLabel = labels.find((label: any) => label.displayName === labelName);
        
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
      let mainFolder = folders.find((folder: any) => folder.displayName === MAIN_FOLDER_NAME);
      if (!mainFolder) {
        mainFolder = await nylas.folders.build({
          displayName: MAIN_FOLDER_NAME
        }).save();
      }
      folderIds['main'] = mainFolder.id;
      
      // Create category folders
      for (const category of RESOURCE_CATEGORIES) {
        let categoryFolder = folders.find((folder: any) => 
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
export async function sendEmailWithNylas(
  accessToken: string,
  emailData: EmailData,
  category: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
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
async function categorizeSentMessage(
  accessToken: string,
  messageId: string,
  category: string
): Promise<boolean> {
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
      const categoryLabel = labels.find((label: any) => label.displayName === labelName);
      
      if (categoryLabel) {
        await message.addLabel(categoryLabel.id);
        return true;
      }
    } else {
      // Using folders for IMAP/Exchange
      const folders = await nylas.folders.list();
      const mainFolder = folders.find((folder: any) => folder.displayName === MAIN_FOLDER_NAME);
      
      if (mainFolder) {
        const categoryFolder = folders.find((folder: any) => 
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
export async function checkNylasConnection(accessToken: string): Promise<boolean> {
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
export async function getMessagesFromCategory(
  accessToken: string,
  category: string,
  limit: number = 20
): Promise<any[]> {
  try {
    const nylas = Nylas.with(accessToken);
    const account = await nylas.account.get();
    const isGmail = account.provider === 'gmail';
    
    if (isGmail) {
      // Using labels for Gmail
      const labels = await nylas.labels.list();
      const labelName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find((label: any) => label.displayName === labelName);
      
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
      const mainFolder = folders.find((folder: any) => folder.displayName === MAIN_FOLDER_NAME);
      
      if (!mainFolder) {
        return [];
      }
      
      const categoryFolder = folders.find((folder: any) => 
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