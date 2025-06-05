
import React from 'react';
import AppointmentPreview from './AppointmentPreview';
import { useAppointmentFiltering } from '../../hooks/useAppointmentFiltering';

interface SearchResultsPreviewProps {
  searchQuery: string;
}

const SearchResultsPreview: React.FC<SearchResultsPreviewProps> = ({ searchQuery }) => {
  const { filteredAppointments } = useAppointmentFiltering({ searchQuery });

  // Don't show anything if there's no search query
  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto">
      <AppointmentPreview appointments={filteredAppointments} />
    </div>
  );
};

export default SearchResultsPreview;
