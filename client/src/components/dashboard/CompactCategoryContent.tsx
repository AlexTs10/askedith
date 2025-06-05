
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmailCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  unread: number;
  pending: number;
  total: number;
  color: string;
  bgColor: string;
  textColor: string;
}

interface CompactCategoryContentProps {
  category: EmailCategory;
  isExpanded: boolean;
  notRespondedCount: number;
  onStatusClick: (status: string, e: React.MouseEvent) => void;
  onStatusHover: (status: 'unread' | 'pending' | 'unresponded', e: React.MouseEvent) => void;
  onStatusLeave: () => void;
  onCardContentClick: () => void;
}

const CompactCategoryContent: React.FC<CompactCategoryContentProps> = ({
  category,
  isExpanded,
  notRespondedCount,
  onStatusClick,
  onStatusHover,
  onStatusLeave,
  onCardContentClick
}) => {
  const { id, unread, pending, total, color } = category;

  // Create array of active statuses (only show rows with activity)
  const activeStatuses = [
    ...(unread > 0 ? [{
      label: 'Unread messages',
      count: unread,
      color: 'bg-purple-500',
      status: 'unread' as const,
      navStatus: 'unread'
    }] : []),
    ...(pending > 0 ? [{
      label: 'Pending replies',
      count: pending,
      color: 'bg-amber-500',
      status: 'pending' as const,
      navStatus: 'pending'
    }] : []),
    ...(notRespondedCount > 0 ? [{
      label: 'Has not responded yet',
      count: notRespondedCount,
      color: 'bg-red-500',
      status: 'unresponded' as const,
      navStatus: 'no-response'
    }] : [])
  ];

  return (
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded 
          ? 'max-h-96 opacity-100 mt-4' 
          : 'max-h-0 opacity-0 mt-0'
      }`}
    >
      <div className="animate-fade-in px-4 sm:px-6">
        <div 
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group hover:translate-y-[-4px] flex flex-col"
          onClick={onCardContentClick}
        >
          {/* Stats section with fixed height for consistency */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Status rows container with fixed minimum height */}
            <div className="min-h-[72px] flex flex-col justify-start">
              {activeStatuses.length > 0 ? (
                <div className="space-y-0.5 sm:space-y-1">
                  {activeStatuses.map((statusItem) => (
                    <div 
                      key={statusItem.status}
                      className="flex items-center justify-between text-xs sm:text-sm hover:bg-gray-50 p-1.5 rounded transition-colors"
                      onClick={(e) => onStatusClick(statusItem.navStatus, e)}
                      onMouseEnter={(e) => {
                        console.log(`🔵 ${statusItem.status} hover:`, { count: statusItem.count, categoryId: id });
                        statusItem.count > 0 && onStatusHover(statusItem.status, e);
                      }}
                      onMouseLeave={onStatusLeave}
                    >
                      <span className="text-gray-600">{statusItem.label}</span>
                      <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 ${statusItem.color} rounded-full text-white text-xs font-medium transition-transform group-hover:scale-105`}>
                        {statusItem.count}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">All caught up!</p>
                  <p className="text-gray-400 text-xs mt-1">No pending items</p>
                </div>
              )}
            </div>

            {/* Bottom sections - always positioned consistently */}
            <div className="mt-4 space-y-4">
              {/* Progress indicator - only show if there's activity */}
              {activeStatuses.length > 0 && (
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-1 group-hover:bg-gray-200 transition-colors">
                    <div 
                      className={`h-1 rounded-full bg-gradient-to-r ${color} transition-all duration-300 group-hover:scale-x-105`}
                      style={{ width: `${Math.min((unread + pending) / total * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {unread + pending > 0 ? `${unread + pending} items need attention` : 'All caught up!'}
                  </p>
                </div>
              )}
              
              {/* Total conversations - styled with category color and white text */}
              <div className={`flex items-center justify-between text-xs sm:text-sm p-2 rounded-lg bg-gradient-to-r ${color} group-hover:shadow-lg transition-shadow`}>
                <span className="text-white font-medium">Total conversations</span>
                <span className="text-white font-bold">{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactCategoryContent;
