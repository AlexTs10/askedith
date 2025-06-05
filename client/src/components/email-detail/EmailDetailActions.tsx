
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Reply, CheckCircle, Clock, Lock, Unlock, ReplyAll } from 'lucide-react';
import { EmailData } from '../../types/email';
import { categoryInfo } from '../../utils/categoryUtils';

interface EmailDetailActionsProps {
  email: EmailData;
  onReplyClick: () => void;
  onReplyAllClick: () => void;
  onMarkAsReplied: () => void;
  onMarkAsResponseReceived: () => void;
  onMarkAsPrivate: () => void;
  onComposeClick: () => void;
  showReplyForm: boolean;
  position: 'above' | 'below';
}

const EmailDetailActions: React.FC<EmailDetailActionsProps> = ({
  email,
  onReplyClick,
  onReplyAllClick,
  onMarkAsReplied,
  onMarkAsResponseReceived,
  onMarkAsPrivate,
  onComposeClick,
  showReplyForm,
  position
}) => {
  const navigate = useNavigate();
  const currentCategory = categoryInfo[email.category];
  
  if (position === 'above') {
    return (
      <div className="space-y-6 mb-6">
        <div className="flex flex-wrap gap-3 justify-start">
          <Button
            onClick={onComposeClick}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Reply className="mr-2 h-4 w-4" />
            Compose New Email
          </Button>
          
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={onReplyClick}
            disabled={showReplyForm}
          >
            <Reply className="mr-1 h-4 w-4" /> Reply
          </Button>

          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={onReplyAllClick}
            disabled={showReplyForm}
          >
            <ReplyAll className="mr-1 h-4 w-4" /> Reply All
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-start">
        {!email.replied && (
          <Button variant="outline" onClick={onMarkAsReplied}>
            <CheckCircle className="mr-1 h-4 w-4" /> Mark as Replied
          </Button>
        )}
        
        {email.replied && !email.responseReceived && (
          <Button variant="outline" onClick={onMarkAsResponseReceived}>
            <Clock className="mr-1 h-4 w-4" /> Mark Response Received
          </Button>
        )}
        
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onMarkAsPrivate}
        >
          {email.private ? (
            <>
              <Unlock className="mr-1 h-4 w-4" /> Remove Private
            </>
          ) : (
            <>
              <Lock className="mr-1 h-4 w-4" /> Mark Private
            </>
          )}
        </Button>
        
        <Button variant="outline" onClick={() => navigate(`/emails/${email.category}/all`)}>
          View All {currentCategory.title} Emails
        </Button>
      </div>
    </div>
  );
};

export default EmailDetailActions;
