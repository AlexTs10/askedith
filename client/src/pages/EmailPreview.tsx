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
    <Card className="bg-white rounded-xl shadow-md">
      <CardContent className="p-6 md:p-8 space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark mb-6">Email Preview</h2>
        
        <p className="text-lg text-neutral-medium mb-6">
          We've created an email draft based on your responses. You can edit it before sending.
        </p>
        
        <div className="mb-3 font-medium text-neutral-medium">
          Email {currentIndex + 1} of {state.emailsToSend.length}
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-neutral-dark font-medium mb-2" htmlFor="email-to">To:</Label>
            <Input 
              id="email-to" 
              value={currentEmail.to} 
              className="w-full p-3"
              readOnly 
            />
          </div>
          
          <div>
            <Label className="block text-neutral-dark font-medium mb-2" htmlFor="email-subject">Subject:</Label>
            <Input 
              id="email-subject" 
              value={emailSubject} 
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full p-3"
              readOnly={!isEditing} 
            />
          </div>
          
          <div>
            <Label className="block text-neutral-dark font-medium mb-2" htmlFor="email-body">Message:</Label>
            <Textarea 
              id="email-body" 
              value={emailBody} 
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-3"
              rows={12} 
              readOnly={!isEditing} 
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Button 
              variant="outline"
              className="order-2 md:order-1"
              onClick={toggleEdit}
              disabled={isSending}
            >
              {isEditing ? (
                <>
                  <Edit className="mr-2 h-5 w-5" />
                  Done Editing
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-5 w-5" />
                  Edit Email
                </>
              )}
            </Button>
            
            <Button 
              className="order-1 md:order-2 flex-1 bg-primary hover:bg-primary-dark"
              onClick={sendEmail}
              disabled={isSending}
            >
              <Send className="mr-2 h-5 w-5" />
              {isSending ? 'Sending...' : 'Send Email Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}