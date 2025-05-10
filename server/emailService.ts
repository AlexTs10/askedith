/**
 * Mock Email Service
 * 
 * This is a simulated email service for the prototype as specified in the requirements:
 * "Send e-mail" can simply console.log the payload or show a toast; no SMTP integration required.
 */

interface EmailData {
  to: string;
  from?: string; // Now includes the sender's name and email
  subject: string;
  body: string;
}

/**
 * Mock function that simulates sending an email
 * In a production app, this would be replaced with actual email sending via SendGrid, Nodemailer, etc.
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    // Simulate network delay (500ms)
    setTimeout(() => {
      // Log the email data to console for demonstration purposes
      console.log('==== SIMULATED EMAIL SENT ====');
      console.log(`From: ${data.from || 'noreply@careguide.example.com'}`);
      console.log(`To: ${data.to}`);
      console.log(`Subject: ${data.subject}`);
      console.log(`Body: \n${data.body}`);
      console.log('==============================');
      
      // Simulate successful email sending
      resolve({ 
        success: true, 
        message: 'Email sent successfully (simulation)' 
      });
    }, 500);
  });
}

export default { sendEmail };