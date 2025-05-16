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
        
        // Additional logging to debug email extraction
        console.log('Extracted email from contact info:', email);
        
        // Extra validation for email
        if (!email || !email.includes('@')) {
          console.warn('Invalid email format found in contact info:', email);
          
          // Look for any field that might contain an email (sometimes users put email in phone field)
          for (const key of Object.keys(contactInfo)) {
            if (typeof contactInfo[key] === 'string' && 
                contactInfo[key].includes('@') && 
                contactInfo[key].includes('.')) {
              console.log(`Found potential email in ${key} field:`, contactInfo[key]);
              email = contactInfo[key];
              break;
            }
          }
        }
      } else {
        console.warn('Contact info does not start with {, raw data:', answers.q14);
      }
    } else {
      console.warn('No q14 data available or not a string:', answers.q14);
    }
    
    // Log the result
    console.log('Final email extracted:', email);
  } catch (e) {
    console.error("Error parsing contact information:", e);
  }
  
  // No longer use q2 (age) as email - was causing bugs
  // Use a valid default email format instead when necessary
  
  if (!zipcode && answers.q6) {
    zipcode = String(answers.q6 || '');
  }
  
  // Construct a proper full name
  let fullName = firstName || 'User';
  if (lastName) {
    fullName = `${firstName} ${lastName}`;
  }
  
  // Final validation for email
  if (!email || !email.includes('@') || !email.includes('.')) {
    console.warn('Invalid or missing email after all extraction attempts - will need fallback');
    
    // Try to get email from any other question text
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === 'string' && 
          value.includes('@') && 
          value.includes('.') &&
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value)) {
        console.log(`Found potential email in answer ${key}:`, value);
        const matches = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (matches && matches[0]) {
          email = matches[0];
          console.log('Extracted email from text:', email);
          break;
        }
      }
    }
  }
  
  console.log('Extracted user info:', { firstName, lastName, email, fullName });
  
  // Important: For the "from" field, we must use a verified email
  // When no email is provided by the user, use our official email instead
  // of a placeholder that could cause SendGrid to reject the message
  return {
    firstName,
    lastName,
    email: email || 'elias@secondactfs.com', // Use a verified email as fallback
    zipcode,
    phone,
    // Full name for display purposes
    fullName: fullName
  };
}

/**
 * Helper function to parse JSON array values from answers
 * Converts ["Option 1","Option 2"] to "Option 1 and Option 2"
 */
function parseArrayAnswer(answer: string): string {
  try {
    if (answer && typeof answer === 'string') {
      // Handle array format
      if (answer.startsWith('[')) {
        const options = JSON.parse(answer);
        if (options.length === 0) {
          return '';
        } else if (options.length === 1) {
          return options[0];
        } else if (options.length === 2) {
          return `${options[0]} and ${options[1]}`;
        } else {
          // Format list with Oxford comma
          const lastOption = options[options.length - 1];
          const otherOptions = options.slice(0, options.length - 1);
          return `${otherOptions.join(', ')}, and ${lastOption}`;
        }
      }
    }
    return answer;
  } catch (e) {
    console.error('Error parsing array answer:', e);
    return answer;
  }
}

/**
 * Generates an email body based on the resource and user answers
 */
