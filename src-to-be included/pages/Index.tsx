import React, { useState } from 'react';
import RoleAwareEmailDashboard from '../components/RoleAwareEmailDashboard';
import CalendarSection from '../components/CalendarSection';
import NewEmailForm from '../components/NewEmailForm';
import IndexActionButtons from './IndexActionButtons';
import IndexPagination from './IndexPagination';
import UnifiedSearchResults from '../components/search/UnifiedSearchResults';
import { Info, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useUserRole } from '../hooks/useUserRole';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewEmailForm, setShowNewEmailForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole, setUserRole } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('Index render with searchQuery:', searchQuery);

  const handleNewEmail = (emailData: any) => {
    console.log('New email to be sent:', emailData);
    
    toast({
      title: "Email Sent",
      description: `Email sent to ${emailData.toName} at ${emailData.toOrganization}`,
    });
  };

  // Keep the toggle function available for programmer use
  const toggleUserRole = () => {
    const newRole = userRole === 'primary-caregiver' ? 'family-member' : 'primary-caregiver';
    setUserRole(newRole);
  };

  // Scroll to calendar section
  const handleCalendarClick = () => {
    const calendarSection = document.getElementById('calendar-section');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Pagination logic
  const itemsPerPage = 6;
  const totalCategories = 8; // Total number of email categories
  const totalPages = Math.ceil(totalCategories / itemsPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-8 pt-16">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-light text-gray-800 mb-6 sm:mb-8">Communication Hub</h1>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm sm:text-base text-gray-600 font-light flex items-center gap-2 mb-8 sm:mb-12">
              Stay on top of your important conversations
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-full w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 transition-colors shadow-lg hover:shadow-green-200 hover:shadow-md">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 sm:w-96 p-4">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800">What are Conversations?</h4>
                    <p className="text-gray-600 text-sm">
                      Conversations are meaningful exchanges with organizations helping your loved ones.
                    </p>
                    <p className="text-gray-600 text-sm mb-6">
                      Rather than sorting through isolated emails, you can track complete interactions with senior living 
                      facilities, healthcare providers, and benefit programs—all in one place.
                    </p>
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <span>Unread messages need your attention</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                        <span>Pending replies are waiting for responses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span>Has not responded yet indicates no reply received</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </p>
            
            <IndexActionButtons
              onNewEmail={() => setShowNewEmailForm(true)}
              onViewDocuments={() => navigate('/documents')}
              onCalendarClick={handleCalendarClick}
            />
          </div>
        </div>
        
        {/* Search Bar with Autocomplete - reverted to original size */}
        <div className="max-w-xs sm:max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 text-base bg-gray-50 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email Dashboard - shows filtered categories when searching */}
        <RoleAwareEmailDashboard searchQuery={searchQuery} currentPage={currentPage} />

        {/* Unified Search Results - now appears BELOW the email categories */}
        <UnifiedSearchResults searchQuery={searchQuery} />

        <IndexPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Calendar Section with margin top for separation and ID for scrolling */}
        <div id="calendar-section" className="mt-10 sm:mt-16">
          <CalendarSection />
        </div>

        {/* New Email Form */}
        <NewEmailForm
          isOpen={showNewEmailForm}
          onClose={() => setShowNewEmailForm(false)}
          onSend={handleNewEmail}
        />
      </div>
    </div>
  );
};

export default Index;
