import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function SendGridTestPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ sendgridAvailable: boolean } | null>(null);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Test Email from AskEdith');
  const [testBody, setTestBody] = useState('This is a test email sent via the SendGrid integration.');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const checkEmailStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-service-status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking email status:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setTestStatus({
        success: false,
        message: 'Please enter a recipient email address'
      });
      return;
    }

    try {
      setSending(true);
      setTestStatus(null);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          subject: testSubject,
          body: testBody,
          from: 'AskEdith <noreply@askedith.com>', // This will be overridden by verified sender
          replyTo: testEmail // Makes replies go back to the user
        }),
      });

      const data = await response.json();
      
      setTestStatus({
        success: !!data.success,
        message: data.message || (data.success ? 'Email sent successfully!' : 'Failed to send email')
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      setTestStatus({
        success: false,
        message: 'An error occurred while sending the email'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">SendGrid Email Integration</h1>
      
      <Alert className="mb-6">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Simpler Email Solution</AlertTitle>
        <AlertDescription>
          This page tests the SendGrid email integration, which offers a more reliable
          solution without requiring OAuth authentication. Emails will still display your
          email address in the "From" field for recipients.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SendGrid Status</CardTitle>
            <CardDescription>Current status of the SendGrid email service</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span>Checking status...</span>
              </div>
            ) : status ? (
              <div>
                <div className="flex items-center mb-4">
                  {status.sendgridAvailable ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>SendGrid is available and configured</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>SendGrid is not configured</span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={checkEmailStatus} 
                  disabled={loading}
                >
                  Refresh Status
                </Button>
              </div>
            ) : (
              <div className="text-red-500">
                Failed to check email service status
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>
              Send a test email via SendGrid to verify the integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Recipient Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <Input
                  id="subject"
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="body" className="block text-sm font-medium mb-1">
                  Email Body
                </label>
                <Textarea
                  id="body"
                  rows={4}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={sendTestEmail} 
                disabled={sending || !status?.sendgridAvailable}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
              
              {testStatus && (
                <Alert variant={testStatus.success ? "default" : "destructive"}>
                  {testStatus.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {testStatus.success ? 'Success' : 'Error'}
                  </AlertTitle>
                  <AlertDescription>
                    {testStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2">About SendGrid Integration</h2>
        <p className="mb-3">
          The SendGrid integration provides a reliable way to send emails without OAuth complexity:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Emails will be sent from our verified sender address but will show your address in the "From" field</li>
          <li>Recipients can reply directly to your email address</li>
          <li>No authentication popups or redirect issues</li>
          <li>Works consistently across all browsers and email providers</li>
          <li>The only limitation is that sent emails won't appear in your own account's sent folder</li>
        </ul>
      </div>
    </div>
  );
}