/**
 * SendGrid Email Helper
 * 
 * This file provides a simple interface for sending emails with SendGrid
 * using native ES modules to avoid any require() compatibility issues.
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid initialized in helper module');
} else {
  console.warn('SendGrid API key not found in environment');
}

// Default sender configuration
const DEFAULT_FROM_EMAIL = 'elias@secondactfs.com';
const DEFAULT_FROM_NAME = 'AskEdith';

// Email sending interface
export interface EmailData {
  to: string;
  from?: string; 
  replyTo?: string;
  subject: string;
  body: string;
  resourceId?: number;
  questionnaireId?: number;
  userId?: number;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(data: EmailData): Promise<{
  success: boolean;
  queued: boolean;
  message: string;
}> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return {
        success: false,
        queued: false,
        message: "SendGrid API key not configured",
      };
    }

    // TESTING MODE: Override recipient with test email
    const testEmail = "elias@secondactfs.com";
    const originalRecipient = data.to;
    
    // Format the from field
    const fromEmail = `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`;
    
    // Send the email
    await sgMail.send({
      to: testEmail,
      from: fromEmail,
      subject: `[TEST] ${data.subject}`,
      text: `${data.body}\n\n[TEST MODE] Original recipient: ${originalRecipient}`,
      html: `${data.body.replace(/\n/g, '<br>')}<br><br><em>[TEST MODE] Original recipient: ${originalRecipient}</em>`,
      replyTo: data.replyTo || undefined
    });
    
    console.log('Email sent successfully via SendGrid helper');
    
    return {
      success: true,
      queued: false,
      message: "Email sent successfully"
    };
  } catch (error) {
    console.error('SendGrid helper error:', error);
    
    return {
      success: false,
      queued: false,
      message: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}

/**
 * Send multiple emails in a batch
 */
export async function sendBatchEmails(emails: EmailData[]): Promise<{
  success: boolean;
  queued: number;
  sent: number;
  failed: number;
  total: number;
  message: string;
}> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return {
        success: false,
        queued: 0,
        sent: 0,
        failed: emails.length,
        total: emails.length,
        message: "SendGrid API key not configured",
      };
    }

    const results = await Promise.all(
      emails.map(email => sendEmail(email))
    );
    
    const sent = results.filter(r => r.success).length;
    
    return {
      success: sent > 0,
      queued: 0,
      sent,
      failed: emails.length - sent,
      total: emails.length,
      message: `${sent} of ${emails.length} emails sent successfully`
    };
  } catch (error) {
    console.error('SendGrid batch helper error:', error);
    
    return {
      success: false,
      queued: 0,
      sent: 0,
      failed: emails.length,
      total: emails.length,
      message: error instanceof Error ? error.message : "Failed to send batch emails"
    };
  }
}