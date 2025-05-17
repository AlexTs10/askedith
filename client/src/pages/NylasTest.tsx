import NylasTestConnect from "@/components/NylasTestConnect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, AlertCircle, AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";

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
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
        <div className="flex gap-2 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800 mb-1">Callback URL Issues</h3>
            <p className="text-amber-700 text-sm mb-3">
              We've detected issues with the OAuth callback URL. If you receive a "can't connect to server" error
              after authorization, please use our manual connection method instead.
            </p>
            <Button asChild variant="outline" size="sm" className="bg-white">
              <Link to="/nylas-manual-connect">
                Try Manual Connection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <NylasTestConnect />
      </div>
      
      <div className="mt-10 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h2 className="text-xl font-semibold mb-2">Testing Instructions</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter your Gmail address in the field above</li>
          <li>Click "Connect Email" which will open a new window</li>
          <li>Complete the Google authentication process in the popup window</li>
          <li>If you see a callback error, use the Manual Connection option above</li>
          <li>If successful, the status should update to "Connected" after a few seconds</li>
        </ol>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-blue-700" />
          Two Connection Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="bg-white p-3 rounded-md shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">Automatic Method</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Standard OAuth flow with popup window</li>
              <li>• Relies on callback URL connectivity</li>
              <li>• May fail due to current domain limitations</li>
              <li>• Simplest when it works correctly</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border-2 border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Manual Method (Recommended)</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Still uses secure OAuth authentication</li>
              <li>• Bypasses callback URL limitations</li>
              <li>• Copy/paste the authorization code manually</li>
              <li>• More reliable in current environment</li>
            </ul>
          </div>
        </div>
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
      
      <div className="mt-6 flex justify-center">
        <Button asChild variant="outline" className="mr-4">
          <Link to="/email-setup">
            Back to Email Setup
          </Link>
        </Button>
        <Button asChild>
          <Link to="/nylas-manual-connect">
            Try Manual Connection
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}