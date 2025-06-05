
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface DocumentActionsProps {
  emailId: string;
  badgeColor: string;
  layout?: 'grid' | 'list';
}

const DocumentActions = ({ emailId, badgeColor, layout = 'grid' }: DocumentActionsProps) => {
  const navigate = useNavigate();

  // Convert colors to -500 variants and ensure sent documents use orange
  const getSofterColor = (color: string) => {
    // Check if this is a sent document (orange family)
    if (color.includes('bg-orange-500')) return 'bg-orange-500 hover:bg-orange-600 text-white';
    if (color.includes('bg-purple-500')) return 'bg-purple-500 hover:bg-purple-600 text-white';
    if (color.includes('bg-blue-500')) return 'bg-blue-500 hover:bg-blue-600 text-white';
    if (color.includes('bg-green-500')) return 'bg-green-500 hover:bg-green-600 text-white';
    if (color.includes('bg-red-500')) return 'bg-red-500 hover:bg-red-600 text-white';
    // Default variant for any other colors
    return 'bg-gray-500 hover:bg-gray-600 text-white';
  };

  const softColor = getSofterColor(badgeColor);

  if (layout === 'grid') {
    return (
      <div className="flex gap-2 mt-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/email/${emailId}`)}
          className="flex-1 text-xs h-8 px-3 border-gray-300 hover:bg-gray-50 font-medium"
        >
          View Email
        </Button>
        <Button
          size="sm"
          className={`${softColor} flex-1 text-xs h-8 px-3 font-medium`}
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate(`/email/${emailId}`)}
      >
        View Email
      </Button>
      <Button
        size="sm"
        className={softColor}
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>
    </div>
  );
};

export default DocumentActions;
