/**
 * Email Service for AskEdith
 * 
 * This service handles email sending with support for high volume processing.
 * In production, it will use SendGrid and a queue system to handle 40,000+ users/month.
 * For development, it uses a simple fallback mode that logs to console.
 */

import { storage } from './storage';
import { type InsertEmailLog } from '@shared/schema';
import sgMail from '@sendgrid/mail';

// Email service configuration
const DEFAULT_FROM_EMAIL = 'noreply@askedith.org';
const MAX_RETRY_ATTEMPTS = 3;
const RATE_LIMIT_DELAY = 1000; // 1 second between emails for rate limiting

// Import configuration module
import { getSendGridApiKey, isSendGridConfigured } from './config';

// Initialize SendGrid
export async function initializeSendGrid() {
  try {
    // Check if SendGrid is configured
    const configured = await isSendGridConfigured();
    
    if (configured) {
      // Load the API key from config
      const apiKey = await getSendGridApiKey();
      
      // Set the API key
      if (apiKey) {
        sgMail.setApiKey(apiKey);
        console.log('SendGrid initialized successfully');
        return true;
      }
    }
    
    // Also check environment variable as fallback
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('SendGrid initialized from environment variable');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing SendGrid:', error);
    return false;
  }
}

// Initialize SendGrid on module load
let sendgridInitialized = false;
initializeSendGrid().then(result => {
  sendgridInitialized = result;
});

// Email Providers - providing multiple fallbacks for reliability
enum EmailProvider {
  SENDGRID = 'sendgrid',
  NODEMAILER = 'nodemailer',
  FALLBACK = 'fallback'
}

// Email Priority Levels
enum EmailPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  BULK = 'bulk'
}

// Interface for email data
export interface EmailData {
  to: string;
  from?: string; // Includes the sender's name and email
  replyTo?: string; // User's actual email for replies
  subject: string;
  body: string;
  resourceId?: number;
  questionnaireId?: number;
  userId?: number;
  priority?: EmailPriority;
  retryCount?: number;
}

// Queue system for handling high volume
class EmailQueue {
  private queue: EmailData[] = [];
  private processing = false;
  private rateLimitedUntil = 0;
  
  // Add email to the queue
  public add(email: EmailData): void {
    // Set defaults
    email.priority = email.priority || EmailPriority.NORMAL;
    email.retryCount = email.retryCount || 0;
    
    // Add to queue based on priority
    if (email.priority === EmailPriority.HIGH) {
      // High priority goes to the front
      this.queue.unshift(email);
    } else {
      // Others go to the back
      this.queue.push(email);
    }
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  // Add multiple emails to the queue
  public addBatch(emails: EmailData[]): void {
    emails.forEach(email => this.add(email));
  }
  
  // Process the email queue
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    
    // Check rate limiting
    const now = Date.now();
    if (now < this.rateLimitedUntil) {
      // We're rate limited, wait and try again
      const delay = this.rateLimitedUntil - now;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
      const email = this.queue.shift();
      
      if (email) {
        // Process this email
        const success = await processEmailSend(email);
        
        if (!success && (email.retryCount || 0) < MAX_RETRY_ATTEMPTS) {
          // Failed but can retry
          email.retryCount = (email.retryCount || 0) + 1;
          
          // Put back in queue with exponential backoff
          const backoffDelay = Math.pow(2, email.retryCount || 1) * 1000;
          setTimeout(() => this.add(email), backoffDelay);
        }
      }
      
      // Rate limit ourselves
      this.rateLimitedUntil = Date.now() + RATE_LIMIT_DELAY;
      
      // Process next item with a delay
      setTimeout(() => this.processQueue(), RATE_LIMIT_DELAY);
    } catch (error) {
      console.error('Error processing email queue:', error);
      // Continue processing after a delay
      setTimeout(() => this.processQueue(), RATE_LIMIT_DELAY * 2);
    }
  }
  
  // Get queue stats
  public getStats(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.queue.length,
      isProcessing: this.processing
    };
  }
}

// Create the email queue
const emailQueue = new EmailQueue();

