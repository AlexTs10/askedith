
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import UserRoleProvider from "./components/UserRoleProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmailList from "./pages/EmailList";
import EmailDetail from "./pages/EmailDetail";
import Documents from "./pages/Documents";
import CaregiverMap from "./pages/CaregiverMap";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <UserRoleProvider defaultRole="primary-caregiver">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/emails/:category/:status" element={<EmailList />} />
              <Route path="/email/:id" element={<EmailDetail />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/map" element={<CaregiverMap />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserRoleProvider>
      </DndProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
