import NylasTestConnect from "@/components/NylasTestConnect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle } from "lucide-react";

export default function NylasTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Nylas Email Integration Test</h1>
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>About This Integration</AlertTitle>
        <AlertDescription>
          A successful connection will allow AskEdith to send emails directly from your
          account and organize resource replies into folders for better tracking.
        </AlertDescription>
      </Alert>
      
      <div className="max-w-2xl mx-auto">
        <NylasTestConnect />
      </div>
      
      <div className="mt-10 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h2 className="text-xl font-semibold mb-2">Testing Instructions</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter your Gmail address in the field above</li>
          <li>Click "Connect Email" which will open a new window</li>
          <li>Complete the Google authentication process in the popup window</li>
          <li>You'll be redirected back when authentication is successful</li>
          <li>The status should update to "Connected" after a few seconds</li>
        </ol>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-blue-700" />
          Troubleshooting
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-blue-900">
          <li>If you see a "redirect URI not allowed" error, this is a known issue with our OAuth configuration</li>
          <li>The application will still work with the SendGrid email sending option (no OAuth required)</li>
          <li>SendGrid will still show your email address as the sender</li>
          <li>With SendGrid, emails won't appear in your Gmail sent folder, but recipients will still see your address</li>
          <li>Remember to check if popups are being blocked by your browser</li>
        </ul>
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold mb-2">Why Connect Your Email?</h2>
        <p className="mb-3">Connecting your email through Nylas provides these benefits:</p>
        <ul className="list-disc pl-6 space-y-1 text-green-900">
          <li>Send emails directly from your account (not a third-party service)</li>
          <li>Keep a record of all sent resources in your own email account</li>
          <li>Organize resource replies into separate folders for better tracking</li>
          <li>Maintain full control of your email communications</li>
        </ul>
      </div>
    </div>
  );
}