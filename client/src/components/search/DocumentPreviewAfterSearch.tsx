
import React from 'react';
import DocumentPreview from './DocumentPreview';
import { useDocumentFiltering } from '../../hooks/useDocumentFiltering';

interface DocumentPreviewAfterSearchProps {
  searchQuery: string;
}

const DocumentPreviewAfterSearch: React.FC<DocumentPreviewAfterSearchProps> = ({ searchQuery }) => {
  const { filteredDocuments } = useDocumentFiltering({ searchQuery });

  // Don't show anything if there's no search query
  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto">
      <DocumentPreview documents={filteredDocuments} />
    </div>
  );
};

export default DocumentPreviewAfterSearch;