// Fallback for development/testing - just log to console
async function sendWithFallback(data: EmailData): Promise<boolean> {
  // TESTING MODE: Override recipient with test email (even in fallback mode)
  const testEmail = "elias@secondactfs.com";
  const originalRecipient = data.to;
  
  console.log('==== EMAIL SENT (DEVELOPMENT MODE) ====');
  console.log(`From: ${data.from || DEFAULT_FROM_EMAIL}`);
  console.log(`To: ${testEmail} (Original: ${originalRecipient})`);
  console.log(`Subject: [TEST] ${data.subject}`);
  console.log(`Body: \n${data.body}\n\n[TEST MODE] Original recipient: ${originalRecipient}`);
  console.log('======================================');
  return true;
}

// SendGrid implementation
async function sendWithSendGrid(data: EmailData): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not set, falling back to development mode');
      return sendWithFallback(data);
    }
    
    // TESTING MODE: Override recipient with test email
    const testEmail = "elias@secondactfs.com";
    
    // Ensure the 'from' email is properly formatted 
    let fromEmail = data.from || DEFAULT_FROM_EMAIL;
    
    console.log('Original from email format:', fromEmail);
    
    // Check if from email is properly formatted with both name and email
    if (!fromEmail.includes('@') || !fromEmail.includes('<') || !fromEmail.includes('>')) {
      // If it has an @ but not proper bracketing, it might just be an email address
      if (fromEmail.includes('@') && !fromEmail.includes('<') && !fromEmail.includes('>')) {
        // It's just an email address, keep as is for now (we'll format it below for SendGrid)
        console.log('Found plain email address:', fromEmail);
        // For SendGrid, format as required - either use the email directly or format with a name
        if (fromEmail.includes(' ')) {
          // Seems to have a name and email without proper formatting
          const parts = fromEmail.split(' ');
          const possibleEmail = parts[parts.length - 1]; // Last part might be email
          if (possibleEmail.includes('@')) {
            // Format with name and email
            const name = fromEmail.substring(0, fromEmail.length - possibleEmail.length).trim();
            fromEmail = `${name} <${possibleEmail}>`;
          }
        }
      } 
      // If it doesn't have proper email formatting
      else if (!fromEmail.includes('<') && !fromEmail.includes('>')) {
        // Extract name if possible
        const name = fromEmail.trim();
        fromEmail = name ? `${name} <${DEFAULT_FROM_EMAIL}>` : DEFAULT_FROM_EMAIL;
      } else {
        // Fallback to default if formatting is incorrect
        fromEmail = DEFAULT_FROM_EMAIL;
      }
    }
    
    console.log('Using from email:', fromEmail);
    
    // Use a verified sender domain that you've set up in SendGrid
    // This MUST be an email that you've verified in SendGrid under "Sender Authentication"
    const verifiedSenderEmail = 'elias@secondactfs.com';
    
    console.log('Using verified sender email for SendGrid:', verifiedSenderEmail);
    
    const msg = {
      to: testEmail, // Override with test email
      from: verifiedSenderEmail, // Use a verified sender for testing
      replyTo: data.from || data.replyTo, // Include user's email as reply-to 
      subject: `[TEST] ${data.subject}`,
      text: `${data.body}\n\n[TEST MODE] Original recipient: ${data.to}\n\nFrom: ${fromEmail}`,
      html: `${data.body.replace(/\n/g, '<br>')}<br><br><em>[TEST MODE] Original recipient: ${data.to}</em><br><br><em>From: ${fromEmail}</em>` // Simple HTML conversion
    };
    
    await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid');
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    
    // If rate limited, we return false but may retry
    const sendGridError = error as any;
    if (sendGridError.response && sendGridError.response.statusCode === 429) {
      console.warn('SendGrid rate limit hit, will retry');
    }
    
    return false;
  }
}

// Core function to send email with provider fallbacks
async function processEmailSend(data: EmailData): Promise<boolean> {
  // Determine the provider to use
  let success = false;
  const providers = getAvailableProviders();
  
  // Try each provider in order until one works
  for (const provider of providers) {
    try {
      switch (provider) {
        case EmailProvider.SENDGRID:
          success = await sendWithSendGrid(data);
          break;
          
        case EmailProvider.NODEMAILER:
          // Not implemented yet
          break;
          
        case EmailProvider.FALLBACK:
        default:
          success = await sendWithFallback(data);
          break;
      }
      
      if (success) break; // Stop if we succeeded
    } catch (error) {
      console.error(`Provider ${provider} failed:`, error);
      // Continue to next provider
    }
  }
  
  // Log the email send attempt to database
  try {
    if (data.resourceId || data.questionnaireId) {
      const emailLog: InsertEmailLog = {
        resourceId: data.resourceId,
        questionnaireId: data.questionnaireId,
        userId: data.userId,
        emailTo: data.to,
        emailFrom: data.from || DEFAULT_FROM_EMAIL,
        subject: data.subject,
        body: data.body,
        status: success ? 'sent' : 'failed',
        errorMessage: success ? null : 'Failed to send email',
        sentAt: new Date()
      };
      
      await storage.logEmail(emailLog);
    }
  } catch (logError) {
    console.error('Failed to log email:', logError);
  }
  
  return success;
}

