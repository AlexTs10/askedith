/**
 * Nylas Email Integration Service for AskEdith
 * 
 * This service provides enhanced email functionality using Nylas API:
 * 1. Connect user's email account
 * 2. Create organized folder structure
 * 3. Send emails from user's own account
 * 4. Track and manage replies to sent emails
 */

import Nylas from 'nylas';
import { URLSearchParams } from 'url';
import { EmailData } from './emailService';

// Define type interfaces for Nylas models since TypeScript definitions may be incomplete
interface Label {
  id: string;
  displayName: string;
  name?: string;
}

interface Folder {
  id: string;
  displayName: string;
  name?: string;
  parentId?: string;
}

interface Message {
  id: string;
  subject: string;
  body: string;
  to: Array<{email: string, name: string}>;
  from: Array<{email: string, name: string}>;
  replyTo?: Array<{email: string, name: string}>;
  addLabel: (labelId: string) => Promise<any>;
  moveToFolder: (folderId: string) => Promise<any>;
}

// Initialize Nylas with your client credentials
if (!process.env.NYLAS_CLIENT_ID || !process.env.NYLAS_CLIENT_SECRET) {
  console.warn('Nylas API credentials not found. Email integration features will be limited.');
}

// Initialize Nylas
const nylas = Nylas;
nylas.config({
  clientId: process.env.NYLAS_CLIENT_ID || '',
  clientSecret: process.env.NYLAS_CLIENT_SECRET || '',
});

// Resource category constants
const MAIN_FOLDER_NAME = 'AskEdith';
const RESOURCE_CATEGORIES = [
  'Veteran Benefits',
  'Aging Life Care Professionals',
  'Home Care Companies',
  'Government Agencies',
  'Financial Advisors'
];

/**
 * Generate the OAuth URL for connecting a user's email account
 * This will be used to redirect users to grant access to their email
 */
