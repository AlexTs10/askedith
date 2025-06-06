import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useWizardState from '@/lib/useWizardState';
import { NylasConnect } from '@/components/NylasConnect';
import { NylasGrantIdSetter } from '@/components/NylasGrantIdSetter';
import { ensureNylasSession } from '@/lib/nylasSession';

// Helper function to determine resource category from email data
const getResourceCategory = (email: any) => {
  // Try to extract category from subject
  const subject = email.subject?.toLowerCase() || '';
  
  if (subject.includes('veteran') || subject.includes('military')) {
    return 'Veteran Benefits';
  } else if (subject.includes('aging') || subject.includes('care professional')) {
    return 'Aging Life Care Professionals';
  } else if (subject.includes('home care') || subject.includes('homecare')) {
    return 'Home Care Companies';
  } else if (subject.includes('government') || subject.includes('agency')) {
    return 'Government Agencies';
  } else if (subject.includes('financial') || subject.includes('advisor')) {
    return 'Financial Advisors';
  }
  
  // Get from provider name if available
  const to = email.to?.toLowerCase() || '';
  
  if (to.includes('veteran') || to.includes('military')) {
    return 'Veteran Benefits';
  } else if (to.includes('care professional')) {
    return 'Aging Life Care Professionals';
  } else if (to.includes('home care') || to.includes('homecare')) {
    return 'Home Care Companies';
  } else if (to.includes('government') || to.includes('agency')) {
    return 'Government Agencies';
  } else if (to.includes('financial') || to.includes('advisor')) {
    return 'Financial Advisors';
  }
  
  // Default category
  return 'Other';
};

