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
  
  // Send email function
  const sendEmail = async () => {
    try {
      console.log("Sending email to:", currentEmail.to);
      setIsSending(true);
      
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
        subject: emailSubject,
        body: emailBody
      };
      
      console.log("Email data being sent:", emailData);
      
      // Send the email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      
      // Parse the response
      const result = await response.json();
      console.log("Server response:", result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to send email: ${response.status}`);
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
    <div className="fade-in">
      <Card className="card border-0">
        <CardContent className="p-0">
          {/* Header section */}
          <div className="bg-primary/10 p-8 pt-10 pb-10 md:p-10 rounded-t-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Email Preview</h2>
                <p className="text-foreground/80">
                  Review and personalize your message before sending
                </p>
              </div>
              
              <div className="px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium text-muted-foreground">
                Email {currentIndex + 1} of {state.emailsToSend.length}
              </div>
            </div>
          </div>
          
          {/* Email content section */}
          <div className="p-8 md:p-10">
            <div className="relative bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              {/* Email form */}
              <div className={`bg-card p-5 md:p-8 space-y-6 transition-opacity duration-300 ${isEditing ? 'opacity-100' : 'opacity-95'}`}>
                {/* Email header decoration */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <div className="w-3 h-3 rounded-full bg-success/60"></div>
                  <div className="flex-1 border-t border-border ml-2"></div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-background/40 backdrop-blur-sm p-4 md:p-5 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block" htmlFor="email-to">To:</Label>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                      <span className="font-medium">{currentEmail.to}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block" htmlFor="email-subject">Subject:</Label>
                    <Input 
                      id="email-subject" 
                      value={emailSubject} 
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className={`w-full transition-all duration-200 ${!isEditing ? 'bg-background/40 text-foreground border-transparent' : 'bg-background'}`}
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
                        className={`w-full min-h-[240px] transition-all duration-200 ${!isEditing ? 'bg-background/40 text-foreground border-transparent resize-none' : 'bg-background'}`}
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
            <div className="mt-8 flex flex-col-reverse md:flex-row items-center gap-4">
              <Button 
                variant="outline"
                className={`w-full md:w-auto transition-all duration-200 ${isEditing ? 'bg-primary/5 text-primary border-primary/20' : ''}`}
                onClick={toggleEdit}
                disabled={isSending}
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
                disabled={isSending}
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