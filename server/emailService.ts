/**
 * Email Service for AskEdith
 * 
 * This service primarily acts as a fallback if Nylas isn't used.
 * Main Nylas email sending is handled via nylasRoutes.ts and nylas-sdk-v3.js.
 */

import { storage } from './storage';
import { type InsertEmailLog } from '@shared/schema';
// No SendGrid imports needed

const DEFAULT_FROM_EMAIL = 'noreply@askedith.org'; // Generic fallback
const MAX_RETRY_ATTEMPTS = 3; // Keep for potential queue retries
const RATE_LIMIT_DELAY = 1000; // Keep for potential queue rate limiting

// No SendGrid specific config imports needed from './config'

// No SendGrid initialization needed

// Email Providers
enum EmailProvider {
  NYLAS = 'nylas', // Though direct Nylas calls are often made
  NODEMAILER = 'nodemailer',
  FALLBACK = 'fallback'
}

// Email Priority Levels
export enum EmailPriority { // Export if used elsewhere
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  BULK = 'bulk'
}

// Interface for email data
export interface EmailData {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  body: string;
  resourceId?: number;
  questionnaireId?: number;
  userId?: number;
  priority?: EmailPriority;
  retryCount?: number;
  category?: string; // Keep category for logging/potential future use
}

// Queue system can remain if you want to queue fallback emails or other tasks
class EmailQueue {
  private queue: EmailData[] = [];
  private processing = false;
  private rateLimitedUntil = 0;
  
  public add(email: EmailData): void {
    email.priority = email.priority || EmailPriority.NORMAL;
    email.retryCount = email.retryCount || 0;
    
    if (email.priority === EmailPriority.HIGH) {
      this.queue.unshift(email);
    } else {
      this.queue.push(email);
    }
    
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  public addBatch(emails: EmailData[]): void {
    emails.forEach(email => this.add(email));
  }
  
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const now = Date.now();
    if (now < this.rateLimitedUntil) {
      const delay = this.rateLimitedUntil - now;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
      const email = this.queue.shift();
      if (email) {
        const success = await processEmailSend(email); // This will now mostly be fallback
        if (!success && (email.retryCount || 0) < MAX_RETRY_ATTEMPTS) {
          email.retryCount = (email.retryCount || 0) + 1;
          const backoffDelay = Math.pow(2, email.retryCount || 1) * 1000;
          setTimeout(() => this.add(email), backoffDelay);
        }
      }
      this.rateLimitedUntil = Date.now() + RATE_LIMIT_DELAY;
      setTimeout(() => this.processQueue(), RATE_LIMIT_DELAY);
    } catch (error) {
      console.error('Error processing email queue:', error);
      setTimeout(() => this.processQueue(), RATE_LIMIT_DELAY * 2);
    }
  }
  
  public getStats(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.queue.length,
      isProcessing: this.processing
    };
  }
}

const emailQueue = new EmailQueue();

async function sendWithFallback(data: EmailData): Promise<boolean> {
  const testEmail = "elias@secondactfs.com"; // Keep for testing fallback
  const originalRecipient = data.to;
  
  console.log('==== EMAIL SENT (FALLBACK MODE) ====');
  console.log(`From: ${data.from || DEFAULT_FROM_EMAIL}`);
  console.log(`To: ${testEmail} (Original: ${originalRecipient})`);
  console.log(`Subject: [FALLBACK TEST] ${data.subject}`);
  console.log(`Body: \n${data.body}\n\n[FALLBACK TEST MODE] Original recipient: ${originalRecipient}`);
  console.log('======================================');
  return true;
}

