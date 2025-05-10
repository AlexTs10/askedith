import { Resource } from "@shared/schema";
import { WizardAnswers, EmailTemplate } from "./useWizardState";

/**
 * Extracts user information from various questions in the wizard
 */
function extractUserInfo(answers: WizardAnswers) {
  // Get first name from q1 (now a direct string)
  const firstName = answers.q1 || '';
  
  // Extract contact info from q14 (JSON object with multiple fields)
  let lastName = '';
  let email = '';
  let zipcode = '';
  let phone = '';
  
  try {
    if (answers.q14 && typeof answers.q14 === 'string' && answers.q14.startsWith('{')) {
      const contactInfo = JSON.parse(answers.q14);
      lastName = contactInfo.lastname || '';
      email = contactInfo.email || '';
      zipcode = contactInfo.zipcode || '';
      phone = contactInfo.phone || '';
    }
  } catch (e) {
    console.error("Error parsing contact information:", e);
  }
  
  // For backward compatibility with old data format
  if (!email && answers.q2) {
    email = answers.q2;
  }
  
  if (!zipcode && answers.q6) {
    zipcode = answers.q6;
  }
  
  return {
    firstName,
    lastName,
    email,
    zipcode,
    phone,
    // Full name for display purposes
    fullName: firstName + (lastName ? ` ${lastName}` : '')
  };
}

/**
 * Generates an email body based on the resource and user answers
 */
export function generateEmailBody(resource: Resource, answers: WizardAnswers): string {
  // Get user information from the answers
  const userInfo = extractUserInfo(answers);
  
  // Get relationship from q3
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
${userInfo.fullName}`;
}

/**
 * Categorizes resources by their category
 * Allows sending one template per category to multiple resources
 */
function categorizeResources(resources: Resource[]): Record<string, Resource[]> {
  const categorized: Record<string, Resource[]> = {};
  
  resources.forEach(resource => {
    const category = resource.category;
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(resource);
  });
  
  return categorized;
}

/**
 * Generates email templates for the selected resources
 * Groups resources by category and creates one template per category
 */
export function generateEmails(
  selectedResources: Resource[], 
  answers: WizardAnswers
): EmailTemplate[] {
  // Get user information
  const userInfo = extractUserInfo(answers);
  
  // Get the relationship from the correct question
  const relationship = answers.q3?.toLowerCase() || 'parent';
  
  // Group resources by category
  const categorizedResources = categorizeResources(selectedResources);
  
  // Array to collect all email templates
  const emails: EmailTemplate[] = [];
  
  // For each category, create a template
  Object.entries(categorizedResources).forEach(([category, resources]) => {
    // Get the first resource to use as a template
    const templateResource = resources[0];
    
    // Generate the standard email body
    const emailBody = generateEmailBody(templateResource, answers);
    
    // Create an email template for each resource in this category
    resources.forEach(resource => {
      emails.push({
        to: resource.email,
        // Include full name in the from field, but also store the actual email for sending
        from: `${userInfo.fullName} <${userInfo.email}>`,
        subject: `Seeking ${category} help for my ${relationship}`,
        body: emailBody
      });
    });
  });
  
  return emails;
}

export default generateEmails;
