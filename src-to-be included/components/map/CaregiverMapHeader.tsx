
import React from 'react';
import { useNavigate } from 'react-router-dom';
import IndexActionButtons from '../../pages/IndexActionButtons';

interface CaregiverMapHeaderProps {
  isLoading: boolean;
}

const CaregiverMapHeader: React.FC<CaregiverMapHeaderProps> = ({ isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-teal-700 text-white px-6 py-4">
      <div className="flex items-center justify-between h-[3rem]">
        <div className="text-base font-normal flex items-center">
          Search Places or Care Categories Below {isLoading && <span className="ml-2 text-sm">(Searching...)</span>}
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="[&_button]:text-white [&_button:hover]:text-gray-200 [&_svg]:text-white [&_button:hover_svg]:text-gray-200 [&_div]:mt-0">
            <IndexActionButtons
              onNewEmail={() => {
                navigate('/');
              }}
              onViewDocuments={() => navigate('/documents')}
              onCalendarClick={() => {
                navigate('/');
                setTimeout(() => {
                  const calendarSection = document.getElementById('calendar-section');
                  if (calendarSection) {
                    calendarSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
            />
          </div>
        </div>
        
        <div className="w-48"></div>
      </div>
    </div>
  );
};

export default CaregiverMapHeader;
