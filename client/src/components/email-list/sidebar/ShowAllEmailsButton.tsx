
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShowAllEmailsButtonProps {
  category: string | undefined;
  activeTab: string;
}

const ShowAllEmailsButton: React.FC<ShowAllEmailsButtonProps> = ({ category, activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="px-3 mb-2">
      <Button
        variant="outline"
        size="sm"
        className={`w-full justify-start bg-purple-600 hover:bg-purple-700 text-white border-purple-600 ${
          category === 'all' ? 'ring-2 ring-purple-300' : ''
        }`}
        onClick={() => navigate(`/emails/all/${activeTab}`)}
      >
        <Mail className="mr-2 h-4 w-4" />
        Show All Emails
      </Button>
    </div>
  );
};

export default ShowAllEmailsButton;
