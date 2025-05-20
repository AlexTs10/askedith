import NylasSetupGuide from "@/components/NylasSetupGuide";

export default function EmailSetupPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AskEdith Email Setup</h1>
      
      <p className="text-gray-600 mb-8">
        Choose how you want to send emails to your selected providers. AskEdith offers different
        methods for sending emails, each with its own advantages.
      </p>
      
      <NylasSetupGuide />
    </div>
  );
}