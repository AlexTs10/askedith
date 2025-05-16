/**
 * Direct Email Sending with Nylas
 * 
 * This module provides functions to send emails directly through Nylas
 * without requiring user OAuth authentication.
 */

import Nylas from 'nylas';

// Nylas configuration
const NYLAS_API_KEY = process.env.NYLAS_CLIENT_SECRET;
const NYLAS_API_URI = 'https://api.us.nylas.com';

// Configure Nylas instance
let nylasClient;

try {
  nylasClient = new Nylas({
    apiKey: NYLAS_API_KEY,
    apiUri: NYLAS_API_URI,
  });
  console.log('Nylas direct sending client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Nylas client:', error);
}

/**
 * Send an email directly through Nylas
 * 
 * @param {Object} emailData - The email data to send
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body (HTML)
 * @param {string} emailData.replyTo - Reply-to email address
 * @returns {Promise<Object>} - Result of the operation
 */
export async function sendEmailWithNylasDirect(emailData) {
  if (!nylasClient) {
    return { success: false, error: 'Nylas client not initialized' };
  }
  
  try {
    console.log('Sending email with Nylas direct sending');
    
    // Prepare from address with name
    const fromEmail = process.env.FROM_EMAIL || 'elias@secondactfs.com';
    const fromName = 'AskEdith';
    
    // Prepare request body
    const requestBody = {
      to: [{ email: emailData.to }],
      from: [{ email: fromEmail, name: fromName }],
      subject: emailData.subject,
      body: emailData.body,
    };
    
    // Add reply-to if available
    if (emailData.replyTo) {
      requestBody.replyTo = [{ email: emailData.replyTo }];
    }
    
    // Send email using the direct send API
    const response = await nylasClient.emails.send({
      requestBody
    });
    
    console.log('Email sent successfully with Nylas direct sending');
    return { success: true, messageId: response.id };
  } catch (error) {
    console.error('Error sending email with Nylas direct sending:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send multiple emails directly through Nylas
 * 
 * @param {Array<Object>} emails - Array of email data objects
 * @returns {Promise<Object>} - Result of the operation
 */
export async function sendBatchEmailsWithNylasDirect(emails) {
  if (!nylasClient || !emails || !Array.isArray(emails)) {
    return { 
      success: false, 
      error: 'Invalid input or Nylas client not initialized'
    };
  }
  
  try {
    console.log(`Sending ${emails.length} emails with Nylas direct sending`);
    
    const results = await Promise.all(
      emails.map(emailData => sendEmailWithNylasDirect(emailData))
    );
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      sent: successCount,
      failed: emails.length - successCount,
      total: emails.length,
      results
    };
  } catch (error) {
    console.error('Error sending batch emails with Nylas direct sending:', error);
    return { 
      success: false, 
      error: error.message, 
      sent: 0,
      failed: emails.length,
      total: emails.length
    };
  }
}