export function generateAuthUrl(email: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NYLAS_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scopes: 'email.read_only,email.send,email.modify',
    login_hint: email,
  });
  
  return `https://api.nylas.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange the authorization code for an access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  try {
    const response = await nylas.exchangeCodeForToken(code, redirectUri);
    return response.accessToken;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Create the AskEdith folder structure in the user's email account
 * This creates a main AskEdith folder with subfolders for each resource category
 */
export async function createFolderStructure(accessToken: string): Promise<{ 
  mainFolder: Folder | Label, 
  categoryFolders: Record<string, Folder | Label> 
}> {
  const nylasClient = nylas.with(accessToken);
  const account = await nylasClient.account.get();
  
  // Determine if we should use labels (Gmail) or folders (IMAP, Exchange)
  const useLabels = account.provider === 'gmail';
  
  let mainFolder: Folder | Label;
  const categoryFolders: Record<string, Folder | Label> = {};
  
  try {
    // Check if main folder already exists
    if (useLabels) {
      const labels = await nylasClient.labels.list();
      let existingMainLabel = labels.find(label => label.displayName === MAIN_FOLDER_NAME);
      
      if (!existingMainLabel) {
        // Create main label
        existingMainLabel = await nylasClient.labels.build({
          displayName: MAIN_FOLDER_NAME,
        }).save();
      }
      
      mainFolder = existingMainLabel;
      
      // Create category labels
      for (const category of RESOURCE_CATEGORIES) {
        const categoryName = `${MAIN_FOLDER_NAME}/${category}`;
        let existingCategoryLabel = labels.find(label => label.displayName === categoryName);
        
        if (!existingCategoryLabel) {
          existingCategoryLabel = await nylasClient.labels.build({
            displayName: categoryName,
          }).save();
        }
        
        categoryFolders[category] = existingCategoryLabel;
      }
    } else {
      // Using folders (IMAP, Exchange)
      const folders = await nylasClient.folders.list();
      let existingMainFolder = folders.find(folder => folder.displayName === MAIN_FOLDER_NAME);
      
      if (!existingMainFolder) {
        // Create main folder
        existingMainFolder = await nylasClient.folders.build({
          displayName: MAIN_FOLDER_NAME,
        }).save();
      }
      
      mainFolder = existingMainFolder;
      
      // Create category folders
      for (const category of RESOURCE_CATEGORIES) {
        const existingCategoryFolder = folders.find(
          folder => folder.displayName === category && folder.parentId === existingMainFolder.id
        );
        
        if (!existingCategoryFolder) {
          const newFolder = await nylasClient.folders.build({
            displayName: category,
            parentId: existingMainFolder.id,
          }).save();
          categoryFolders[category] = newFolder;
        } else {
          categoryFolders[category] = existingCategoryFolder;
        }
      }
    }
    
    return { mainFolder, categoryFolders };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    throw error;
  }
}

/**
 * Send an email using the user's connected account
 */
export async function sendEmailWithNylas(
  accessToken: string,
  data: EmailData,
  category: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    const nylasClient = nylas.with(accessToken);
    
    // Create and send the message
    const draft = nylasClient.drafts.build({
      subject: data.subject,
      body: data.body,
      to: [{ email: data.to, name: '' }],
      replyTo: data.replyTo ? { email: data.replyTo, name: '' } : undefined,
    });
    
    const message = await draft.send();
    
    // After sending, categorize the message
    try {
      await categorizeMessage(accessToken, message, category);
    } catch (categorizationError) {
      console.error('Error categorizing message:', categorizationError);
      // We don't want to fail the entire send operation if categorization fails
    }
    
    return { success: true, messageId: message.id };
  } catch (error) {
    console.error('Error sending email with Nylas:', error);
    return { success: false, error };
  }
}

/**
 * Categorize a sent message by adding it to the appropriate folder/label
 */
async function categorizeMessage(
  accessToken: string,
  message: Message,
  category: string
): Promise<void> {
  const nylasClient = nylas.with(accessToken);
  const account = await nylasClient.account.get();
  const useLabels = account.provider === 'gmail';
  
  // Find the appropriate folder/label
  if (useLabels) {
    const labels = await nylasClient.labels.list();
    const categoryName = `${MAIN_FOLDER_NAME}/${category}`;
    const categoryLabel = labels.find(label => label.displayName === categoryName);
    
    if (categoryLabel) {
      // Add the label to the message
      await message.addLabel(categoryLabel.id);
    }
  } else {
    // Using folders (IMAP, Exchange)
    const folders = await nylasClient.folders.list();
    const mainFolder = folders.find(folder => folder.displayName === MAIN_FOLDER_NAME);
    
    if (mainFolder) {
      const categoryFolder = folders.find(
        folder => folder.displayName === category && folder.parentId === mainFolder.id
      );
      
      if (categoryFolder) {
        // Move the message to the category folder
        await message.moveToFolder(categoryFolder.id);
      }
    }
  }
}

/**
 * Check if the user has a connected Nylas account
 */
export async function checkNylasConnection(accessToken: string): Promise<boolean> {
  try {
    const nylasClient = nylas.with(accessToken);
    await nylasClient.account.get();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Refresh and retrieve messages from a specific category folder
 */
export async function getMessagesFromCategory(
  accessToken: string,
  category: string,
  limit: number = 20
): Promise<Message[]> {
  const nylasClient = nylas.with(accessToken);
  const account = await nylasClient.account.get();
  const useLabels = account.provider === 'gmail';
  
  try {
    if (useLabels) {
      const labels = await nylasClient.labels.list();
      const categoryName = `${MAIN_FOLDER_NAME}/${category}`;
      const categoryLabel = labels.find(label => label.displayName === categoryName);
      
      if (!categoryLabel) {
        return [];
      }
      
      return await nylasClient.messages.list({
        in: categoryLabel.id,
        limit,
      });
    } else {
      // Using folders (IMAP, Exchange)
      const folders = await nylasClient.folders.list();
      const mainFolder = folders.find(folder => folder.displayName === MAIN_FOLDER_NAME);
      
      if (!mainFolder) {
        return [];
      }
      
      const categoryFolder = folders.find(
        folder => folder.displayName === category && folder.parentId === mainFolder.id
      );
      
      if (!categoryFolder) {
        return [];
      }
      
      return await nylasClient.messages.list({
        in: categoryFolder.id,
        limit,
      });
    }
  } catch (error) {
    console.error(`Error fetching messages from ${category}:`, error);
    return [];
  }
}

// Export the Nylas instance for use in other files
export { nylas };