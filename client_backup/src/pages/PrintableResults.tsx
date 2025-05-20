import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, ArrowLeft, CheckCircle, Download, Share2 } from 'lucide-react';
import useWizardState from '@/lib/useWizardState';
import { Question } from '@/lib/wizardQuestions';
import wizardQuestions from '@/lib/wizardQuestions';

// Resource type definition matching schema.ts
interface Resource {
  id: number;
  category: string;
  name: string;
  companyName: string | null;
  address: string | null;
  county: string | null;
  city: string | null;
  zipCode: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

const PrintableResults: React.FC = () => {
  const [_, navigate] = useLocation();
  const { state } = useWizardState();
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Convert wizard answers to readable format
  const formatAnswers = (answers: Record<string, string>) => {
    const formattedAnswers: Record<string, string | string[]> = {};
    
    // Map the answers to their corresponding questions
    Object.keys(answers).forEach(key => {
      if (key.startsWith('q')) {
        const questionNumber = Number(key.replace('q', ''));
        const question = wizardQuestions.find(q => q.id === questionNumber);
        
        if (question) {
          // Format the answer based on question type
          let answer = answers[key];
          
          // Handle JSON strings (from multi-select or contact_info)
          if (answer.startsWith('[') || answer.startsWith('{')) {
            try {
              const parsed = JSON.parse(answer);
              
              if (Array.isArray(parsed)) {
                formattedAnswers[question.text] = parsed;
              } else if (typeof parsed === 'object') {
                // For contact_info type
                formattedAnswers[question.text] = Object.values(parsed).filter(Boolean).join(', ');
              }
            } catch (e) {
              formattedAnswers[question.text] = answer;
            }
          } else {
            formattedAnswers[question.text] = answer;
          }
        }
      }
    });
    
    return formattedAnswers;
  };
  
  // Handle print action
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };
  
  // Get care recipient age from answers
  const getCareRecipientAge = () => {
    const ageString = state.answers['q2'];
    return ageString ? parseInt(ageString, 10) : 'Unknown';
  };
  
  // Get care recipient relationship
  const getRelationship = () => {
    return state.answers['q3'] || 'Not specified';
  };
  
  // Format the date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Resources grouped by category
  const groupedResources = state.resources ? state.resources.reduce((acc: Record<string, Resource[]>, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    
    if (state.selectedResourceIds.includes(resource.id)) {
      acc[resource.category].push(resource);
    }
    
    return acc;
  }, {} as Record<string, Resource[]>) : {};
  
