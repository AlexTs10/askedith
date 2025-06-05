
import { EmailData } from '../types/email';

export const sentEmails: EmailData[] = [
  {
    id: "sent_001",
    subject: "Re: Insurance Coverage Questions - Documents Attached",
    sender: {
      name: "Sarah Johnson",
      email: "sarah.johnson@family.com",
      organization: "Johnson Family"
    },
    recipient: "Medicare Support <support@medicare.gov>",
    content: "Hello,\n\nThank you for your email regarding our insurance coverage questions. I've attached the requested documentation:\n\n1. Insurance Questions Response - Our detailed responses to your questionnaire\n2. Updated Emergency Contacts - Current emergency contact information\n\nPlease let me know if you need any additional information.\n\nBest regards,\nSarah Johnson",
    date: "2024-11-18T14:30:00Z",
    read: true,
    replied: false,
    responseReceived: true,
    private: false,
    category: "insurance",
    cc: ["michael.johnson@family.com"],
    bcc: []
  },
  {
    id: "sent_002", 
    subject: "Family Medical History Documentation",
    sender: {
      name: "Michael Johnson",
      email: "michael.johnson@family.com",
      organization: "Johnson Family"
    },
    recipient: "Dr. Patricia Williams <dr.williams@citymedical.com>",
    content: "Dear Dr. Williams,\n\nAs requested during our last appointment, I've compiled our complete family medical history in the attached spreadsheet. This includes:\n\n- Three generations of medical history\n- Current medications and allergies\n- Previous surgeries and major medical events\n- Genetic conditions and risk factors\n\nPlease review this information before our next consultation on December 5th.\n\nThank you,\nMichael Johnson",
    date: "2024-11-15T09:45:00Z", 
    read: true,
    replied: false,
    responseReceived: false,
    private: false,
    category: "medical",
    cc: [],
    bcc: []
  },
  {
    id: "sent_003",
    subject: "Care Preferences and Weekly Schedule",
    sender: {
      name: "Sarah Johnson", 
      email: "sarah.johnson@family.com",
      organization: "Johnson Family"
    },
    recipient: "Susan Martinez <s.martinez@sunnymeadows.com>",
    content: "Hi Susan,\n\nI hope this email finds you well. As we discussed, I'm sending over the completed care preferences form along with a photo of Dad's current weekly schedule that works well for him.\n\nThe care preferences form outlines:\n- Daily routine preferences\n- Meal preferences and dietary restrictions  \n- Activity preferences\n- Communication preferences\n\nThe weekly schedule photo shows the current routine that he's comfortable with. Please let me know if you have any questions about implementing these preferences.\n\nLooking forward to hearing from you.\n\nWarm regards,\nSarah",
    date: "2024-11-12T16:20:00Z",
    read: true, 
    replied: false,
    responseReceived: true,
    private: false,
    category: "housing",
    cc: [],
    bcc: []
  },
  // New sent emails to create mixed received/sent scenarios
  {
    id: "sent_004",
    subject: "Updated Physical Therapy Progress Report",
    sender: {
      name: "Michael Johnson",
      email: "michael.johnson@family.com", 
      organization: "Johnson Family"
    },
    recipient: "Dr. Patricia Williams <dr.williams@citymedical.com>",
    content: "Dear Dr. Williams,\n\nI'm sending you Dad's updated physical therapy progress report and some recent photos showing his improved mobility. The attached documents include:\n\n- Weekly progress measurements\n- Updated exercise routine photos\n- Therapist notes and recommendations\n\nHis improvement has been remarkable, and we're grateful for your guidance.\n\nBest regards,\nMichael Johnson",
    date: "2024-11-20T11:15:00Z",
    read: true,
    replied: false,
    responseReceived: false,
    private: false,
    category: "medical",
    cc: [],
    bcc: []
  },
  {
    id: "sent_005",
    subject: "Home Modifications Documentation",
    sender: {
      name: "Sarah Johnson",
      email: "sarah.johnson@family.com",
      organization: "Johnson Family"
    },
    recipient: "Jennifer Walsh <j.walsh@eldercare.org>",
    content: "Dear Jennifer,\n\nAs requested, I'm sending the documentation for the home modifications we've completed. The attached files include:\n\n- Before and after photos of accessibility improvements\n- Contractor invoices and permits\n- Safety inspection reports\n\nThese modifications have greatly improved Dad's independence at home.\n\nThank you for your assistance,\nSarah Johnson",
    date: "2024-11-19T13:45:00Z",
    read: true,
    replied: false,
    responseReceived: true,
    private: false,
    category: "housing",
    cc: [],
    bcc: []
  },
  {
    id: "sent_006",
    subject: "Updated Insurance Claims and Medical Bills",
    sender: {
      name: "Michael Johnson",
      email: "michael.johnson@family.com",
      organization: "Johnson Family"
    },
    recipient: "Robert Chen <r.chen@veteransaffairs.gov>",
    content: "Dear Mr. Chen,\n\nI'm forwarding the updated insurance claims and medical bills as requested for Dad's VA benefits review. The attached spreadsheet contains:\n\n- Detailed medical expenses for Q4 2024\n- Insurance claim documentation\n- Outstanding bills requiring VA assistance\n\nPlease let me know if you need any additional documentation.\n\nSincerely,\nMichael Johnson",
    date: "2024-11-17T10:30:00Z",
    read: true,
    replied: false,
    responseReceived: false,
    private: false,
    category: "insurance",
    cc: [],
    bcc: []
  },
  {
    id: "sent_007",
    subject: "Legal Documents Update and Power of Attorney",
    sender: {
      name: "Sarah Johnson",
      email: "sarah.johnson@family.com",
      organization: "Johnson Family"
    },
    recipient: "David Thompson <d.thompson@elderlaw.com>",
    content: "Dear Mr. Thompson,\n\nFollowing our consultation, I'm sending the updated legal documents and signed power of attorney forms. The attached documents include:\n\n- Completed healthcare directive\n- Financial power of attorney (notarized)\n- Updated will and testament\n- Medical decision-making preferences\n\nAll documents have been reviewed and signed as discussed.\n\nBest regards,\nSarah Johnson",
    date: "2024-11-16T14:20:00Z",
    read: true,
    replied: false,
    responseReceived: true,
    private: false,
    category: "legal",
    cc: ["michael.johnson@family.com"],
    bcc: []
  }
];
