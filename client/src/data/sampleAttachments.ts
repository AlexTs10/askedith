
import { EmailAttachment } from '../types/email';

export const sampleAttachments: { [emailId: string]: EmailAttachment[] } = {
  "ryoncku57t": [
    {
      id: "att_001",
      name: "Medicare_Benefits_Summary_2024.pdf",
      size: 1024000,
      type: "application/pdf",
      url: "/documents/medicare-benefits-2024.pdf"
    },
    {
      id: "att_002", 
      name: "Care_Plan_Updates.docx",
      size: 512000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "/documents/care-plan-updates.docx"
    },
    {
      id: "att_016",
      name: "Medical_History_Archive.zip",
      size: 3840000,
      type: "application/zip",
      url: "/documents/medical-history-archive.zip"
    }
  ],
  "0hz8p5u8ie": [
    {
      id: "att_003",
      name: "Facility_Tour_Photos.jpg",
      size: 2048000,
      type: "image/jpeg",
      url: "/documents/facility-photos.jpg"
    },
    {
      id: "att_014",
      name: "Healthcare_Expense_Tracking_2024.xlsx",
      size: 945000,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      url: "/documents/healthcare-expenses-2024.xlsx"
    }
  ],
  "zez5gyxa55": [
    {
      id: "att_004",
      name: "Insurance_Coverage_Spreadsheet.xlsx",
      size: 768000,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      url: "/documents/insurance-coverage.xlsx"
    },
    {
      id: "att_005",
      name: "Medical_Records_Summary.pdf",
      size: 1536000,
      type: "application/pdf", 
      url: "/documents/medical-records.pdf"
    },
    {
      id: "att_017",
      name: "CT_Scan_Results_2024.dcm",
      size: 4096000,
      type: "application/dicom",
      url: "/documents/ct-scan-results.dcm"
    }
  ],
  "2klhak25kz": [
    {
      id: "att_006",
      name: "VA_Benefits_Application.pdf",
      size: 896000,
      type: "application/pdf",
      url: "/documents/va-benefits-app.pdf"
    },
    {
      id: "att_018",
      name: "Service_Records_Complete.pdf",
      size: 2550000,
      type: "application/pdf",
      url: "/documents/service-records.pdf"
    }
  ],
  "2us8bbbm5x": [
    {
      id: "att_007",
      name: "Physical_Therapy_Schedule.docx",
      size: 384000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "/documents/pt-schedule.docx"
    },
    {
      id: "att_008",
      name: "Exercise_Progress_Chart.png",
      size: 1280000,
      type: "image/png",
      url: "/documents/exercise-chart.png"
    },
    {
      id: "att_019",
      name: "Recovery_Timeline_Infographic.svg",
      size: 620000,
      type: "image/svg+xml",
      url: "/documents/recovery-timeline.svg"
    }
  ],
  "byff0azjme": [
    {
      id: "att_009",
      name: "Home_Care_Contract.pdf",
      size: 1792000,
      type: "application/pdf",
      url: "/documents/home-care-contract.pdf"
    },
    {
      id: "att_015",
      name: "Family_Budget_Summary.xlsx",
      size: 672000,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      url: "/documents/family-budget-summary.xlsx"
    }
  ],
  "l8ob8e8p1k": [
    {
      id: "att_010",
      name: "Attorney_Consultation_Notes.txt",
      size: 128000,
      type: "text/plain",
      url: "/documents/attorney-notes.txt"
    },
    {
      id: "att_011",
      name: "Legal_Documents_Checklist.pdf",
      size: 640000,
      type: "application/pdf",
      url: "/documents/legal-checklist.pdf"
    },
    {
      id: "att_020",
      name: "Power_of_Attorney_Forms.pdf",
      size: 890000,
      type: "application/pdf",
      url: "/documents/power-of-attorney.pdf"
    }
  ],
  "av13yvz2vf": [
    {
      id: "att_012",
      name: "Senior_Living_Brochure.pdf",
      size: 2048000,
      type: "application/pdf",
      url: "/documents/senior-living-brochure.pdf"
    },
    {
      id: "att_013",
      name: "Monthly_Activity_Schedule.docx",
      size: 512000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "/documents/activity-schedule.docx"
    }
  ],
  // New sent emails with attachments
  "sent_001": [
    {
      id: "att_sent_001",
      name: "Insurance_Questions_Response.pdf",
      size: 845000,
      type: "application/pdf",
      url: "/documents/insurance-questions-response.pdf"
    },
    {
      id: "att_sent_002",
      name: "Updated_Emergency_Contacts.docx",
      size: 325000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "/documents/emergency-contacts.docx"
    }
  ],
  "sent_002": [
    {
      id: "att_sent_003",
      name: "Family_Medical_History_Complete.xlsx",
      size: 1240000,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      url: "/documents/family-medical-history.xlsx"
    }
  ],
  "sent_003": [
    {
      id: "att_sent_004",
      name: "Care_Preferences_Form.pdf",
      size: 680000,
      type: "application/pdf",
      url: "/documents/care-preferences.pdf"
    },
    {
      id: "att_sent_005",
      name: "Weekly_Schedule_Photo.jpg",
      size: 1560000,
      type: "image/jpeg",
      url: "/documents/weekly-schedule.jpg"
    }
  ],
  // New sent emails with attachments to recipients who also sent documents
  "sent_004": [
    {
      id: "att_sent_006",
      name: "PT_Progress_Report_November.pdf",
      size: 950000,
      type: "application/pdf",
      url: "/documents/pt-progress-november.pdf"
    },
    {
      id: "att_sent_007",
      name: "Mobility_Improvement_Photos.jpg",
      size: 1890000,
      type: "image/jpeg",
      url: "/documents/mobility-photos.jpg"
    },
    {
      id: "att_sent_008",
      name: "Therapist_Recommendations.docx",
      size: 420000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "/documents/therapist-recommendations.docx"
    }
  ],
  "sent_005": [
    {
      id: "att_sent_009",
      name: "Home_Modifications_Before_After.jpg",
      size: 2150000,
      type: "image/jpeg",
      url: "/documents/home-modifications.jpg"
    },
    {
      id: "att_sent_010",
      name: "Contractor_Invoices_Permits.pdf",
      size: 1320000,
      type: "application/pdf",
      url: "/documents/contractor-invoices.pdf"
    },
    {
      id: "att_sent_011",
      name: "Safety_Inspection_Reports.pdf",
      size: 780000,
      type: "application/pdf",
      url: "/documents/safety-inspection.pdf"
    }
  ],
  "sent_006": [
    {
      id: "att_sent_012",
      name: "Medical_Expenses_Q4_2024.xlsx",
      size: 1150000,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      url: "/documents/medical-expenses-q4.xlsx"
    },
    {
      id: "att_sent_013",
      name: "Insurance_Claims_Documentation.pdf",
      size: 1680000,
      type: "application/pdf",
      url: "/documents/insurance-claims.pdf"
    }
  ],
  "sent_007": [
    {
      id: "att_sent_014",
      name: "Healthcare_Directive_Signed.pdf",
      size: 720000,
      type: "application/pdf",
      url: "/documents/healthcare-directive.pdf"
    },
    {
      id: "att_sent_015",
      name: "Financial_Power_of_Attorney.pdf",
      size: 890000,
      type: "application/pdf",
      url: "/documents/financial-poa.pdf"
    },
    {
      id: "att_sent_016",
      name: "Updated_Will_Testament.pdf",
      size: 1250000,
      type: "application/pdf",
      url: "/documents/will-testament.pdf"
    }
  ]
};
