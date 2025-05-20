/**
 * Direct Email Helper for Testing
 * 
 * This module provides direct email sending functionality for testing
 * without requiring actual Nylas API verification.
 */

import type { Request } from 'express';

/**
 * Check if the session is using a mock/test grant ID
 */
export function isUsingMockGrant(req: Request): boolean {
  return Boolean(req.session?.usingMockGrant);
}

/**
 * Send an email directly (mock implementation for testing)
 */
export async function sendEmailDirect(emailData: any): Promise<any> {
  // Log the attempt
  console.log('Using direct email mock implementation');
  console.log('Email data:', JSON.stringify(emailData, null, 2));
  
  // Return a successful response for testing
  return {
    success: true,
    messageId: `mock-msg-${Date.now()}`,
    message: "Email sent successfully via your connected email account (TEST MODE)"
  };
}

/**
 * Send batch emails directly (mock implementation for testing)
 */
export async function sendBatchEmailsDirect(emails: any[]): Promise<any> {
  // Log the attempt
  console.log(`Sending ${emails.length} emails via direct email mock implementation`);
  
  // Process all emails
  const results = emails.map((email, index) => ({
    success: true,
    messageId: `mock-batch-msg-${Date.now()}-${index}`,
    to: email.to
  }));
  
  // Return a successful batch response
  return {
    success: true,
    queued: 0,
    sent: emails.length,
    total: emails.length,
    results,
    message: `${emails.length} emails sent successfully via your connected email account (TEST MODE)`
  };
}