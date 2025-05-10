export interface Question {
  id: number;
  text: string;
  type: "text" | "email" | "number" | "select" | "radio" | "textarea" | "contact_info" | "multiselect" | "checkbox_group";
  required: boolean;
  placeholder?: string;
  options?: string[];
  category?: string; // Hidden field for categorizing questions
  subtext?: string; // Additional explanatory text for the question
  subfields?: {
    name: string;
    type: "text" | "email" | "number" | "tel";
    placeholder: string;
    required: boolean;
  }[];
}

// Updated questions for the wizard with reorganized structure and new requirements
export const wizardQuestions: Question[] = [
  { 
    id: 1, 
    text: "What is your first name?", 
    type: "text", 
    required: true,
    placeholder: "Your first name",
    category: "demographic" 
  },
  { 
    id: 2, 
    text: "Age of first person who needs senior living or care?", 
    type: "number", 
    required: true, 
    placeholder: "Enter age of first person",
    category: "recipient_info",
    subtext: "If there is a second person, their age is:",
    subfields: [
      {
        name: "secondPersonAge",
        type: "number",
        placeholder: "Age of second person (if applicable)",
        required: false
      }
    ]
  },
  { 
    id: 3, 
    text: "Relationship to care recipient", 
    type: "select", 
    required: true, 
    options: ["Parent", "Spouse", "Sibling", "Friend", "Other"],
    category: "relationship" 
  },
  { 
    id: 4, 
    text: "Living situation (Select all that apply)", 
    type: "checkbox_group", 
    required: true, 
    options: [
      "Independent living", 
      "Independent living with assistance", 
      "Assisted living facility", 
      "Nursing home", 
      "Living with family",
      "Looking to move",
      "Need housing options"
    ],
    category: "housing" 
  },
  { 
    id: 5, 
    text: "Biggest current challenges (Check all that apply)", 
    type: "checkbox_group", 
    required: true, 
    options: [
      "Mobility issues", 
      "Memory care", 
      "Financial planning", 
      "Daily assistance", 
      "Medical coordination",
      "Transportation",
      "Medication management",
      "Social isolation",
      "Home modifications",
      "Legal matters (POA, wills, etc.)"
    ],
    category: "needs" 
  },
  { 
    id: 6, 
    text: "Level of daily assistance needed", 
    type: "select", 
    required: true, 
    options: ["Minimal", "Moderate", "Substantial", "Full-time care"],
    category: "care_level" 
  },
  { 
    id: 7, 
    text: "Monthly budget target", 
    type: "select", 
    required: true, 
    options: ["Under $1,000", "$1,000-2,000", "$2,000-3,000", "$3,000-5,000", "Over $5,000"],
    category: "financial" 
  },
  { 
    id: 8, 
    text: "Desired timeline for solutions", 
    type: "select", 
    required: true, 
    options: ["Immediate", "Within 1 month", "Within 3 months", "Within 6 months", "No rush"],
    category: "timeline" 
  },
  { 
    id: 9, 
    text: "Health conditions of concern", 
    type: "text", 
    required: true, 
    placeholder: "List any major health concerns",
    category: "health" 
  },
  { 
    id: 10, 
    text: "Safety concerns", 
    type: "radio", 
    required: true, 
    options: ["Yes", "No"],
    category: "safety" 
  },
  { 
    id: 11, 
    text: "Has the care recipient served in the military?", 
    type: "radio", 
    required: true, 
    options: ["Yes", "No"],
    category: "military" 
  },
  { 
    id: 12, 
    text: "Family members involved in decisions", 
    type: "textarea", 
    required: true, 
    placeholder: "List family members involved",
    category: "family_involvement" 
  },
  { 
    id: 13, 
    text: "Anything else you think these professionals ought to know about your situation and needs?", 
    type: "textarea", 
    required: true, 
    placeholder: "Additional information",
    category: "additional_info",
    subtext: "For example, if you need help understanding Medicare, obtaining a Power of Attorney, are thinking about care possibilities, share it all here."
  },
  { 
    id: 14, 
    text: "Your contact information", 
    type: "contact_info", 
    required: true,
    category: "contact_details",
    subfields: [
      {
        name: "lastname",
        type: "text",
        placeholder: "Your last name",
        required: true
      },
      {
        name: "email",
        type: "email",
        placeholder: "Your email address",
        required: true
      },
      {
        name: "zipcode",
        type: "text",
        placeholder: "Your ZIP code",
        required: true
      },
      {
        name: "phone",
        type: "tel",
        placeholder: "Your phone number",
        required: true
      }
    ]
  }
];

export default wizardQuestions;
