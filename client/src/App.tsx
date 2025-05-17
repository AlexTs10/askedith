import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import ApiSecretChecker from "@/components/ApiSecretChecker";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Wizard from "@/pages/Wizard";
import Results from "@/pages/Results";
import EmailPreview from "@/pages/EmailPreview";
import Callback from "@/pages/Callback";
import Confirmation from "@/pages/Confirmation";
import AdminDashboard from "@/pages/Admin";
import PrintableResults from "@/pages/PrintableResults";
import NylasTest from "@/pages/NylasTest";
import EmailSetup from "@/pages/EmailSetup";
import EmailConnect from "@/pages/EmailConnect";
import NylasSetup from "@/pages/NylasSetup";
import SendGridTest from "@/pages/SendGridTest";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wizard/:step?" component={Wizard} />
      <Route path="/results" component={Results} />
      <Route path="/email-preview/:index?" component={EmailPreview} />
      <Route path="/callback" component={Callback} />
      <Route path="/confirmation" component={Confirmation} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/printable" component={PrintableResults} />
      <Route path="/nylas-test" component={NylasTest} />
      <Route path="/email-setup" component={EmailSetup} />
      <Route path="/email-connect" component={EmailConnect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-neutral-lightest">
          <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
            <ApiSecretChecker>
              <Router />
            </ApiSecretChecker>
          </div>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
