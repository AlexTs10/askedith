import React from 'react';
import '@/features/hub/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import UserRoleProvider from '@/components/UserRoleProvider';
import Index from '@/features/hub/pages/Index';
import EmailList from '@/features/hub/pages/EmailList';
import EmailDetail from '@/features/hub/pages/EmailDetail';
import Documents from '@/features/hub/pages/Documents';
import CaregiverMap from '@/features/hub/pages/CaregiverMap';
import NotFound from '@/features/hub/pages/NotFound';

const queryClient = new QueryClient();

export default function CommunicationHub() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DndProvider backend={HTML5Backend}>
          <UserRoleProvider defaultRole="primary-caregiver">
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* Support direct navigation to /home */}
                <Route path="/home" element={<Index />} />
                <Route path="/emails/:category/:status" element={<EmailList />} />
                <Route path="/email/:id" element={<EmailDetail />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/map" element={<CaregiverMap />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </UserRoleProvider>
        </DndProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
