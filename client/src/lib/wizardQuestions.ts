export interface Question {
  id: number;
  text: string;
  type: "text" | "email" | "number" | "select" | "radio" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

// The 15 questions for the wizard as specified in the brief
export const wizardQuestions: Question[] = [
  { 
    id: 1, 
    text: "Your first name", 
    type: "text", 
    required: true, 
    placeholder: "Enter your first name" 
  },
  { 
    id: 2, 
    text: "Your email", 
    type: "email", 
    required: true, 
    placeholder: "Enter your email address" 
  },
  { 
    id: 3, 
    text: "Care recipient's age", 
    type: "number", 
    required: true, 
    placeholder: "Enter age" 
  },
  { 
    id: 4, 
    text: "Relationship to care recipient", 
    type: "select", 
    required: true, 
    options: ["Parent", "Spouse", "Sibling", "Friend", "Other"] 
  },
  { 
    id: 5, 
    text: "Living situation", 
    type: "select", 
    required: true, 
    options: ["Independent living", "Independent living with assistance", "Assisted living facility", "Nursing home", "Living with family"] 
  },
  { 
    id: 6, 
    text: "ZIP / location", 
    type: "text", 
    required: true, 
    placeholder: "Enter ZIP code" 
  },
  { 
    id: 7, 
    text: "Biggest current challenge", 
    type: "select", 
    required: true, 
    options: ["Mobility issues", "Memory care", "Financial planning", "Daily assistance", "Medical coordination"] 
  },
  { 
    id: 8, 
    text: "Monthly budget target", 
    type: "select", 
    required: true, 
    options: ["Under $1,000", "$1,000-2,000", "$2,000-3,000", "$3,000-5,000", "Over $5,000"] 
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
    text: "Level of daily assistance needed", 
    type: "select", 
    required: true, 
    options: ["Minimal", "Moderate", "Substantial", "Full-time care"] 
  },
  { 
    id: 11, 
    text: "Safety concerns", 
    type: "radio", 
    required: true, 
    options: ["Yes", "No"] 
  },
  { 
    id: 12, 
    text: "Desired timeline for solutions", 
    type: "select", 
    required: true, 
    options: ["Immediate", "Within 1 month", "Within 3 months", "Within 6 months", "No rush"] 
  },
  { 
    id: 13, 
    text: "Family members involved in decisions", 
    type: "text", 
    required: false, 
    placeholder: "List family members involved" 
  },
  { 
    id: 14, 
    text: "Has the care recipient served in the military?", 
    type: "radio", 
    required: true, 
    options: ["Yes", "No"] 
  },
  { 
    id: 15, 
    text: "Anything else we should know?", 
    type: "textarea", 
    required: false, 
    placeholder: "Additional information" 
  }
];

export default wizardQuestions;
