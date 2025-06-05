
import React from 'react';

interface StatusBadgeProps {
  direction: 'received' | 'sent';
  statusBadgeColor: string;
}

const StatusBadge = ({ direction, statusBadgeColor }: StatusBadgeProps) => {
  console.log('StatusBadge render - direction:', direction, 'statusBadgeColor:', statusBadgeColor);
  
  // Map direction to consistent colors matching the download button shading
  const getBadgeClasses = () => {
    if (direction === 'sent') {
      return 'bg-orange-400 text-white';
    }
    if (direction === 'received') {
      return 'bg-green-400 text-white';
    }
    // Fallback
    return 'bg-gray-400 text-white';
  };

  const badgeClasses = getBadgeClasses();
  console.log('StatusBadge - final classes:', badgeClasses);
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-normal ${badgeClasses}`}>
      {direction === 'received' ? 'Received' : 'Sent'}
    </div>
  );
};

export default StatusBadge;
