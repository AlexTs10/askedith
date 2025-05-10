import { Resource } from "@shared/schema";
import { WizardAnswers, EmailTemplate } from "./useWizardState";

/**
 * Extracts user information from the contact info JSON
 */
function extractContactInfo(answers: WizardAnswers) {
  try {
    if (answers.q1 && typeof answers.q1 === 'string' && answers.q1.startsWith('{')) {
      // The contact info is stored as a JSON string
      const contactInfo = JSON.parse(answers.q1);
      return {
        name: contactInfo.name || '',
        email: contactInfo.email || '',
        zipcode: contactInfo.zipcode || ''
      };
    }
  } catch (e) {
    console.error("Error parsing contact information:", e);
  }
  
  // Fallback to original format or empty values
  return {
    name: answers.q1 || '',
    email: answers.q2 || '',
    zipcode: answers.q6 || ''
  };
}

/**
 * Generates an email body based on the resource and user answers
 */
export function generateEmailBody(resource: Resource, answers: WizardAnswers): string {
  // Get contact information (handles both old and new format)
  const contactInfo = extractContactInfo(answers);
  
  // In the new format, question numbers have shifted
  const relation = answers.q3 ? answers.q3.toLowerCase() : 'parent';

  return `Hi ${resource.name},

I'm looking after my ${relation} and, based on the following details,
I think your ${resource.category} services might help.

Quick snapshot from your intake:
• Living situation: ${answers.q4 || 'Not specified'}
• Primary concern: ${answers.q5 || 'Not specified'}
• Budget thoughts: ${answers.q7 || 'Not specified'}
• Timeline: ${answers.q8 || 'Not specified'}

Could we schedule a brief call?

Thank you!
${contactInfo.name}`;
}

/**
 * Generates email templates for the selected resources
 */
export function generateEmails(
  selectedResources: Resource[], 
  answers: WizardAnswers
): EmailTemplate[] {
  // Get the relationship from the correct question ID (now q3 in the new format)
  const relationship = answers.q3?.toLowerCase() || 'parent';
  
  return selectedResources.map(resource => ({
    to: resource.email,
    subject: `Seeking ${resource.category} help for my ${relationship}`,
    body: generateEmailBody(resource, answers)
  }));
}

export default generateEmails;
