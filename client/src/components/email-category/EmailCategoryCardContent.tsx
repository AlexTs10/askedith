
import React from 'react';

interface StatusItem {
  label: string;
  count: number;
  color: string;
  status: 'unread' | 'pending' | 'unresponded';
  navStatus: string;
}

interface EmailCategoryCardContentProps {
  isExpanded: boolean;
  activeStatuses: StatusItem[];
  unread: number;
  pending: number;
  total: number;
  color: string;
  onStatusClick: (status: string, e: React.MouseEvent) => void;
  onStatusHover: (status: 'unread' | 'pending' | 'unresponded', event: React.MouseEvent) => void;
  onStatusLeave: () => void;
}

const EmailCategoryCardContent: React.FC<EmailCategoryCardContentProps> = ({
  isExpanded,
  activeStatuses,
  unread,
  pending,
  total,
  color,
  onStatusClick,
  onStatusHover,
  onStatusLeave
}) => {
  // Always create exactly 3 status rows for consistent height
  const statusRows = [];
  for (let i = 0; i < 3; i++) {
    if (i < activeStatuses.length) {
      const statusItem = activeStatuses[i];
      statusRows.push(
        <div 
          key={statusItem.status}
          className="flex items-center justify-between text-xs sm:text-sm hover:bg-gray-50 p-1.5 rounded transition-colors"
          onClick={(e) => onStatusClick(statusItem.navStatus, e)}
          onMouseEnter={(e) => onStatusHover(statusItem.status, e)}
          onMouseLeave={onStatusLeave}
        >
          <span className="text-gray-600">{statusItem.label}</span>
          <div className={`flex items-center justify-center w-5 h-5 sm:w-5 sm:h-5 ${statusItem.color} rounded-full text-white text-xs font-medium transition-transform group-hover:scale-110`}
          onClick={(e) => {
            e.stopPropagation();
            onStatusClick(statusItem.navStatus, e);
          }}
          title={`${statusItem.count} ${statusItem.label.toLowerCase()}`}
          >
            {statusItem.count}
          </div>
        </div>
      );
    } else {
      // Add invisible placeholder rows to maintain consistent height
      statusRows.push(
        <div key={`placeholder-${i}`} className="flex items-center justify-between text-xs sm:text-sm p-1.5 opacity-0 pointer-events-none">
          <span>Placeholder</span>
          <div className="w-5 h-5 sm:w-5 sm:h-5"></div>
        </div>
      );
    }
  }

  return (
    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="flex-1 flex flex-col justify-between">
        {/* Status rows container with fixed height for exactly 3 rows */}
        <div className="h-[96px] flex flex-col justify-start">
          <div className="space-y-1">
            {statusRows}
          </div>
        </div>

        {/* Bottom sections - always positioned consistently with more spacing */}
        <div className="mt-6 space-y-4">
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
  );
};

export default EmailCategoryCardContent;