// Get available providers in priority order
function getAvailableProviders(): EmailProvider[] {
  const providers: EmailProvider[] = [];
  
  // If SendGrid is configured, use it first
  if (process.env.SENDGRID_API_KEY) {
    providers.push(EmailProvider.SENDGRID);
  }
  
  // Fallback is always available
  providers.push(EmailProvider.FALLBACK);
  
  return providers;
}

/**
 * Public API: Send an email
 * For high-volume sending (queued with rate limiting and retries)
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; message: string; queued: boolean }> {
  try {
    // For immediate sending (high priority emails)
    if (data.priority === EmailPriority.HIGH) {
      const success = await processEmailSend(data);
      return {
        success,
        queued: false,
        message: success 
          ? 'Email sent successfully' 
          : 'Failed to send email. Please try again later.'
      };
    }
    
    // For all other emails, add to the queue
    emailQueue.add(data);
    
    return {
      success: true,
      queued: true,
      message: 'Email added to send queue'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      queued: false,
      message: 'An error occurred while processing your email request.'
    };
  }
}

/**
 * Send a batch of emails to multiple recipients
 * Useful for sending to multiple resources at once
 * Uses the queue system for high volume handling
 */
export async function sendBatchEmails(
  dataList: EmailData[]
): Promise<{ success: boolean; queued: number; message: string }> {
  try {
    // Add all emails to the queue
    emailQueue.addBatch(dataList);
    
    return {
      success: true,
      queued: dataList.length,
      message: `Queued ${dataList.length} emails for sending`
    };
  } catch (error) {
    console.error('Error in batch email operation:', error);
    return {
      success: false,
      queued: 0,
      message: 'An error occurred during the batch email operation.'
    };
  }
}

/**
 * Check the status of the email sending system
 * Useful for diagnostics and monitoring
 */
export async function checkEmailServiceStatus(): Promise<{
  sendgridAvailable: boolean;
  nodemailerAvailable: boolean;
  queueEnabled: boolean;
  queueStats: { queueLength: number; isProcessing: boolean };
  preferredProvider: string;
}> {
  const queueStats = emailQueue.getStats();
  const providers = getAvailableProviders();
  
  // Check both environment variable and config file
  let sendgridAvailable = !!process.env.SENDGRID_API_KEY;
  
  if (!sendgridAvailable) {
    try {
      // Also check if SendGrid is configured in our config file
      const configured = await isSendGridConfigured();
      if (configured) {
        const apiKey = await getSendGridApiKey();
        sendgridAvailable = !!apiKey;
        
        // If key found in config but not in env, set it in env
        if (sendgridAvailable && !process.env.SENDGRID_API_KEY) {
          process.env.SENDGRID_API_KEY = apiKey;
          // Initialize SendGrid with the key
          sgMail.setApiKey(apiKey);
        }
      }
    } catch (error) {
      console.error('Error checking SendGrid configuration:', error);
    }
  }
  
  return {
    sendgridAvailable,
    nodemailerAvailable: false,
    queueEnabled: true,
    queueStats,
    preferredProvider: providers[0] || EmailProvider.FALLBACK
  };
}

/**
 * Add a check for SendGrid API key
 * Helper function to ask for API key if not present
 */
export async function needsSendGridKey(): Promise<boolean> {
  // First check environment variable
  if (process.env.SENDGRID_API_KEY) {
    return false;
  }
  
  // Then check config file
  try {
    const configured = await isSendGridConfigured();
    if (configured) {
      const apiKey = await getSendGridApiKey();
      return !apiKey;
    }
  } catch (error) {
    console.error('Error checking SendGrid configuration:', error);
  }
  
  return true;
}

export default { 
  sendEmail, 
  sendBatchEmails, 
  checkEmailServiceStatus,
  needsSendGridKey,
  initializeSendGrid, // Add this function to exports
  EmailPriority // Export the enum too
};