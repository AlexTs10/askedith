import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  ExternalLink,
  Info,
  HelpCircle
} from "lucide-react";

/**
 * Component to explain Nylas setup requirements and provide alternatives
 */
export const NylasSetupGuide = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800 mb-1">Email Integration Options</h3>
            <p className="text-amber-700 text-sm">
              AskEdith offers multiple ways to send emails to your selected providers.
              Choose the option that works best for you below.
            </p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="sendgrid" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="sendgrid">Simple Sending</TabsTrigger>
          <TabsTrigger value="nylas">Gmail Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sendgrid" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Simple Email Sending</CardTitle>
              <CardDescription>
                This option sends emails through AskEdith's system without connecting to your Gmail account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">How It Works</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Emails are sent from our system (elias@secondactfs.com)</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Your email appears as the "Reply-To" address</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Works immediately with no setup required</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Limitations</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Emails won't appear in your sent folder</span>
                    </li>
                    <li className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Responses will come to your inbox unorganized</span>
                    </li>
                    <li className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Can't track emails in your email client</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Button asChild className="w-full sm:w-auto">
                <Link to="/email-preview">
                  Continue with Simple Sending
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nylas" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Gmail Account Integration</CardTitle>
              <CardDescription>
                Connect your Google account to send emails directly from your Gmail address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="mb-4">
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Google Authentication Required</AlertTitle>
                <AlertDescription>
                  To use this feature, you need to authenticate with Google. Due to Google's security restrictions,
                  this requires a verified application with proper OAuth consent screen setup in Google Cloud Platform.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Benefits</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Emails sent directly from your Gmail account</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Emails appear in your Sent folder</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Responses are organized in dedicated folders</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Setup Requirements</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Google Cloud Platform project with OAuth consent</span>
                    </li>
                    <li className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Gmail API enabled for your project</span>
                    </li>
                    <li className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Verified application status (for production use)</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={() => setShowDetails(!showDetails)}
                  variant="outline"
                  size="sm"
                  className="mb-4"
                >
                  {showDetails ? "Hide Details" : "Show Setup Details"}
                </Button>
                
                {showDetails && (
                  <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-3 mb-4">
                    <h3 className="font-medium text-blue-800">Google Cloud Platform Setup</h3>
                    <p className="text-blue-700">
                      To enable Gmail integration, you need to configure a Google Cloud Platform project:
                    </p>
                    <ol className="list-decimal pl-5 text-blue-700 space-y-2">
                      <li>
                        <a 
                          href="https://console.cloud.google.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline flex items-center"
                        >
                          Create a Google Cloud Platform project
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </li>
                      <li>Enable the Gmail API for your project</li>
                      <li>Configure the OAuth consent screen</li>
                      <li>Create OAuth client ID credentials</li>
                      <li>Add the callback URL: https://askcara-project.elias18.repl.co/callback</li>
                      <li>Update environment variables with your credentials</li>
                    </ol>
                    <p className="text-blue-700 pt-1">
                      For detailed instructions, please refer to the 
                      <a 
                        href="https://developers.google.com/gmail/api/quickstart/js" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline ml-1 flex items-center inline"
                      >
                        Google API documentation
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline">
                    <Link to="/nylas-test">
                      Try Gmail Integration
                    </Link>
                  </Button>
                  
                  <Button asChild>
                    <Link to="/email-preview">
                      Continue with Simple Sending
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NylasSetupGuide;