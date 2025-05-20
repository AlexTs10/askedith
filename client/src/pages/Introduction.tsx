import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDefaultImageForCategory } from '@/components/search/DefaultCategoryImages';
import { ArrowRight, Home, UserRound, Building, Briefcase, Award, CircleDollarSign } from 'lucide-react';

const categories = [
  {
    id: 'senior-living',
    name: 'Senior Living',
    icon: <Building className="h-8 w-8 text-teal-600" />,
    description: 'Communities designed for older adults, including independent living, assisted living, and memory care options. These facilities provide varying levels of care, meals, activities, and support services.',
    examples: ['Retirement communities', 'Assisted living facilities', 'Memory care homes', 'Nursing homes']
  },
  {
    id: 'home-care',
    name: 'Home Care',
    icon: <Home className="h-8 w-8 text-teal-600" />,
    description: 'Services that allow seniors to age in their own homes by providing assistance with daily activities, companionship, and sometimes medical care.',
    examples: ['Personal care assistance', 'Meal preparation', 'Medication reminders', 'Transportation services']
  },
  {
    id: 'aging-professionals',
    name: 'Aging Life Care Professionals',
    icon: <UserRound className="h-8 w-8 text-teal-600" />,
    description: 'Specialized healthcare professionals who act as guides and advocates for families caring for older relatives or disabled adults.',
    examples: ['Geriatric care managers', 'Elder care coordinators', 'Senior advisors', 'Care consultants']
  },
  {
    id: 'veteran-benefits',
    name: 'Veteran Benefits',
    icon: <Award className="h-8 w-8 text-teal-600" />,
    description: 'Programs and services specifically designed for military veterans, including healthcare, financial assistance, and long-term care options.',
    examples: ['VA Aid and Attendance', 'Veterans pension', 'VA healthcare', 'Veterans homes']
  },
  {
    id: 'financial-advisors',
    name: 'Financial Advisors',
    icon: <CircleDollarSign className="h-8 w-8 text-teal-600" />,
    description: 'Professionals who specialize in helping seniors manage their finances, plan for retirement, and navigate Medicare, Medicaid, and long-term care insurance.',
    examples: ['Elder law attorneys', 'Medicare specialists', 'Retirement planners', 'Long-term care insurance advisors']
  },
  {
    id: 'government-agencies',
    name: 'Government Agencies',
    icon: <Briefcase className="h-8 w-8 text-teal-600" />,
    description: 'Local, state, and federal offices that provide services, programs, and resources specifically for older adults and their caregivers.',
    examples: ['Area Agency on Aging', 'Social Security Administration', 'Medicare offices', 'State elder affairs departments']
  }
];

export default function Introduction() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('how-it-works');

  const goToQuestionnaire = () => {
    navigate('/questionnaire');
  };

  return (
    <div className="bg-amber-50 min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-normal mb-2 text-teal-600">
          <span>A</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
          <span>E</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>dith</span>
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 font-light">Welcome to your elder care journey</p>
      </div>

      <div className="max-w-5xl mx-auto">
        <Card className="shadow-md border-t-4 border-t-teal-500">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-serif text-teal-700 mb-4">
                Getting Started Guide
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Welcome! We're here to simplify your search for elder care resources. 
                Let's take a moment to explore how AskEdith works for you.
              </p>
            </div>

            <Tabs defaultValue="how-it-works" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                <TabsTrigger value="how-it-works" className="text-lg py-3 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                  How It Works
                </TabsTrigger>
                <TabsTrigger value="categories" className="text-lg py-3 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                  Service Categories
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="how-it-works" className="mt-6 p-4 bg-white rounded-lg">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start gap-4 p-4 border-l-4 border-teal-200 bg-teal-50/50">
                    <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="font-semibold text-teal-700 text-xl">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-teal-700 mb-2">Tell Us Your Needs</h3>
                      <p className="text-lg leading-relaxed text-gray-600">
                        Answer a few simple questions about yourself or your loved one's situation, 
                        needs, and preferences. This helps us understand exactly what kind of help you're looking for.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-4 p-4 border-l-4 border-teal-200 bg-teal-50/50">
                    <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="font-semibold text-teal-700 text-xl">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-teal-700 mb-2">View Matched Resources</h3>
                      <p className="text-lg leading-relaxed text-gray-600">
                        We'll match you with local care providers and resources that specialize in the type of care you need.
                        Browse through the options and select those you'd like to contact.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-4 p-4 border-l-4 border-teal-200 bg-teal-50/50">
                    <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="font-semibold text-teal-700 text-xl">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-teal-700 mb-2">Share Once, Reach Many</h3>
                      <p className="text-lg leading-relaxed text-gray-600">
                        We'll create personalized messages to each provider based on your information. 
                        Review and customize these messages, then send them to all your selected providers with just one click.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-4 p-4 border-l-4 border-teal-200 bg-teal-50/50">
                    <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="font-semibold text-teal-700 text-xl">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-teal-700 mb-2">Receive Organized Responses</h3>
                      <p className="text-lg leading-relaxed text-gray-600">
                        Providers will respond directly to your email. If you connect your email account with us, 
                        we'll help organize all responses so you can easily compare options and make the best choice.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map(category => (
                    <Card key={category.id} className="overflow-hidden border border-gray-200 hover:border-teal-200 transition-all">
                      <div className="h-48 bg-white p-4 flex items-center justify-center overflow-hidden">
                        <img 
                          src={getDefaultImageForCategory(category.name)} 
                          alt={category.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentNode as HTMLElement;
                            if (parent) {
                              parent.appendChild(category.icon as unknown as Node);
                            }
                          }}
                        />
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-teal-600">
                            {category.icon}
                          </div>
                          <h3 className="text-xl font-medium text-gray-800">
                            {category.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-lg mb-4">
                          {category.description}
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-2">Examples:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {category.examples.map((example, index) => (
                              <li key={index} className="text-lg">{example}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-lg">
                Ready to find the elder care resources you need?
              </p>
              <Button 
                onClick={goToQuestionnaire} 
                className="rounded-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg"
              >
                <span>Begin Questionnaire</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}