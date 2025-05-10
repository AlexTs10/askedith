export interface Question {
  id: number;
  text: string;
  type: "text" | "email" | "number" | "select" | "radio" | "textarea" | "contact_info";
  required: boolean;
  placeholder?: string;
  options?: string[];
  subfields?: {
    name: string;
    type: "text" | "email" | "number";
    placeholder: string;
    required: boolean;
  }[];
}

// Updated questions for the wizard with combined contact information
export const wizardQuestions: Question[] = [
  { 
    id: 1, 
    text: "Your contact information", 
    type: "contact_info", 
    required: true,
    subfields: [
      {
        name: "name",
        type: "text",
        placeholder: "Your first name",
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
      }
    ]
  },
  { 
    id: 2, 
    text: "Care recipient's age", 
    type: "number", 
    required: true, 
    placeholder: "Enter age" 
  },
  { 
    id: 3, 
    text: "Relationship to care recipient", 
    type: "select", 
    required: true, 
    options: ["Parent", "Spouse", "Sibling", "Friend", "Other"] 
  },
  { 
    id: 4, 
    text: "Living situation", 
    type: "select", 
    required: true, 
    options: ["Independent living", "Independent living with assistance", "Assisted living facility", "Nursing home", "Living with family"] 
  },
  { 
    id: 5, 
    text: "Biggest current challenge", 
    type: "select", 
    required: true, 
    options: ["Mobility issues", "Memory care", "Financial planning", "Daily assistance", "Medical coordination"] 
  },
  { 
    id: 6, 
    text: "Level of daily assistance needed", 
    type: "select", 
    required: true, 
    options: ["Minimal", "Moderate", "Substantial", "Full-time care"] 
  },
  { 
    id: 7, 
    text: "Monthly budget target", 
    type: "select", 
    required: true, 
    options: ["Under $1,000", "$1,000-2,000", "$2,000-3,000", "$3,000-5,000", "Over $5,000"] 
  },
  { 
    id: 8, 
    text: "Desired timeline for solutions", 
    type: "select", 
    required: true, 
    options: ["Immediate", "Within 1 month", "Within 3 months", "Within 6 months", "No rush"] 
  },
  { 
    id: 9, 
    text: "Health conditions of concern", 
    type: "text", 
    required: false, 
    placeholder: "List any major health concerns" 
  },
  { 
    id: 10, 
    text: "Safety concerns", 
    type: "radio", 
    required: true, 
    options: ["Yes", "No"] 
  },
  { 
    id: 11, 
    text: "Has the care recipient served in the military?", 
    type: "radio", 
    required: true, 
    options: ["Yes", "No"] 
  },
  { 
    id: 12, 
    text: "Family members involved in decisions", 
    type: "text", 
    required: false, 
    placeholder: "List family members involved" 
  },
  { 
    id: 13, 
    text: "Anything else we should know?", 
    type: "textarea", 
    required: false, 
    placeholder: "Additional information" 
  }
];

export default wizardQuestions;
