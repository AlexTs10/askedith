import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getEmailByIdWithAttachments } from '../utils/emailDataUtils';
import { EmailData } from '../types/email';
import { useEmailCategoryData } from '@/hooks/useEmailCategoryData';
import { useSlideOutCalendar } from '@/hooks/useSlideOutCalendar';
import EmailDetailHeader from '../components/email-detail/EmailDetailHeader';
import EmailDetailCard from '../components/email-detail/EmailDetailCard';
import EmailDetailActions from '../components/email-detail/EmailDetailActions';
import EmailSidebar from '../components/email-list/EmailSidebar';
import EmailReplyForm from '../components/EmailReplyForm';
import NewEmailForm from '../components/NewEmailForm';
import SlideOutCalendarSidebar from '../components/calendar/SlideOutCalendarSidebar';
import { useToast } from '../hooks/use-toast';
import { Mail, ArrowLeft, Home } from 'lucide-react';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState<EmailData | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showNewEmailForm, setShowNewEmailForm] = useState(false);
  const { emailCategories, refreshCategories } = useEmailCategoryData();
  const { toast } = useToast();
  const { isCalendarOpen, openCalendar, closeCalendar } = useSlideOutCalendar();
  
  // Don't open calendar by default - let user control it
  
  useEffect(() => {
    // Force scroll to top immediately and override any other scroll behavior
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    if (id) {
      const foundEmail = getEmailByIdWithAttachments(id);
      if (foundEmail) {
        setEmail(foundEmail);
        
        // In a real app, we would mark it as read on the server
        // For this mock, we'll just update the local state
        if (!foundEmail.read) {
          foundEmail.read = true;
        }
      }
    }
    
    // Additional scroll to top after a brief delay to ensure it takes effect
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [id]);
  
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-medium text-gray-800 mb-3">
            Oops! Email Not Found
          </h2>
          
          <p className="text-gray-600 mb-2 leading-relaxed">
            We couldn't locate the email you're looking for. It may have been moved, deleted, or the link might be outdated.
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Don't worry - your other emails are safe and waiting for you!
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/emails/all/all')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse All Emails
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Communication Hub
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-6">
            Use the sidebar to browse emails by category or status
          </p>
        </div>
      </div>
    );
  }
  
  // In a real app, these functions would communicate with a backend
  const handleMarkAsReplied = () => {
    if (email) {
      email.replied = true;
      // Force a re-render
      setEmail({...email});
    }
  };
  
  const handleMarkAsResponseReceived = () => {
    if (email) {
      email.responseReceived = true;
      // Force a re-render
      setEmail({...email});
    }
  };

  const handleMarkAsPrivate = () => {
    if (email) {
      email.private = !email.private;
      // Force a re-render
      setEmail({...email});
    }
  };

  const handleReplyClick = () => {
    setShowReplyForm(true);
  };

  const handleReplyAllClick = () => {
    // For now, same functionality as regular reply
    // Can be enhanced later to include all recipients
    setShowReplyForm(true);
  };

  const handleReplyClose = () => {
    setShowReplyForm(false);
  };

  const handleReplySend = (replyData: any) => {
    // This will be connected to Nylas later
    console.log('Reply sent:', replyData);
    
    // Update email status
    if (email) {
      email.replied = true;
      setEmail({...email});
    }
    
    setShowReplyForm(false);
  };

  const handleNewEmail = (emailData: any) => {
    // This is where you'll integrate with actual email sending
    console.log('New email to be sent:', emailData);
    
    toast({
      title: "Email Sent",
      description: `Email sent to ${emailData.toName} at ${emailData.toOrganization}`,
    });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex w-full">
        {/* Left Sidebar */}
        <EmailSidebar 
          emailCategories={emailCategories} 
          category={email.category} 
          activeTab="all"
          onCategoryAdded={refreshCategories}
        />
        
        {/* Main Content */}
        <div className="flex-1 pl-24 pr-8">
          <div className="container mx-auto px-4 py-8">
            <EmailDetailHeader 
              email={email} 
              onCalendarClick={openCalendar}
            />
            
            {/* Actions Above Email Card */}
            <EmailDetailActions
              email={email}
              onReplyClick={handleReplyClick}
              onReplyAllClick={handleReplyAllClick}
              onMarkAsReplied={handleMarkAsReplied}
              onMarkAsResponseReceived={handleMarkAsResponseReceived}
              onMarkAsPrivate={handleMarkAsPrivate}
              onComposeClick={() => setShowNewEmailForm(true)}
              showReplyForm={showReplyForm}
              position="above"
            />
            
            <EmailDetailCard email={email} />
            
            {/* Actions Below Email Card */}
            <EmailDetailActions
              email={email}
              onReplyClick={handleReplyClick}
              onReplyAllClick={handleReplyAllClick}
              onMarkAsReplied={handleMarkAsReplied}
              onMarkAsResponseReceived={handleMarkAsResponseReceived}
              onMarkAsPrivate={handleMarkAsPrivate}
              onComposeClick={() => setShowNewEmailForm(true)}
              showReplyForm={showReplyForm}
              position="below"
            />
            
            {/* Reply Form */}
            {showReplyForm && (
              <EmailReplyForm
                originalEmail={email}
                onClose={handleReplyClose}
                onSend={handleReplySend}
              />
            )}

            {/* New Email Form */}
            <NewEmailForm
              isOpen={showNewEmailForm}
              onClose={() => setShowNewEmailForm(false)}
              onSend={handleNewEmail}
            />
          </div>
        </div>

        {/* Slide-out Calendar Sidebar */}
        <SlideOutCalendarSidebar
          isOpen={isCalendarOpen}
          onClose={closeCalendar}
        />
      </div>
    </SidebarProvider>
  );
};

export default EmailDetail;
