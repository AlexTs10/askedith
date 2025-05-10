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
    if (answers.q14 && typeof answers.q14 === 'string') {
      // Only try to parse if it looks like JSON
      if (answers.q14.trim().startsWith('{')) {
        console.log('Parsing contact info from q14:', answers.q14);
        const contactInfo = JSON.parse(answers.q14);
        lastName = contactInfo.lastname || '';
        email = contactInfo.email || '';
        zipcode = contactInfo.zipcode || '';
        phone = contactInfo.phone || '';
      }
    }
  } catch (e) {
    console.error("Error parsing contact information:", e);
  }
  
  // For backward compatibility with old data format
  if (!email && answers.q2) {
    if (typeof answers.q2 === 'string') {
      email = answers.q2;
    } else if (typeof answers.q2 === 'number') {
      // Convert to string if somehow a number got stored
      email = String(answers.q2);
    }
  }
  
  if (!zipcode && answers.q6) {
    zipcode = String(answers.q6 || '');
  }
  
  // Construct a proper full name
  let fullName = firstName || 'User';
  if (lastName) {
    fullName = `${firstName} ${lastName}`;
  }
  
  console.log('Extracted user info:', { firstName, lastName, email, fullName });
  
  return {
    firstName,
    lastName,
    email,
    zipcode,
    phone,
    // Full name for display purposes
    fullName: fullName
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
  
  // Get other information from answers for a more conversational email
  const livingArrangement = answers.q4 || '';
  const mainConcern = answers.q5 || '';
  const budget = answers.q7 || '';
  const timeline = answers.q8 || '';
  const healthConditions = answers.q9 || '';
  const hasVeteranStatus = answers.q11 === 'Yes' ? true : false;

  // Create a more conversational, human-sounding email
  return `Hi ${resource.name},

I hope this email finds you well. My name is ${userInfo.fullName}, and I'm reaching out because I'm currently caring for my ${relation} who needs some additional support.

I came across your ${resource.category} services and believe you might be able to help us. My ${relation} is currently ${livingArrangement.toLowerCase()}, and we're primarily concerned about ${mainConcern.toLowerCase()}. 

${hasVeteranStatus ? `I should mention that my ${relation} has served in the military, if that's relevant to available services. ` : ''}${healthConditions ? `We're also managing some health issues, specifically ${healthConditions.toLowerCase()}.` : ''}

In terms of timing, we're looking for assistance ${timeline.toLowerCase()} and have a monthly budget of approximately ${budget}. 

Would it be possible to schedule a brief call to discuss how your services might fit our needs? I'm available most days and can adjust my schedule to accommodate yours.

Thank you for your time and consideration.

Best regards,
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
 * Creates ONE template per category instead of one per resource
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
  
  // Array to collect all email templates - ONE per category
  const emails: EmailTemplate[] = [];
  
  // For each category, create a SINGLE template
  Object.entries(categorizedResources).forEach(([category, resources]) => {
    // Get the first resource to use as a template
    const templateResource = resources[0];
    
    // List all resources in this category in the email body
    const resourceList = resources.map(r => 
      `- ${r.name} (${r.email})`
    ).join('\n');
    
    // Generate the standard email body
    let emailBody = generateEmailBody(templateResource, answers);
    
    // Add a list of all recipients (for demonstration purposes)
    // In a production app, we'd configure BCC or proper mail distribution
    if (resources.length > 1) {
      emailBody += `\n\nNote: This email is being sent to the following providers in this category:\n${resourceList}`;
    }
    
    // Create just ONE email template for the entire category
    emails.push({
      to: templateResource.email,
      // Include full name in the from field, but also store the actual email for sending
      from: `${userInfo.fullName} <${userInfo.email}>`,
      subject: `Seeking ${category} assistance for my ${relationship}`,
      body: emailBody
    });
  });
  
  return emails;
}

export default generateEmails;
