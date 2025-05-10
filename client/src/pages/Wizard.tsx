import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressBar from '@/components/ProgressBar';
import wizardQuestions, { Question } from '@/lib/wizardQuestions';
import useWizardState from '@/lib/useWizardState';

export default function Wizard() {
  const { step } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { state, updateState } = useWizardState();
  
  // Convert string step param to number or default to 1
  const currentStep = step ? parseInt(step, 10) : 1;
  
  // Get the current question
  const question = wizardQuestions[currentStep - 1];
  
  // State for checkbox groups
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // Form handling
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      answer: state.answers[`q${currentStep}`] || 
        (question.type === 'contact_info' ? JSON.stringify({ 
          zipcode: '', 
          email: '', 
          phone: '', 
          lastname: '' 
        }) : '')
    }
  });

  // Set up selected options for checkbox groups
  useEffect(() => {
    if (question.type === 'checkbox_group' || question.type === 'multiselect') {
      const currentValue = state.answers[`q${currentStep}`];
      if (currentValue && typeof currentValue === 'string') {
        try {
          // If it's stored as JSON array
          if (currentValue.startsWith('[')) {
            setSelectedOptions(JSON.parse(currentValue));
          } else {
            // If it's a comma-separated string
            setSelectedOptions(currentValue.split(',').map(item => item.trim()).filter(Boolean));
          }
        } catch (e) {
          console.error("Error parsing checkbox group selections:", e);
          setSelectedOptions([]);
        }
      } else {
        setSelectedOptions([]);
      }
    }
  }, [currentStep, question.type, state.answers]);

  // Update form value when step changes
  useEffect(() => {
    if (question.type === 'contact_info') {
      // For contact info, ensure we have a valid JSON object
      const currentValue = state.answers[`q${currentStep}`];
      
      console.log(`Question ${currentStep} type: contact_info, current value:`, currentValue);
      
      // If we don't have a value yet, initialize with empty fields
      if (!currentValue) {
        console.log('No contact value, initializing empty object');
        const emptyContactInfo = { 
          zipcode: '', 
          email: '', 
          phone: '', 
          lastname: '' 
        };
        setValue('answer', JSON.stringify(emptyContactInfo));
        setContactFormData(emptyContactInfo);
      } 
      // If we have a value that's already a JSON string
      else if (typeof currentValue === 'string' && currentValue.trim().startsWith('{')) {
        console.log('Value is JSON string, parsing');
        // Update the form value and contactFormData state
        setValue('answer', currentValue);
        try {
          const parsedData = JSON.parse(currentValue);
          
          // Make sure all required fields exist
          const updatedData = {
            zipcode: parsedData.zipcode || '',
            email: parsedData.email || '',
            phone: parsedData.phone || '',
            lastname: parsedData.lastname || ''
          };
          
          setContactFormData(updatedData);
          console.log('Updated contact form data:', updatedData);
        } catch (e) {
          console.error("Error updating contact form data:", e);
          
          // If parsing fails, initialize with empty values
          const emptyContactInfo = { 
            zipcode: '', 
            email: '', 
            phone: '', 
            lastname: '' 
          };
          setValue('answer', JSON.stringify(emptyContactInfo));
          setContactFormData(emptyContactInfo);
        }
      } 
      // If we have a value that's plain text (migrating from old format)
      else {
        console.log('Value is plain text, creating new contact info');
        // Create a contact info object with the proper fields
        const newContactInfo = { 
          zipcode: state.answers.q6 || '', 
          email: state.answers.q2 || '', 
          phone: '', 
          lastname: '' 
        };
        console.log('New contact info:', newContactInfo);
        setValue('answer', JSON.stringify(newContactInfo));
        setContactFormData(newContactInfo);
      }
    } else if (question.type === 'checkbox_group' || question.type === 'multiselect') {
      // Handled by the selectedOptions state
    } else {
      // For other question types, just set the value directly
      setValue('answer', state.answers[`q${currentStep}`] || '');
    }
  }, [currentStep, state.answers, setValue, question.type]);

  // Handle form submission
  const onSubmit = (data: { answer: string }) => {
    // For contact info, we already have the JSON stringified data
    // For other question types, just use the answer directly
    let answerValue = data.answer;
    
    console.log(`Processing question ${currentStep}, type: ${question.type}, value:`, answerValue);
    
    // For checkbox groups and multiselect, save the selected options
    if (question.type === 'checkbox_group' || question.type === 'multiselect') {
      // Make sure required question has at least one selection
      if (question.required && selectedOptions.length === 0) {
        toast({
          title: "Selection Required",
          description: "Please select at least one option",
          variant: "destructive"
        });
        return;
      }
      
      // Store as JSON array
      answerValue = JSON.stringify(selectedOptions);
    }
    // Validate contact info if applicable
    else if (question.type === 'contact_info') {
      try {
        // Log the data for debugging
        console.log('Contact form data:', data.answer);
        
        // Ensure data is not empty or null
        if (!data.answer || data.answer === '{}') {
          // Create a default contact info object with empty values
          answerValue = JSON.stringify({ 
            zipcode: '', 
            email: '', 
            phone: '', 
            lastname: '' 
          });
        } else {
          // Parse the JSON data
          const contactData = JSON.parse(data.answer);
          
          // Check if all required fields are filled
          const requiredFields = ['zipcode', 'email', 'phone', 'lastname'];
          const missingFields = requiredFields.filter(field => 
            !contactData[field] || contactData[field].trim() === ''
          );
          
          if (missingFields.length > 0) {
            toast({
              title: "Missing Information",
              description: `Please fill in these required fields: ${missingFields.join(', ')}`,
              variant: "destructive"
            });
            return;
          }
          
          // Validate email format
          if (contactData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contactData.email)) {
              toast({
                title: "Invalid Email",
                description: "Please enter a valid email address",
                variant: "destructive"
              });
              return;
            }
          }
          
          // Use the stringified data
          answerValue = data.answer;
        }
      } catch (error) {
        console.error("Error parsing contact data:", error, data.answer);
        toast({
          title: "Form Error",
          description: "There was a problem with the contact information. Please check your inputs.",
          variant: "destructive"
        });
        return;
      }
    }
    // Handle required fields for other question types
    else if (question.required && (!answerValue || (typeof answerValue === 'string' && answerValue.trim() === ''))) {
      toast({
        title: "Please Complete",
        description: "This field needs to be filled in",
        variant: "destructive"
      });
      return;
    }
    
    // Fix for text inputs - ensure value isn't blank
    if ((question.type === 'text' || question.type === 'email') && 
        (typeof answerValue === 'string' && answerValue.trim() === '')) {
      if (question.required) {
        toast({
          title: "Missing Information",
          description: "Please provide an answer",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Save the answer to the state
    const updatedAnswers = {
      ...state.answers,
      [`q${currentStep}`]: answerValue
    };
    
    updateState({ answers: updatedAnswers });
    
    // Navigate to next question or results
    if (currentStep < wizardQuestions.length) {
      navigate(`/wizard/${currentStep + 1}`);
    } else {
      navigate('/results');
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep > 1) {
      navigate(`/wizard/${currentStep - 1}`);
    }
  };

  // Parse contact info outside of the render function
  const parseContactInfo = () => {
    try {
      if (state.answers[`q${currentStep}`] && 
          typeof state.answers[`q${currentStep}`] === 'string') {
          
        // For debugging
        console.log(`Parsing contact info for q${currentStep}:`, state.answers[`q${currentStep}`]);
        
        // Only try to parse if it looks like JSON (starts with {)
        if (state.answers[`q${currentStep}`].trim().startsWith('{')) {
          return JSON.parse(state.answers[`q${currentStep}`]);
        }
      }
    } catch (e) {
      console.error("Error parsing contact info:", e, state.answers[`q${currentStep}`]);
    }
    
    // Default empty contact info
    return { 
      zipcode: '', 
      email: '', 
      phone: '', 
      lastname: '' 
    };
  };
  
  // Initialize contact form state at the component level
  const [contactFormData, setContactFormData] = useState(parseContactInfo());
  
  // Toggle a checkbox group option
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  // Update contact info fields
  const updateContactInfo = (field: string, value: string) => {
    const updatedData = { ...contactFormData, [field]: value };
    setContactFormData(updatedData);
    setValue('answer', JSON.stringify(updatedData));
  };
  
  // Render form input based on question type
  const renderInput = () => {
    const { type, placeholder, options, required, subfields, subtext } = question;
    
    switch (type) {
      case 'contact_info':
        // Handle the combined contact information fields with two-column layout
        // Force rerender with key to ensure ContactInfo fields are updated
        return (
          <div key={`contactinfo-${currentStep}`}>
            {/* Show any subtext/explanation if provided */}
            {subtext && (
              <div className="mb-4 text-sm text-muted-foreground">
                {subtext}
              </div>
            )}
            
            {/* Two-column grid layout for contact fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First column: Last Name and Email */}
              <div className="space-y-4">
                {subfields?.filter(f => ['lastname', 'email'].includes(f.name)).map((field, index) => (
                  <div key={`field-${field.name}-${index}`} className="space-y-2">
                    <Label htmlFor={`contact-${field.name}`} className="text-sm font-medium">
                      {field.placeholder}
                    </Label>
                    <Input
                      id={`contact-${field.name}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={contactFormData[field.name] || ''}
                      onChange={(e) => updateContactInfo(field.name, e.target.value)}
                      className="w-full transition-all duration-200"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
              
              {/* Second column: Zipcode and Phone */}
              <div className="space-y-4">
                {subfields?.filter(f => ['zipcode', 'phone'].includes(f.name)).map((field, index) => (
                  <div key={`field-${field.name}-${index}`} className="space-y-2">
                    <Label htmlFor={`contact-${field.name}`} className="text-sm font-medium">
                      {field.placeholder}
                    </Label>
                    <Input
                      id={`contact-${field.name}`}
                      type={field.type === 'tel' ? 'tel' : field.type}
                      placeholder={field.type === 'tel' ? '(555) 555-5555' : field.placeholder}
                      value={contactFormData[field.name] || ''}
                      onChange={(e) => updateContactInfo(field.name, e.target.value)}
                      className="w-full transition-all duration-200"
                      required={field.required}
                      // For phone numbers, add pattern for better mobile input
                      {...(field.type === 'tel' ? {
                        pattern: "[0-9()\\-\\s]+"
                      } : {})}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'checkbox_group':
        return (
          <div className="space-y-4">
            {/* Show any subtext/explanation if provided */}
            {subtext && (
              <div className="mb-4 text-sm text-muted-foreground">
                {subtext}
              </div>
            )}
            
            <div className="space-y-3">
              {options?.map((option) => (
                <div 
                  key={option} 
                  className={`flex items-start space-x-3 p-3 rounded-md border transition-all duration-150 
                  ${selectedOptions.includes(option) 
                    ? 'border-primary/40 bg-primary/5' 
                    : 'border-border hover:border-border/80 hover:bg-accent/50'}`}
                  onClick={() => toggleOption(option)}
                >
                  <Checkbox 
                    id={`checkbox-${option}`}
                    checked={selectedOptions.includes(option)} 
                    onCheckedChange={() => toggleOption(option)}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`checkbox-${option}`} 
                    className="text-base cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'text':
      case 'email':
        return (
          <div>
            {/* Show any subtext/explanation if provided */}
            {subtext && (
              <div className="mb-4 text-sm text-muted-foreground">
                {subtext}
              </div>
            )}
            
            <Input
              id={`q${currentStep}`}
              type={type}
              placeholder={placeholder}
              className="w-full p-4 text-lg"
              {...register('answer', { 
                required: required && 'This field is required',
                ...(type === 'email' && {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })
              })}
            />
          </div>
        );
        
      case 'number':
        return (
          <div>
            {/* Show any subtext/explanation if provided */}
            <Input
              id={`q${currentStep}`}
              type="number"
              placeholder={placeholder}
              className="w-full p-4 text-lg mb-4"
              {...register('answer', { 
                required: required && 'This field is required',
                valueAsNumber: true
              })}
            />
            
            {/* Display subfields if available (like second person age) */}
            {subtext && (
              <div className="mb-2 text-sm text-muted-foreground mt-6">
                {subtext}
              </div>
            )}
            
            {/* Render subfields (like second person age) */}
            {question.subfields?.map((subfield, idx) => (
              <div key={idx} className="mt-2">
                <Input
                  id={`q${currentStep}_${subfield.name}`}
                  type={subfield.type}
                  placeholder={subfield.placeholder}
                  className="w-full p-4 text-lg"
                  onChange={(e) => {
                    // Store subfield value in wizard state
                    const updatedAnswers = {...state.answers};
                    updatedAnswers[`q${currentStep}_${subfield.name}`] = e.target.value;
                    updateState({...state, answers: updatedAnswers});
                  }}
                />
              </div>
            ))}
          </div>
        );
        
      case 'select':
        return (
          <div>
            {/* Show any subtext/explanation if provided */}
            {subtext && (
              <div className="mb-4 text-sm text-muted-foreground">
                {subtext}
              </div>
            )}
            
            <Select
              defaultValue={state.answers[`q${currentStep}`] || ''}
              onValueChange={(value) => {
                setValue('answer', value);
                // Immediately save this value to state to prevent validation errors
                const updatedAnswers = {...state.answers};
                updatedAnswers[`q${currentStep}`] = value;
                updateState({...state, answers: updatedAnswers});
                
                // Navigate to the next question directly
                if (value) {
                  setTimeout(() => {
                    navigate(`/wizard/${currentStep + 1}`);
                  }, 100);
                }
              }}
            >
              <SelectTrigger className="w-full p-4 text-lg">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'radio':
        return (
          <div>
            {/* Show any subtext/explanation if provided */}
            {subtext && (
              <div className="mb-4 text-sm text-muted-foreground">
                {subtext}
              </div>
            )}
            
            <RadioGroup
              defaultValue={state.answers[`q${currentStep}`] || ''}
              onValueChange={(value) => setValue('answer', value)}
              className="space-y-3"
            >
              {options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`radio-${option}`} />
                  <Label htmlFor={`radio-${option}`} className="text-lg">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case 'textarea':
        return (
          <div>
            {/* Show any subtext/explanation if provided */}
            {subtext && (
              <div className="mb-4 text-sm text-muted-foreground">
                {subtext}
              </div>
            )}
            
            <Textarea
              id={`q${currentStep}`}
              placeholder={placeholder}
              className="w-full p-4 text-lg"
              rows={4}
              {...register('answer', { 
                required: required && 'This field is required'
              })}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fade-in bg-amber-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-normal mb-2 text-teal-600">
            <span>A</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
            <span>C</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>ara</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 font-light mb-2">Share Once. Reach Many.</p>
        </div>
        
        {/* Question Container */}
        <div className="py-6 md:py-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-serif text-teal-600">
              Question {currentStep} of {wizardQuestions.length}
            </h2>
          </div>
          
          <ProgressBar currentStep={currentStep} totalSteps={wizardQuestions.length} />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 min-h-[300px]">
            <div className="question-container p-2">
              <h3 className="text-2xl font-serif text-teal-600 mb-6">{question.text}</h3>
              
              <div className="transition-all duration-300 ease-in-out">
                {renderInput()}
              </div>
              
              {errors.answer && (
                <div className="flex items-center justify-center mt-4 mx-auto max-w-md text-red-500 text-sm bg-red-50 px-4 py-3 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.answer.message as string}
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-teal-600 text-teal-600 hover:bg-teal-50 px-6 py-2"
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button
                type="submit"
                className="ml-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-2"
              >
                {currentStep === wizardQuestions.length ? (
                  <div className="flex items-center">
                    <span>See Results</span>
                    <Check className="ml-2 h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Next</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