export function generateEmailBody(resource: Resource, answers: WizardAnswers): string {
  // Get user information from the answers
  const userInfo = extractUserInfo(answers);
  
  // Get relationship from q3
  const relation = answers.q3 ? answers.q3.toLowerCase() : 'parent';
  
  // Parse and format the living arrangement (q4)
  let livingArrangement = '';
  try {
    if (answers.q4) {
      const parsedLiving = parseArrayAnswer(answers.q4);
      livingArrangement = parsedLiving ? parsedLiving.toLowerCase() : '';
    }
  } catch (e) {
    console.error('Error parsing living arrangement:', e);
    livingArrangement = answers.q4 || '';
  }
  
  // Parse and format the main concerns (q5)
  let mainConcerns = '';
  try {
    if (answers.q5) {
      const parsedConcerns = parseArrayAnswer(answers.q5);
      mainConcerns = parsedConcerns ? parsedConcerns : '';
    }
  } catch (e) {
    console.error('Error parsing main concerns:', e);
    mainConcerns = answers.q5 || '';
  }
  
  // Parse the financial situation (q10)
  let financialSituation = '';
  try {
    if (answers.q10) {
      const parsedFinances = parseArrayAnswer(answers.q10);
      financialSituation = parsedFinances ? parsedFinances : '';
    }
  } catch (e) {
    console.error('Error parsing financial situation:', e);
    financialSituation = answers.q10 || '';
  }
  
  // Get other information
  const careLevel = answers.q6 || '';
  const budget = answers.q7 || '';
  const timeline = answers.q8 || '';
  const healthConditions = answers.q9 || '';
  const hasVeteranStatus = answers.q11 === 'Yes';
  const familyInvolvement = answers.q12 || '';
  const additionalInfo = answers.q13 || '';

  // Create a more conversational, human-sounding email
  return `Hi ${resource.name},

I hope this email finds you well. My name is ${userInfo.fullName}, and I'm reaching out because I'm currently caring for my ${relation} who needs some additional support.

I came across your ${resource.category} services and believe you might be able to help us. My ${relation} is currently living ${livingArrangement ? `in a ${livingArrangement} situation` : 'at home'}. We're looking for ${careLevel ? `${careLevel.toLowerCase()} level of care` : 'assistance'} ${timeline ? `within a ${timeline.toLowerCase()} timeframe` : 'soon'}.

Our main concerns include ${mainConcerns ? mainConcerns.toLowerCase() : 'various care needs'}. ${healthConditions ? `We're also managing health issues including ${healthConditions}.` : ''}${hasVeteranStatus ? ` I should mention that my ${relation} has served in the military, which may be relevant to available services.` : ''}

${financialSituation ? `Regarding finances, we ${financialSituation.toLowerCase()}.` : ''}${budget ? ` Our monthly budget for care is approximately ${budget}.` : ''}

${familyInvolvement ? `In terms of family support, ${familyInvolvement}` : ''}

${additionalInfo ? `Additional information that might be helpful: ${additionalInfo}` : ''}

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
    // TESTING MODE: Override all recipient emails with the test email
    const testEmail = "elias@secondactfs.com";
    
    // Get user's actual email from the input form
    const userEmail = userInfo.email && userInfo.email.includes('@') 
      ? userInfo.email 
      : undefined; // Use undefined instead of null for TypeScript compatibility
    
    // Debug log to help diagnose issues
    console.log('Generating email with userInfo:', userInfo);
    console.log('Email to be used as FROM:', userEmail);
    
    // SendGrid requires a verified sender domain/email
    // We can't use the user's email directly in the From field,
    // but we can use it as the Reply-To field
    
    // Using our verified sender address (maintained by server)
    const verifiedSender = 'elias@secondactfs.com';
    
    // Only use user email if it's valid, otherwise skip reply-to
    let replyToEmail = undefined;
    if (userEmail && userEmail.includes('@') && userEmail.includes('.')) {
      replyToEmail = userEmail;
      console.log('Using reply-to email:', replyToEmail);
    } else {
      console.warn('No valid email for reply-to, skipping');
    }
    
    // When using Nylas, we can use the user's own email directly as the From address
    // For SendGrid, we need to use a verified sender domain but set Reply-To as the user's email
    
    // Better format: Use the user's actual name and email when using Nylas
    const fromName = userInfo.fullName || "AskEdith";
    // When using Nylas, use the user's actual email, otherwise fall back to the verified sender
    const fromAddress = userEmail ? `${fromName} <${userEmail}>` : `AskEdith <${verifiedSender}>`;
    
    console.log('Final FROM address:', fromAddress);
    console.log('Reply-To email (if available):', replyToEmail || 'none');
    
    emails.push({
      to: testEmail, // Use the test email instead of actual provider email
      // Always use a verified sender domain for deliverability
      from: fromAddress,
      // Set the reply-to as the user's email so replies go to them
      replyTo: replyToEmail,
      subject: `Seeking ${category} assistance for my ${relationship}`,
      body: `${emailBody}\n\n[TEST EMAIL] Original recipient: ${templateResource.email} (${templateResource.name})`
    });
  });
  
  return emails;
}

export default generateEmails;
