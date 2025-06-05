
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail } from 'lucide-react';

interface EmailListToolbarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onComposeClick: () => void;
}

const EmailListToolbar: React.FC<EmailListToolbarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearch,
  onComposeClick
}) => {
  return (
    <div className="space-y-6">
      {/* Green Compose Button */}
      <div className="flex justify-start">
        <Button
          onClick={onComposeClick}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Mail className="mr-2 h-4 w-4" />
          Compose New Email
        </Button>
      </div>

      {/* Tab Navigation and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto bg-gray-100">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Unread
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="no-response" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              No Response
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailListToolbar;