export default function EmailPreview() {
  const { index = "0" } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { state, updateState } = useWizardState();
  
  // Local state for editing and send status
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showSendAllOption, setShowSendAllOption] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        }
      });
  }, []);
  
  // Get the current email index
  const currentIndex = parseInt(index, 10);
  const currentEmail = state.emailsToSend[currentIndex];
  const isLastEmail = currentIndex === state.emailsToSend.length - 1;
  
  // Update local state when email changes
  useEffect(() => {
    if (currentEmail) {
      setEmailSubject(currentEmail.subject);
      setEmailBody(currentEmail.body);
    }
  }, [currentEmail]);
  
  // Check connection status when component loads
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/nylas/connection-status');
        const data = await response.json();
        setShowSendAllOption(data.connected);
      } catch (error) {
        console.error('Error checking connection status:', error);
      }
    };
    
    checkConnection();
  }, []);
  
  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Save changes
      const updatedEmails = [...state.emailsToSend];
      updatedEmails[currentIndex] = {
        ...currentEmail,
        subject: emailSubject,
        body: emailBody
      };
      
      updateState({ emailsToSend: updatedEmails });
    }
    
    setIsEditing(!isEditing);
  };
  
  // Send all emails at once with a single authentication
  const sendAllEmails = async () => {
    try {
      setIsSendingAll(true);
      await ensureNylasSession();
      
      // Save current edits first
      const updatedEmails = [...state.emailsToSend];
      updatedEmails[currentIndex] = {
        ...currentEmail,
        subject: emailSubject,
        body: emailBody
      };
      
      updateState({ emailsToSend: updatedEmails });
      
      // Prepare all emails with categories
      const emailsWithCategories = updatedEmails.map(email => ({
        to: email.to,
        from: email.from,
        replyTo: email.replyTo,
        subject: email.subject,
        body: email.body,
        category: getResourceCategory(email)
      }));
      
      console.log("Sending all emails in batch:", emailsWithCategories);
      
      // Send batch request via Nylas
      const response = await fetch('/api/nylas/send-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: emailsWithCategories }),
      });
      
      const result = await response.json();
      console.log("Batch email result:", result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send batch emails');
      }
      
      // Show success message
      toast({
        title: "All Emails Sent",
        description: `Successfully sent ${result.sent || 0} out of ${emailsWithCategories.length} emails.`,
      });
      
      // Navigate to confirmation page
      window.location.href = '/confirmation';
    } catch (error) {
      console.error("Error sending batch emails:", error);
      toast({
        title: "Error",
        description: `Failed to send batch emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSendingAll(false);
    }
  };
  
  // Send email function
  const sendEmail = async () => {
    try {
      console.log("Sending email to:", currentEmail.to);
      setIsSending(true);
      await ensureNylasSession();
      
      // Update the email in state with edited content
      const updatedEmails = [...state.emailsToSend];
      updatedEmails[currentIndex] = {
        ...currentEmail,
        subject: emailSubject,
        body: emailBody
      };
      
      updateState({ emailsToSend: updatedEmails });
      
      // Prepare the email data
      const emailData = {
        to: currentEmail.to,
        from: currentEmail.from,
        replyTo: currentEmail.replyTo, // Include the reply-to field
        subject: emailSubject,
        body: emailBody,
        category: currentEmail.category || getResourceCategory(currentEmail)
      };
      
      console.log("Email data being sent:", emailData);
      
      let response = await fetch('/api/nylas/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          category: emailData.category,
          replyTo: emailData.replyTo || emailData.from
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to send email: ${response.status}`);
      }
      
      // Parse the response
      console.log("Server response:", result);
      
      if (!response.ok || (!result.success && !result.messageId)) {
        throw new Error(result.message || result.error || `Failed to send email: ${response.status}`);
      }
      
      // Show success toast
      toast({
        title: "Email Sent",
        description: result.message || "Your email has been sent successfully."
      });
      
      // Navigate to the next email or confirmation using direct redirection
      if (isLastEmail) {
        window.location.href = '/confirmation';
      } else {
        window.location.href = `/email-preview/${currentIndex + 1}`;
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Redirect if no emails
  if (!currentEmail) {
    console.log("No current email found, redirecting to results");
    window.location.href = '/results';
    return null;
  }
  
  return (
    <div className="fade-in bg-gradient-to-b from-amber-50 to-white min-h-screen py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-normal mb-2 text-teal-600">
          <span>A</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
          <span>E</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>dith</span>
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 font-light mb-2">Share Once. Reach Many.</p>
      </div>
      
      <Card className="card bg-transparent border-0 shadow-none max-w-6xl mx-auto">
        <CardContent className="p-0">
          {/* Header section */}
          <div className="bg-teal-50 p-8 pt-10 pb-10 md:p-10 rounded-t-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif text-teal-600 mb-2">Email Preview</h2>
                <p className="text-gray-600">
                  Review and personalize your message before sending
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {(() => {
                  let fallbackEmail: string | undefined = undefined;
                  try {
                    if (state.answers?.q14) {
                      const info = JSON.parse(state.answers.q14 as string);
                      fallbackEmail = info.email;
                    }
                  } catch {
                    // ignore JSON parse errors
                  }
                  return (
                    <NylasConnect userEmail={currentEmail?.replyTo || fallbackEmail} />
                  );
                })()}
                <NylasGrantIdSetter />
                
                <div className="px-4 py-2 backdrop-blur-sm rounded-full text-sm font-medium text-gray-600">
                  Email {currentIndex + 1} of {state.emailsToSend.length}
                </div>
              </div>
            </div>
          </div>
          
          {/* Email content section */}
          <div className="p-8 md:p-10">
            <div className="relative rounded-xl overflow-hidden">
              {/* Email form */}
              <div className={`p-5 md:p-8 space-y-6 transition-opacity duration-300 ${isEditing ? 'opacity-100' : 'opacity-95'}`}>
                {/* Email header decoration */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <div className="w-3 h-3 rounded-full bg-success/60"></div>
                  <div className="flex-1 border-t border-border ml-2"></div>
                </div>
                
                <div className="space-y-6">
                  <div className="backdrop-blur-sm p-4 md:p-5 rounded-lg space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block" htmlFor="email-from">From:</Label>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="font-medium">{currentEmail.from}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block" htmlFor="email-to">To:</Label>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        <span className="font-medium">{currentEmail.to}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block" htmlFor="email-subject">Subject:</Label>
                    <Input 
                      id="email-subject" 
                      value={emailSubject} 
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className={`w-full transition-all duration-200 ${!isEditing ? 'text-foreground border-transparent' : 'bg-transparent'}`}
                      readOnly={!isEditing} 
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block" htmlFor="email-body">Message:</Label>
                    <div className={`transition-all duration-200 rounded-xl overflow-hidden ${isEditing ? 'ring-2 ring-primary/10' : ''}`}>
                      <Textarea 
                        id="email-body" 
                        value={emailBody} 
                        onChange={(e) => setEmailBody(e.target.value)}
                        className={`w-full min-h-[240px] transition-all duration-200 ${!isEditing ? 'text-foreground border-transparent resize-none' : 'bg-transparent'}`}
                        style={{ lineHeight: '1.6' }}
                        readOnly={!isEditing} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Editing indicator */}
              {isEditing && (
                <div className="absolute top-4 right-4 bg-secondary/90 text-secondary-foreground text-xs px-3 py-1 rounded-full font-medium">
                  Editing Mode
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="mt-8 flex flex-col space-y-4">
              {/* Main action buttons */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-4">
                <Button 
                  variant="outline"
                  className={`w-full md:w-auto transition-all duration-200 ${isEditing ? 'bg-primary/5 text-primary border-primary/20' : ''}`}
                  onClick={toggleEdit}
                  disabled={isSending || isSendingAll}
                >
                  {isEditing ? (
                    <div className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Save Changes
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Personalize Email
                    </div>
                  )}
                </Button>
                
                <Button 
                  className="w-full md:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 py-6"
                  onClick={sendEmail}
                  disabled={isSending || isSendingAll}
                >
                  {isSending ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Email...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="mr-2 h-5 w-5" />
                      Send Email Now
                    </div>
                  )}
                </Button>
              </div>
              
              {/* Send All Emails button - only show if > 1 email and user has connected their email */}
              {(state.emailsToSend.length > 1 && showSendAllOption) && (
                <div className="w-full border border-teal-100 bg-teal-50/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-teal-700">Send All Emails at Once</h3>
                      <p className="text-sm text-teal-600">Authenticate once and send all {state.emailsToSend.length} emails together</p>
                    </div>
                    <Button 
                      variant="secondary"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={sendAllEmails}
                      disabled={isSendingAll || isSending}
                    >
                      {isSendingAll ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending All...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Send All {state.emailsToSend.length} Emails
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Email counter info */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {!isLastEmail ? (
                <p>After sending, you'll be taken to the next email ({currentIndex + 2} of {state.emailsToSend.length})</p>
              ) : (
                <p>This is your last email. After sending, you'll see a confirmation page.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}