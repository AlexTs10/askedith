
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from './SummaryCard';

interface SummarySectionProps {
  totalUnread: number;
  totalPending: number;
  totalUnresponded: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({ totalUnread, totalPending, totalUnresponded }) => {
  const navigate = useNavigate();
  
  const handleSummaryCardClick = (status: string) => {
    navigate(`/emails/all/${status}`);
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
      {/* Unread Messages Card */}
      <SummaryCard 
        title="Unread Messages"
        count={totalUnread}
        color="from-purple-400 to-purple-500"
        onClick={() => handleSummaryCardClick('unread')}
      />
      
      {/* Pending Replies Card */}
      <SummaryCard 
        title="Pending Replies"
        count={totalPending}
        color="from-amber-400 to-orange-500"
        onClick={() => handleSummaryCardClick('pending')}
      />
      
      {/* Has Not Responded Yet Card */}
      <SummaryCard 
        title="Has Not Responded Yet"
        count={totalUnresponded}
        color="from-red-400 to-red-600"
        onClick={() => handleSummaryCardClick('unresponded')}
      />
    </div>
  );
};

export default SummarySection;
