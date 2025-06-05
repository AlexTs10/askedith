import { EmailData } from '../types/email';

// Helper function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 12);

// Generate dates from recent to older (within last 30 days)
const generateDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockEmails: EmailData[] = [
  // Hospitals Category
  {
    id: "h1k8p2v9xs",
    subject: "Lab Results Available - Patient Portal",
    sender: {
      name: "Dr. Sarah Kim",
      email: "skim@cedarssinai.org",
      organization: "Cedars-Sinai Medical Center"
    },
    recipient: "you@example.com",
    content: "Your father's recent blood work results are now available in the patient portal. The results show improvement in his cholesterol levels since starting the new medication. Please schedule a follow-up appointment within the next two weeks to discuss the results and adjust his treatment plan if needed.",
    date: generateDate(1),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "hospitals"
  },
  
  // Pharmacies Category
  {
    id: "p7m3n4q8wr",
    subject: "Prescription Ready for Pickup",
    sender: {
      name: "CVS Pharmacy",
      email: "notifications@cvs.com",
      organization: "CVS Pharmacy"
    },
    recipient: "you@example.com",
    content: "Your mother's prescription for Metformin 500mg is ready for pickup at our Beverly Hills location. Please bring a valid ID when collecting the medication. The prescription will be held for 14 days. If you have any questions about the medication or need delivery options, please call us at (555) 123-4567.",
    date: generateDate(2),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "pharmacies"
  },
  
  // Senior Living Category
  {
    id: "ryoncku57t", // This ID matches sample attachments
    subject: "Follow-up on Golden Sunset Residence Tour",
    sender: {
      name: "Melissa Johnson",
      email: "mjohnson@goldensunset.com",
      organization: "Golden Years Community"
    },
    recipient: "you@example.com",
    content: "Thank you for visiting our facility last week. I wanted to follow up on the questions you had regarding our memory care program. We have several specialized activities that I think would be perfect for your mother's situation...",
    date: generateDate(2),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "senior-living"
  },
  {
    id: "0hz8p5u8ie", // This ID matches sample attachments
    subject: "Sunrise Village - Availability Update",
    sender: {
      name: "David Chen",
      email: "dchen@sunrisevillage.org",
      organization: "Sunrise Senior Living"
    },
    recipient: "you@example.com",
    content: "I'm writing to inform you that we now have an opening in our assisted living section that matches your requirements. The apartment has a garden view as you preferred. Would you like to schedule a visit this week?",
    date: generateDate(3),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "senior-living"
  },
  {
    id: "zez5gyxa55", // This ID matches sample attachments
    subject: "Payment Confirmation - Evergreen Retirement",
    sender: {
      name: "Finance Department",
      email: "billing@evergreenretirement.com",
      organization: "Evergreen Retirement Homes"
    },
    recipient: "you@example.com",
    content: "This is to confirm that we've received your deposit payment for the room reservation. Your move-in date is confirmed for November 15th. Please let us know if you need any assistance with the moving arrangements.",
    date: generateDate(5),
    read: true,
    replied: true,
    responseReceived: true,
    private: false,
    category: "senior-living"
  },
  
  // Home Care Category
  {
    id: "2klhak25kz", // This ID matches sample attachments
    subject: "Caregiver Schedule Confirmation",
    sender: {
      name: "Lisa Martinez",
      email: "lmartinez@homecaresolutions.com",
      organization: "HomeCarePlus"
    },
    recipient: "you@example.com",
    content: "I've attached the schedule for next month's caregiving sessions. We've accommodated your request for morning visits. Please review and let me know if any adjustments are needed.",
    date: generateDate(1),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "home-care"
  },
  {
    id: "2us8bbbm5x", // This ID matches sample attachments
    subject: "New Caregiver Introduction",
    sender: {
      name: "Robert Williams",
      email: "rwilliams@comfortcare.org",
      organization: "Comfort Care Services"
    },
    recipient: "you@example.com",
    content: "Due to Sarah's upcoming vacation, we'll be assigning a new caregiver, Michael, to assist your father starting next Monday. Michael has 6 years of experience with patients with similar needs and has been briefed on all care requirements.",
    date: generateDate(4),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "home-care"
  },
  
  // Government & VA Category (formerly separate categories)
  {
    id: "byff0azjme", // This ID matches sample attachments
    subject: "Medicare Application Status Update",
    sender: {
      name: "Medicare Processing Center",
      email: "notifications@medicare.gov",
      organization: "Medicare Services"
    },
    recipient: "you@example.com",
    content: "Your recent application for Medicare Part B has been processed. Additional documentation is required to complete your enrollment. Please submit the requested documents within 30 days.",
    date: generateDate(7),
    read: true,
    replied: false,
    responseReceived: true,
    private: false,
    category: "government-va"
  },
  {
    id: "l8ob8e8p1k", // This ID matches sample attachments
    subject: "Social Security Benefit Review",
    sender: {
      name: "SSA Benefits Department",
      email: "benefits@ssa.gov",
      organization: "Social Security Office"
    },
    recipient: "you@example.com",
    content: "Your annual benefits review is coming up next month. No action is required at this time, but please ensure your contact information in your online account is up to date.",
    date: generateDate(10),
    read: true,
    replied: true,
    responseReceived: false,
    private: false,
    category: "government-va"
  },
  {
    id: "av13yvz2vf", // This ID matches sample attachments
    subject: "Veterans Aid Application Confirmation",
    sender: {
      name: "VA Benefits Administration",
      email: "claims@va.gov",
      organization: "Veterans Affairs"
    },
    recipient: "you@example.com",
    content: "We've received your application for the Aid & Attendance benefit. Your claim number is VA23456789. Processing typically takes 4-6 weeks. We'll contact you if additional information is needed.",
    date: generateDate(15),
    read: false,
    replied: true,
    responseReceived: true,
    private: false,
    category: "government-va"
  },
  {
    id: "h8wj2ya19p",
    subject: "Property Tax Exemption Approval",
    sender: {
      name: "County Assessor's Office",
      email: "taxoffice@county.gov",
      organization: "Local Government"
    },
    recipient: "you@example.com",
    content: "Your application for the senior property tax exemption has been approved. This exemption will be reflected on your next tax statement. Thank you for submitting all required documentation in a timely manner.",
    date: generateDate(20),
    read: true,
    replied: false,
    responseReceived: true,
    private: false,
    category: "government-va"
  },
  {
    id: "s88pqu6xed",
    subject: "Community Transportation Program",
    sender: {
      name: "Senior Services Coordinator",
      email: "transit@cityname.gov",
      organization: "City Senior Services"
    },
    recipient: "you@example.com",
    content: "Based on your inquiry, I've enclosed information about our free transportation program for seniors. Applications are accepted on a rolling basis, and services can begin approximately 2 weeks after approval.",
    date: generateDate(12),
    read: true,
    replied: true,
    responseReceived: false,
    private: false,
    category: "government-va"
  },
  {
    id: "48cbug196x",
    subject: "VA Benefits Eligibility Review",
    sender: {
      name: "Thomas Reynolds",
      email: "treynolds@va.gov",
      organization: "Department of Veterans Affairs"
    },
    recipient: "you@example.com",
    content: "Based on our recent assessment, your father may qualify for additional VA healthcare benefits. We'd like to schedule a comprehensive review of his service record and medical needs. Would next Tuesday at 10 AM work for a virtual appointment?",
    date: generateDate(3),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "government-va"
  },
  {
    id: "30rzrypb3t",
    subject: "Aid & Attendance Benefit Documentation",
    sender: {
      name: "Maria Sanchez",
      email: "msanchez@va.gov",
      organization: "VA Benefits Administration"
    },
    recipient: "you@example.com",
    content: "Thank you for submitting your application for the VA Aid & Attendance benefit. We require additional documentation regarding your mother's daily care needs. I've attached the necessary forms that need to be completed by her primary caregiver.",
    date: generateDate(7),
    read: true,
    replied: true,
    responseReceived: false,
    private: false,
    category: "government-va"
  },
  {
    id: "wvebdtgqk5",
    subject: "VA Caregiver Support Program",
    sender: {
      name: "James Wilson",
      email: "jwilson@va.gov",
      organization: "VA Caregiver Support"
    },
    recipient: "you@example.com",
    content: "Following our conversation about respite care options, I wanted to share information about our Caregiver Support Program. This program offers training, resources, and a monthly stipend for eligible veterans and their caregivers. Let me know if you'd like to discuss how to apply.",
    date: generateDate(14),
    read: true,
    replied: false,
    responseReceived: true,
    private: false,
    category: "government-va"
  },
  
  // Attorneys Category
  {
    id: "r2gb75u7x6",
    subject: "Estate Planning Document Review",
    sender: {
      name: "Patricia Lawson",
      email: "plawson@elderlaw.com",
      organization: "Elder Law Partners"
    },
    recipient: "you@example.com",
    content: "I've reviewed the estate planning documents you sent over. There are a few areas we should discuss, particularly regarding the power of attorney designation. Can we schedule a call later this week?",
    date: generateDate(6),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "attorneys"
  },
  {
    id: "l9fjpu36ff",
    subject: "Trust Amendment Draft",
    sender: {
      name: "James Wilson",
      email: "jwilson@estateplanning.org",
      organization: "Estate Planning Associates"
    },
    recipient: "you@example.com",
    content: "Attached please find the draft amendment to the living trust we discussed. Please review and let me know if any changes are needed before we prepare the final document for signature.",
    date: generateDate(8),
    read: true,
    replied: true,
    responseReceived: false,
    private: false,
    category: "attorneys"
  },
  {
    id: "w92zavf48x",
    subject: "Guardianship Filing Confirmation",
    sender: {
      name: "Laura Mendez",
      email: "lmendez@guardianlaw.com",
      organization: "Guardian Legal Services"
    },
    recipient: "you@example.com",
    content: "This email confirms that we have filed the guardianship petition with the court. The hearing date is set for October 18th at 9:30 AM. Please plan to attend, as your testimony will be important.",
    date: generateDate(9),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "attorneys"
  },
  
  // Other Professionals Category
  {
    id: "huhdr1euby",
    subject: "Financial Plan Review Meeting",
    sender: {
      name: "Thomas Grant",
      email: "tgrant@seniorfinance.com",
      organization: "Senior Financial Advisors"
    },
    recipient: "you@example.com",
    content: "It's time for our quarterly review of your parents' financial plan. I'd like to discuss some adjustments to their investment portfolio given the recent market changes. Would Tuesday at 2PM work for a virtual meeting?",
    date: generateDate(4),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "other-professionals"
  },
  {
    id: "1ktbzlf2pf",
    subject: "Physical Therapy Assessment Results",
    sender: {
      name: "Dr. Samantha Wong",
      email: "swong@elderwellness.org",
      organization: "Elder Wellness Center"
    },
    recipient: "you@example.com",
    content: "Following yesterday's assessment, I've attached the recommended physical therapy routine for your father. These exercises should help improve his mobility and balance. We'd like to schedule a follow-up in three weeks.",
    date: generateDate(2),
    read: true,
    replied: true,
    responseReceived: false,
    private: false,
    category: "other-professionals"
  },
  {
    id: "mubcqdho6q",
    subject: "Moving Services Quote",
    sender: {
      name: "Eric Johnson",
      email: "ejohnson@seniortransitions.com",
      organization: "Senior Transition Services"
    },
    recipient: "you@example.com",
    content: "Based on our conversation about your mother's upcoming move to assisted living, I've prepared a detailed quote for our packing and moving services. We specialize in downsizing assistance and can handle everything from sorting to final arrangement in the new space.",
    date: generateDate(11),
    read: false,
    replied: true,
    responseReceived: true,
    private: false,
    category: "other-professionals"
  },
  
  // Physical Therapy Category
  {
    id: "pdz874evdk",
    subject: "Home Exercise Program Update",
    sender: {
      name: "Dr. Anita Patel",
      email: "apatel@mobiletherapy.org",
      organization: "Mobile Therapy Services"
    },
    recipient: "you@example.com",
    content: "Based on your father's progress during our last session, I've updated his home exercise program. Please find the attached guide with illustrations. It's important that he completes these exercises twice daily to maintain the mobility gains we've achieved so far.",
    date: generateDate(2),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "physical-therapy"
  },
  {
    id: "mctgsi768q",
    subject: "Medicare Coverage for Physical Therapy",
    sender: {
      name: "Lisa Johnson",
      email: "ljohnson@seniorrehab.com",
      organization: "Senior Rehabilitation Center"
    },
    recipient: "you@example.com",
    content: "I've reviewed your mother's Medicare coverage for physical therapy services. She has 8 more covered sessions available this year. Given her progress, I recommend scheduling these sessions once per week through the end of next month to maximize her recovery.",
    date: generateDate(5),
    read: true,
    replied: true,
    responseReceived: true,
    private: false,
    category: "physical-therapy"
  },
  {
    id: "4fsdo2s69g",
    subject: "Mobility Equipment Recommendations",
    sender: {
      name: "Marcus Chen",
      email: "mchen@adaptivemobility.com",
      organization: "Adaptive Mobility Solutions"
    },
    recipient: "you@example.com",
    content: "Following our assessment, I'm recommending several pieces of adaptive equipment to improve safety and independence at home. These include a shower transfer bench, bedside grab rails, and a rolling walker with a seat. Most of these items should be covered by insurance with the prescription I've attached.",
    date: generateDate(9),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "physical-therapy"
  },
  
  // Paying for Care Category
  {
    id: "fbgpvvfdb3",
    subject: "Long-Term Care Insurance Claim Update",
    sender: {
      name: "Patricia Morgan",
      email: "pmorgan@careinsurance.com",
      organization: "Senior Care Insurance Group"
    },
    recipient: "you@example.com",
    content: "We've processed the claim for your father's long-term care expenses. The approved benefits will cover 80% of his assisted living costs for up to 3 years. Payments will be sent directly to the facility starting next month. Please review the attached explanation of benefits.",
    date: generateDate(4),
    read: false,
    replied: false,
    responseReceived: true,
    private: false,
    category: "paying-for-care"
  },
  {
    id: "sw3m3vrr9k",
    subject: "Medicaid Application Status",
    sender: {
      name: "Robert Thompson",
      email: "rthompson@eldercarelegal.org",
      organization: "Elder Care Legal Services"
    },
    recipient: "you@example.com",
    content: "I wanted to update you on your mother's Medicaid application. We've submitted all required financial documentation, and the application is now under review. The typical processing time is 45-60 days. In the meantime, I recommend keeping all receipts for her care expenses as these may be reimbursable retroactively.",
    date: generateDate(10),
    read: true,
    replied: false,
    responseReceived: true,
    private: false,
    category: "paying-for-care"
  },
  {
    id: "gsws4vjsju",
    subject: "Financial Planning for Long-Term Care",
    sender: {
      name: "Sarah Williams",
      email: "swilliams@seniorfinancial.com",
      organization: "Senior Financial Planning"
    },
    recipient: "you@example.com",
    content: "Thank you for sharing your concerns about future care costs. I've prepared several scenarios showing how your parents' assets might be structured to maximize eligibility for assistance programs while preserving some inheritance. Let's schedule a call next week to review these options in detail.",
    date: generateDate(12),
    read: true,
    replied: true,
    responseReceived: false,
    private: false,
    category: "paying-for-care"
  }
];

// Helper functions to get emails by category and status
export const getEmailsByCategory = (category: string) => {
  return mockEmails.filter(email => email.category === category);
};

export const getUnreadEmails = (category?: string) => {
  return mockEmails.filter(email => 
    !email.read && (category ? email.category === category : true)
  );
};

export const getPendingEmails = (category?: string) => {
  return mockEmails.filter(email => 
    !email.replied && email.read && (category ? email.category === category : true)
  );
};

export const getUnrespondedEmails = (category?: string) => {
  return mockEmails.filter(email => 
    email.replied && !email.responseReceived && (category ? email.category === category : true)
  );
};

export const getAllEmails = () => {
  return mockEmails;
};

export const getEmailById = (id: string) => {
  return mockEmails.find(email => email.id === id);
};
