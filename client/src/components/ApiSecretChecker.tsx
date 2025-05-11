import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import SendGridSetup from '@/components/SendGridSetup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ApiSecretCheckerProps {
  children: React.ReactNode;
}

interface EmailServiceStatus {
  sendgridAvailable: boolean;
  nodemailerAvailable: boolean;
  queueEnabled: boolean;
  queueStats?: { queueLength: number; isProcessing: boolean };
  preferredProvider: string;
  needsSendGridKey?: boolean;
}

export default function ApiSecretChecker({ children }: ApiSecretCheckerProps) {
  const [showSendGridSetup, setShowSendGridSetup] = useState(false);
  
  // Query the email service status to check if we need to set up SendGrid
  const { data, isLoading, error, refetch } = useQuery<EmailServiceStatus>({
    queryKey: ['/api/email-service-status'],
    refetchInterval: 30000, // Refetch every 30 seconds
    queryFn: async () => {
      const response = await fetch('/api/email-service-status');
      if (!response.ok) {
        throw new Error('Failed to fetch email service status');
      }
      return response.json();
    }
  });
  
  useEffect(() => {
    // If we have data and need a SendGrid key, show the setup dialog
    if (data && data.needsSendGridKey) {
      setShowSendGridSetup(true);
    }
  }, [data]);
  
  const handleSetupSuccess = () => {
    // Close the dialog and refetch the status
    setShowSendGridSetup(false);
    refetch();
  };
  
  return (
    <>
      {/* Main content */}
      {children}
      
      {/* SendGrid Setup Dialog */}
      <Dialog open={showSendGridSetup} onOpenChange={setShowSendGridSetup}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Email Service Setup Required</DialogTitle>
            <DialogDescription>
              AskCara needs to configure SendGrid to send emails to care providers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 pt-2">
            <SendGridSetup onSuccess={handleSetupSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}