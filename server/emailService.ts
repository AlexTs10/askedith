/**
 * Email Service for AskCara
 * 
 * This service handles email sending with support for high volume processing.
 * In production, it will use SendGrid and a queue system to handle 40,000+ users/month.
 * For development, it uses a simple fallback mode that logs to console.
 */

import { storage } from './storage';
import { type InsertEmailLog } from '@shared/schema';

// Email service configuration
const DEFAULT_FROM_EMAIL = 'noreply@askcara.org';

// Interface for email data
export interface EmailData {
  to: string;
  from?: string; // Includes the sender's name and email
  subject: string;
  body: string;
  resourceId?: number;
  questionnaireId?: number;
  userId?: number;
}

// Fallback for development/testing - just log to console
async function sendWithFallback(data: EmailData): Promise<boolean> {
  console.log('==== EMAIL SENT (DEVELOPMENT MODE) ====');
  console.log(`From: ${data.from || DEFAULT_FROM_EMAIL}`);
  console.log(`To: ${data.to}`);
  console.log(`Subject: ${data.subject}`);
  console.log(`Body: \n${data.body}`);
  console.log('======================================');
  return true;
}

// Core function to send email (development version)
async function processEmailSend(data: EmailData): Promise<boolean> {
  const success = await sendWithFallback(data);
  
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

/**
 * Public API: Send an email
 * In development, this logs to console
 * In production, this would use SendGrid/Nodemailer and a queue system
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    const success = await processEmailSend(data);
    return {
      success,
      message: success 
        ? 'Email sent successfully' 
        : 'Failed to send email. Please try again later.'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'An error occurred while processing your email request.'
    };
  }
}

/**
 * Send a batch of emails to multiple recipients
 * Useful for sending to multiple resources at once
 */
export async function sendBatchEmails(
  dataList: EmailData[]
): Promise<{ success: boolean; sent: number; failed: number; message: string }> {
  let sent = 0;
  let failed = 0;
  
  try {
    const promises = dataList.map(async (data) => {
      try {
        const success = await processEmailSend(data);
        if (success) {
          sent++;
        } else {
          failed++;
        }
        return success;
      } catch (error) {
        console.error(`Error sending email to ${data.to}:`, error);
        failed++;
        return false;
      }
    });
    
    await Promise.all(promises);
    
    return {
      success: failed === 0,
      sent,
      failed,
      message: `Sent ${sent} emails${failed > 0 ? `, ${failed} failed` : ''}.`
    };
  } catch (error) {
    console.error('Error in batch email operation:', error);
    return {
      success: false,
      sent,
      failed: dataList.length - sent,
      message: 'An error occurred during the batch email operation.'
    };
  }
}

// Check the status of the email service
export async function checkEmailServiceStatus(): Promise<{
  sendgridAvailable: boolean;
  nodemailerAvailable: boolean;
  queueEnabled: boolean;
  preferredProvider: string;
}> {
  return {
    sendgridAvailable: !!process.env.SENDGRID_API_KEY,
    nodemailerAvailable: false,
    queueEnabled: false,
    preferredProvider: 'fallback'
  };
}

export default { 
  sendEmail, 
  sendBatchEmails, 
  checkEmailServiceStatus
};