  // CSS styles for print media
  useEffect(() => {
    // Add print-specific styles
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        body {
          font-size: 16pt;
          line-height: 1.5;
          color: #000;
          background: #fff;
        }
        
        .print-container {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        
        .no-print {
          display: none !important;
        }
        
        h1 {
          font-size: 24pt;
        }
        
        h2 {
          font-size: 20pt;
          margin-top: 20pt;
        }
        
        h3 {
          font-size: 18pt;
        }
        
        .print-resource {
          page-break-inside: avoid;
          margin-bottom: 16pt;
          border: 1px solid #ccc;
          padding: 12pt;
          border-radius: 4pt;
        }
        
        .section-break {
          page-break-after: always;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up
      const printStyle = document.getElementById('print-styles');
      if (printStyle) {
        document.head.removeChild(printStyle);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header with print controls - hidden when printing */}
      <div className="container mx-auto px-4 mb-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-600">Your Care Resources</h1>
            <p className="text-gray-500">Printable Summary of Recommended Resources</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/results')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Results</span>
            </Button>
            
            <Button
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
              disabled={isPrinting}
            >
              <Printer size={16} />
              <span>{isPrinting ? 'Preparing...' : 'Print This Page'}</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Printable content */}
      <div className="container mx-auto px-4 print-container">
        {/* Organization header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-normal mb-2 text-teal-600 print-only">
            <span>A</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
            <span>E</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>dith</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light mb-1">Care Resource Recommendations</p>
          <p className="text-gray-500">Generated on {formatDate(new Date())}</p>
        </div>
        
        {/* Summary section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-serif text-teal-600 mb-4">Summary Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <p className="text-gray-500 mb-1">Care Recipient</p>
              <p className="font-medium text-xl">{state.answers['q1'] || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Age</p>
              <p className="font-medium text-xl">{getCareRecipientAge()}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Relationship</p>
              <p className="font-medium text-xl">{getRelationship()}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Timeline for Services</p>
              <p className="font-medium text-xl">{state.answers['q8'] || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="mt-5">
            <p className="text-gray-500 mb-1">Primary Needs</p>
            {state.answers['q5'] ? (
              <div className="mt-1">
                {(state.answers['q5'].startsWith('[') ? 
                  JSON.parse(state.answers['q5']) : 
                  [state.answers['q5']]
                ).map((need: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
                    <span className="text-lg">{need}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-medium text-xl">Not specified</p>
            )}
          </div>
        </div>
        
        {/* Resources section */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-teal-600 mb-4">Recommended Resources</h2>
          
          {Object.keys(groupedResources).length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No resources have been selected yet.</p>
            </div>
          ) : (
            Object.entries(groupedResources).map(([category, resources], categoryIndex) => (
              <div key={category} className={`mb-8 ${categoryIndex > 0 ? 'section-break' : ''}`}>
                <h3 className="text-xl font-medium text-teal-700 mb-3">{category}</h3>
                
                <div className="space-y-4">
                  {resources && resources.map((resource: Resource) => (
                    <div 
                      key={resource.id} 
                      className="bg-white p-5 rounded-lg shadow-sm print-resource border border-gray-200 hover:border-teal-300 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <h4 className="text-xl font-medium">{resource.name}</h4>
                          {resource.companyName && (
                            <p className="text-lg text-gray-600">{resource.companyName}</p>
                          )}
                          {resource.description && (
                            <p className="mt-2 text-lg">{resource.description}</p>
                          )}
                        </div>
                        
                        <div>
                          <div className="space-y-3">
                            {resource.address && (
                              <div>
                                <p className="text-gray-500 mb-1">Address:</p>
                                <p className="text-lg">{resource.address}</p>
                                {(resource.city || resource.zipCode) && (
                                  <p className="text-lg">
                                    {[
                                      resource.city, 
                                      resource.county ? `${resource.county} County` : null,
                                      resource.zipCode
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {resource.phone && (
                              <div>
                                <p className="text-gray-500 mb-1">Phone:</p>
                                <p className="text-lg font-medium">{resource.phone}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-gray-500 mb-1">Email:</p>
                              <p className="text-lg font-medium">
                                {resource.email}
                              </p>
                            </div>
                            
                            {resource.website && (
                              <div>
                                <p className="text-gray-500 mb-1">Website:</p>
                                <p className="text-lg font-medium break-words">
                                  {resource.website}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Notes section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-serif text-teal-600 mb-4">Additional Notes</h2>
          <p className="text-lg whitespace-pre-line">
            {state.answers['q13'] || 'No additional notes provided.'}
          </p>
        </div>
        
        {/* Footer */}
        <div className="text-center text-gray-500 mt-10 mb-8">
          <p>Recommendations generated by AskEdith</p>
          <p>For more information, visit askedith.org</p>
        </div>
      </div>
      
      {/* Actions footer - hidden when printing */}
      <div className="container mx-auto px-4 mt-8 no-print">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Share These Results</CardTitle>
            <CardDescription>
              Save this summary or share it with family members
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              <span>Download as PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 size={16} />
              <span>Email This Summary</span>
            </Button>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t px-6 py-4">
            <p className="text-sm text-gray-500">
              Note: This printed summary uses a larger font size for easier reading.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PrintableResults;