// processEmailSend now primarily handles fallback logic
async function processEmailSend(data: EmailData): Promise<boolean> {
  // In this new setup, direct Nylas calls are made from nylasRoutes.
  // This function would be for fallbacks or system emails not going through a user's Nylas account.
  let success = false;
  const providers = getAvailableProviders(); // Will likely just be FALLBACK now

  for (const provider of providers) {
    try {
      switch (provider) {
        // case EmailProvider.NYLAS:
        //   // This path is less likely to be hit if nylasRoutes handles Nylas directly.
        //   // If you want a centralized Nylas call here, you'd need to import and use nylas-sdk-v3.js functions.
        //   // For now, assume nylasRoutes handles primary Nylas sends.
        //   console.warn("Attempting Nylas send via emailService.ts - this might be unexpected.");
        //   success = false; // Placeholder
        //   break;
        case EmailProvider.NODEMAILER:
          // Not implemented yet
          break;
        case EmailProvider.FALLBACK:
        default:
          success = await sendWithFallback(data);
          break;
      }
      if (success) break;
    } catch (error) {
      console.error(`Provider ${provider} failed:`, error);
    }
  }
  
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
        status: success ? 'sent_fallback' : 'failed_fallback', // Indicate fallback
        errorMessage: success ? null : 'Failed to send email via fallback',
        sentAt: new Date()
      };
      await storage.logEmail(emailLog);
    }
  } catch (logError) {
    console.error('Failed to log email:', logError);
  }
  return success;
}

function getAvailableProviders(): EmailProvider[] {
  // Simplified: only fallback unless you add more non-Nylas providers
  const providers: EmailProvider[] = [];
  // providers.push(EmailProvider.NYLAS); // if you intend to call Nylas from here too
  providers.push(EmailProvider.FALLBACK);
  return providers;
}

export async function sendEmail(data: EmailData): Promise<{ success: boolean; message: string; queued: boolean }> {
  // This function will now primarily queue for fallback or handle high-priority fallbacks
  try {
    if (data.priority === EmailPriority.HIGH) {
      const success = await processEmailSend(data); // Directly process high-priority fallbacks
      return {
        success,
        queued: false,
        message: success 
          ? 'Email sent successfully (via fallback)' 
          : 'Failed to send email (via fallback). Please try again later.'
      };
    }
    emailQueue.add(data); // Queue normal priority fallbacks
    return {
      success: true,
      queued: true,
      message: 'Email added to fallback send queue'
    };
  } catch (error) {
    console.error('Error sending email (via fallback service):', error);
    return {
      success: false,
      queued: false,
      message: 'An error occurred while processing your email request (fallback service).'
    };
  }
}

export async function sendBatchEmails(
  dataList: EmailData[]
): Promise<{ success: boolean; queued: number; message: string }> {
  // This function will now primarily queue for fallback
  try {
    emailQueue.addBatch(dataList);
    return {
      success: true,
      queued: dataList.length,
      message: `Queued ${dataList.length} emails for sending (via fallback)`
    };
  } catch (error) {
    console.error('Error in batch email operation (via fallback service):', error);
    return {
      success: false,
      queued: 0,
      message: 'An error occurred during the batch email operation (fallback service).'
    };
  }
}

export async function checkEmailServiceStatus(): Promise<{
  nylasAvailable: boolean; // Check if Nylas creds are set, etc.
  nodemailerAvailable: boolean;
  queueEnabled: boolean;
  queueStats: { queueLength: number; isProcessing: boolean };
  preferredProvider: string;
}> {
  const queueStats = emailQueue.getStats();
  // Simplified: Nylas is "available" if its ENV vars are set.
  // Actual connection status per user is checked in nylasRoutes.
  const nylasAvailable = !!(process.env.NYLAS_CLIENT_ID && process.env.NYLAS_CLIENT_SECRET);
  
  return {
    nylasAvailable,
    nodemailerAvailable: false, // Assuming not implemented
    queueEnabled: true, // Queue is for fallbacks
    queueStats,
    preferredProvider: nylasAvailable ? EmailProvider.NYLAS : EmailProvider.FALLBACK
  };
}

export default { 
  sendEmail, 
  sendBatchEmails, 
  checkEmailServiceStatus,
  EmailPriority
};