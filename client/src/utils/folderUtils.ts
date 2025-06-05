
export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  color: string;
}

export interface FolderAssignment {
  documentId: string;
  emailId: string;
  folderId: string;
}

// Mock data for folders - in a real app this would come from a backend
const mockFolders: DocumentFolder[] = [
  {
    id: 'folder-3',
    name: 'Q1 2024',
    parentId: 'finances',
    createdAt: '2024-01-20T09:15:00Z',
    color: 'from-green-400 to-green-500'
  }
];

// Mock assignments - using real attachment names as IDs since that's what we have
const mockAssignments: FolderAssignment[] = [
  // Insurance folder
  { documentId: 'Medicare_Benefits_Summary_2024.pdf', emailId: 'ryoncku57t', folderId: 'insurance' },
  { documentId: 'Insurance_Coverage_Spreadsheet.xlsx', emailId: 'zez5gyxa55', folderId: 'insurance' },
  
  // Medical folder  
  { documentId: 'Medical_Records_Summary.pdf', emailId: 'zez5gyxa55', folderId: 'medical' },
  
  // Legal folder
  { documentId: 'Legal_Documents_Checklist.pdf', emailId: 'l8ob8e8p1k', folderId: 'legal' },
  
  // Finances folder
  { documentId: 'Healthcare_Expense_Tracking_2024.xlsx', emailId: '0hz8p5u8ie', folderId: 'finances' },
  { documentId: 'Family_Budget_Summary.xlsx', emailId: 'byff0azjme', folderId: 'finances' },
  
  // Q1 2024 subfolder
  { documentId: 'CT_Scan_Results_2024.dcm', emailId: 'zez5gyxa55', folderId: 'folder-3' },
  
  // Discounts folder
  { documentId: 'Senior_Living_Brochure.pdf', emailId: 'av13yvz2vf', folderId: 'discounts' },
  
  // Housing folder
  { documentId: 'Home_Care_Contract.pdf', emailId: 'byff0azjme', folderId: 'housing' },
];

export const getAllFolders = (): DocumentFolder[] => {
  console.log('getAllFolders called, returning:', mockFolders);
  return mockFolders;
};

export const getFolderById = (id: string): DocumentFolder | undefined => {
  return mockFolders.find(folder => folder.id === id);
};

export const getFoldersByParent = (parentId: string | null): DocumentFolder[] => {
  const result = mockFolders.filter(folder => folder.parentId === parentId);
  console.log(`getFoldersByParent(${parentId}) returning:`, result);
  return result;
};

export const getDocumentFolder = (documentId: string, emailId: string): DocumentFolder | null => {
  const assignment = mockAssignments.find(
    a => a.documentId === documentId && a.emailId === emailId
  );
  if (!assignment) return null;
  return getFolderById(assignment.folderId) || null;
};

export const getDocumentsInFolder = (folderId: string): FolderAssignment[] => {
  return mockAssignments.filter(assignment => assignment.folderId === folderId);
};

export const createFolder = (name: string, parentId: string | null = null): DocumentFolder => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600', 
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600'
  ];
  
  const newFolder: DocumentFolder = {
    id: `folder-${Date.now()}`,
    name,
    parentId,
    createdAt: new Date().toISOString(),
    color: colors[Math.floor(Math.random() * colors.length)]
  };
  
  console.log('Creating folder:', newFolder);
  mockFolders.push(newFolder);
  console.log('Updated mockFolders:', mockFolders);
  return newFolder;
};

export const deleteFolder = (folderId: string): void => {
  console.log('Deleting folder:', folderId);
  
  // Remove the folder from mockFolders
  const folderIndex = mockFolders.findIndex(folder => folder.id === folderId);
  if (folderIndex >= 0) {
    mockFolders.splice(folderIndex, 1);
  }
  
  // Remove any document assignments to this folder
  const assignmentsToRemove = mockAssignments.filter(assignment => assignment.folderId === folderId);
  assignmentsToRemove.forEach(assignment => {
    const assignmentIndex = mockAssignments.findIndex(
      a => a.documentId === assignment.documentId && a.emailId === assignment.emailId
    );
    if (assignmentIndex >= 0) {
      mockAssignments.splice(assignmentIndex, 1);
    }
  });
  
  // Also delete any child folders recursively
  const childFolders = mockFolders.filter(folder => folder.parentId === folderId);
  childFolders.forEach(childFolder => {
    deleteFolder(childFolder.id);
  });
  
  console.log('Updated mockFolders after deletion:', mockFolders);
};

export const assignDocumentToFolder = (documentId: string, emailId: string, folderId: string): void => {
  // Remove existing assignment
  const existingIndex = mockAssignments.findIndex(
    a => a.documentId === documentId && a.emailId === emailId
  );
  if (existingIndex >= 0) {
    mockAssignments.splice(existingIndex, 1);
  }
  
  // Add new assignment
  mockAssignments.push({ documentId, emailId, folderId });
};

export const removeDocumentFromFolder = (documentId: string, emailId: string): void => {
  const index = mockAssignments.findIndex(
    a => a.documentId === documentId && a.emailId === emailId
  );
  if (index >= 0) {
    mockAssignments.splice(index, 1);
  }
};
