export interface Question {
  id: number;
  text: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "radio"
    | "textarea"
    | "contact_info"
    | "multiselect"
    | "checkbox_group";
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
    category: "demographic",
  },
  {
    id: 2,
    text: "Age of first person who may need some kind of care?",
    type: "number",
    required: true,
    placeholder: "Enter age of first person",
    category: "recipient_info",
    subtext: "If there is a second person, what is their age?",
    subfields: [
      {
        name: "secondPersonAge",
        type: "number",
        placeholder: "Age of second person (if applicable)",
        required: false,
      },
    ],
  },
  {
    id: 3,
    text: "Relationship to care recipient",
    type: "select",
    required: true,
    options: [
      "Mom",
      "Dad",
      "Husband",
      "Wife",
      "Brother",
      "Sister",
      "Friend",
      "Other",
    ],
    category: "relationship",
  },
  {
    id: 4,
    text: "Living situation (Select all that apply)",
    type: "checkbox_group",
    required: true,
    options: [
      "Living home alone",
      "Living with family",
      "In Rehab with a planned discharge soon",
      "In a senior living community",
      "In a skilled nursing facility",
    ],
    category: "housing",
  },
  {
    id: 5,
    text: "Current life challenges (Check all that apply)",
    type: "checkbox_group",
    required: true,
    options: [
      "No challenges. Simply seeking independent lifestyle options",
      "Mobility issues",
      "Memory care",
      "Financial resources and how to pay for care",
      "Assistance with Activities of Daily Living",
      "Medication Management",
      "No longer drives. Needs Transportation",
      "Is socially isolated",
      "Meal preparation or grocery shopping assistance",
      "Home modifications",
      "Legal matters (Power of Attorney, Wills, etc.)",
    ],
    category: "needs",
  },
  {
    id: 6,
    text: "Level of daily assistance and oversight you think is needed",
    type: "select",
    required: true,
    options: ["Minimal", "Moderate", "Substantial", "Full-time care"],
    category: "care_level",
  },
  {
    id: 7,
    text: "What is the monthly income available for care?",
    type: "select",
    required: true,
    options: [
      "Under $1,000",
      "$1,000-2,000",
      "$2,000-3,000",
      "$3,000-5,000",
      "$5,000-7,000",
      "$7,000-9,000",
      "$9,000+",
    ],
    category: "financial",
  },
  {
    id: 8,
    text: "Desired timeline for solutions",
    type: "select",
    required: true,
    options: [
      "Immediate",
      "Within 1 month",
      "Within 3 months",
      "Within 6 months",
      "Flexible because we are just exploring options right now",
    ],
    category: "timeline",
  },
  {
    id: 9,
    text: "Health conditions of concern",
    type: "textarea",
    required: true,
    placeholder: "List any major health concerns",
    category: "health",
  },
  {
    id: 10,
    text: "Financial situation (Select all that apply)",
    type: "checkbox_group",
    required: true,
    options: [
      "Own a home",
      "Rent a home",
      "Have savings",
      "Have a pension",
      "Have a 401k",
      "Have Social Security",
      "Have Life Insurance",
      "Have Long-Term Care Insurance",
    ],
    category: "financial_situation",
  },
  {
    id: 11,
    text: "Is the person a veteran or spouse of a veteran?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
    category: "military",
  },
  {
    id: 12,
    text: "Family members involved in decisions",
    type: "textarea",
    required: true,
    placeholder: "Describe the family members involved in care decisions",
    category: "family_involvement",
  },
  {
    id: 13,
    text: "Additional information professionals should know",
    type: "textarea",
    required: true,
    placeholder:
      "Share any other relevant details about your situation that you think could be helpful to the recipients in these organizations",
    category: "additional_info",
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
        required: true,
      },
      {
        name: "email",
        type: "email",
        placeholder: "Your email address",
        required: true,
      },
      {
        name: "zipcode",
        type: "text",
        placeholder: "Your ZIP code",
        required: true,
      },
      {
        name: "phone",
        type: "tel",
        placeholder: "Your phone number",
        required: true,
      },
    ],
  },
  {
    id: 15,
    text: "Select resource types you'd like to connect with",
    type: "checkbox_group",
    required: true,
    options: [
      "Select All",
      "Veteran Benefits specialists",
      "Aging Life Care Professionals",
      "Home Care Companies",
      "Government Agencies",
      "Financial Advisors",
    ],
    category: "resource_types",
  },
];

export default wizardQuestions;
