
import { getAllEmails } from '../data/emailData';
import { sentEmails } from '../data/sentEmailData';
import { addAttachmentsToEmails } from '../data/emailDataWithAttachments';
import { EmailData } from '../types/email';

export const getAllEmailsWithAttachments = (): EmailData[] => {
  const receivedEmails = getAllEmails();
  console.log('Base received emails loaded:', receivedEmails.length);
  console.log('Sent emails loaded:', sentEmails.length);
  
  // Combine received and sent emails
  const allEmails = [...receivedEmails, ...sentEmails];
  console.log('Total emails combined:', allEmails.length);
  
  const emailsWithAttachments = addAttachmentsToEmails(allEmails);
  console.log('Emails with attachments processed:', emailsWithAttachments.length);
  
  const emailsWithActualAttachments = emailsWithAttachments.filter(email => email.attachments && email.attachments.length > 0);
  console.log('Emails that have attachments:', emailsWithActualAttachments.length);
  
  return emailsWithAttachments;
};

export const getEmailByIdWithAttachments = (id: string): EmailData | undefined => {
  const emails = getAllEmailsWithAttachments();
  return emails.find(email => email.id === id);
};
