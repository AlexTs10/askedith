
import { EmailData } from '../types/email';
import { sampleAttachments } from './sampleAttachments';

// This extends the existing email data with attachments
export const addAttachmentsToEmails = (emails: EmailData[]): EmailData[] => {
  console.log('Sample attachments keys:', Object.keys(sampleAttachments));
  console.log('Total attachment groups:', Object.keys(sampleAttachments).length);
  
  return emails.map(email => {
    const attachments = sampleAttachments[email.id];
    if (attachments) {
      console.log(`Email ${email.id} (${email.subject}) has ${attachments.length} attachments`);
    }
    return {
      ...email,
      attachments: attachments || undefined
    };
  });
};
