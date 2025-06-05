
import React from 'react';
import { Card, CardContent } from '../ui/card';

interface SummaryCardProps {
  title: string;
  count: number;
  color: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, count, color, onClick, icon }) => {
  return (
    <Card 
      className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group hover:translate-y-[-4px]"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-xs sm:text-sm font-medium">{title}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-2xl sm:text-3xl font-medium text-gray-800">{count}</p>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${color} rounded-full flex items-center justify-center`}>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            {title === 'Has Not Responded Yet' && <div className="w-1.5 h-1.5 bg-white rounded-full ml-1"></div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
