import NylasTestConnect from "@/components/NylasTestConnect";

export default function NylasTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Nylas V3 Integration Test</h1>
      <p className="mb-6 text-gray-600">
        This page allows you to test the Nylas V3 SDK integration for connecting your email account.
        Follow the steps below to authenticate with your email provider.
      </p>
      
      <div className="max-w-2xl mx-auto">
        <NylasTestConnect />
      </div>
      
      <div className="mt-10 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h2 className="text-xl font-semibold mb-2">Testing Instructions</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter your email address in the field above</li>
          <li>Click "Connect Email" which will open a new window</li>
          <li>Complete the authentication process in the popup window</li>
          <li>After authentication, you'll be redirected back to the application</li>
          <li>The status should update to "Connected" after a few seconds</li>
        </ol>
      </div>
    </div>
  );
}