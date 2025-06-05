
import React from 'react';
import { useAppointmentFiltering } from '../../hooks/useAppointmentFiltering';
import { useDocumentFiltering } from '../../hooks/useDocumentFiltering';
import AppointmentPreview from './AppointmentPreview';
import DocumentPreview from './DocumentPreview';

interface UnifiedSearchResultsProps {
  searchQuery: string;
}

const UnifiedSearchResults: React.FC<UnifiedSearchResultsProps> = ({ searchQuery }) => {
  const { filteredAppointments } = useAppointmentFiltering({ searchQuery });
  const { filteredDocuments } = useDocumentFiltering({ searchQuery });

  console.log('UnifiedSearchResults render:', { 
    searchQuery: searchQuery.trim(), 
    appointmentsCount: filteredAppointments.length,
    documentsCount: filteredDocuments.length 
  });

  // Don't show anything if there's no search query
  if (!searchQuery.trim()) {
    return null;
  }

  // Don't show if no results found
  if (filteredAppointments.length === 0 && filteredDocuments.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 mb-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAppointments.length > 0 && (
          <div className="w-full">
            <AppointmentPreview appointments={filteredAppointments} />
          </div>
        )}
        
        {filteredDocuments.length > 0 && (
          <div className="w-full">
            <DocumentPreview documents={filteredDocuments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSearchResults;
