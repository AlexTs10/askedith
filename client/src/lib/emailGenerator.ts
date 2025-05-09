import { Resource } from "@shared/schema";
import { WizardAnswers, EmailTemplate } from "./useWizardState";

/**
 * Generates an email body based on the resource and user answers
 */
export function generateEmailBody(resource: Resource, answers: WizardAnswers): string {
  const relation = answers.q4 ? answers.q4.toLowerCase() : 'parent';
  const userName = answers.q1 || '';

  return `Hi ${resource.name},

I'm looking after my ${relation} and, based on the following details,
I think your ${resource.category} services might help.

Quick snapshot from your intake:
• Living situation: ${answers.q5 || 'Not specified'}
• Primary concern: ${answers.q7 || 'Not specified'}
• Budget thoughts: ${answers.q8 || 'Not specified'}
• Timeline: ${answers.q12 || 'Not specified'}

Could we schedule a brief call?

Thank you!
${userName}`;
}

/**
 * Generates email templates for the selected resources
 */
export function generateEmails(
  selectedResources: Resource[], 
  answers: WizardAnswers
): EmailTemplate[] {
  return selectedResources.map(resource => ({
    to: resource.email,
    subject: `Seeking ${resource.category} help for my ${answers.q4?.toLowerCase() || 'parent'}`,
    body: generateEmailBody(resource, answers)
  }));
}

export default generateEmails;
