import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProgressBar from '@/components/ProgressBar';
import wizardQuestions from '@/lib/wizardQuestions';
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
  
  // Form handling
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      answer: state.answers[`q${currentStep}`] || 
        (question.type === 'contact_info' ? JSON.stringify({ name: '', email: '', zipcode: '' }) : '')
    }
  });

  // Update form value when step changes
  useEffect(() => {
    if (question.type === 'contact_info') {
      // For contact info, ensure we have a valid JSON object
      const currentValue = state.answers[`q${currentStep}`];
      if (!currentValue) {
        setValue('answer', JSON.stringify({ name: '', email: '', zipcode: '' }));
      } else {
        setValue('answer', currentValue);
      }
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
    
    // Validate contact info if applicable
    if (question.type === 'contact_info') {
      try {
        const contactData = JSON.parse(data.answer);
        // Check if all required fields are filled
        const allFieldsFilled = question.subfields?.every(field => 
          field.required ? !!contactData[field.name] : true
        );
        
        if (!allFieldsFilled) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required contact fields",
            variant: "destructive"
          });
          return;
        }
        
        // If email field exists, validate email format
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
      } catch (error) {
        toast({
          title: "Form Error",
          description: "There was a problem with the contact information",
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

  // Render form input based on question type
  const renderInput = () => {
    const { type, placeholder, options, required, subfields } = question;
    
    switch (type) {
      case 'contact_info':
        // Handle the combined contact information fields
        const contactInfo = state.answers[`q${currentStep}`] ? 
          JSON.parse(state.answers[`q${currentStep}`]) : 
          { name: '', email: '', zipcode: '' };
        
        // Local state for contact info fields
        const [contactFormData, setContactFormData] = useState(contactInfo);
        
        // Update form value when contact info changes
        const updateContactInfo = (field: string, value: string) => {
          const updatedData = { ...contactFormData, [field]: value };
          setContactFormData(updatedData);
          setValue('answer', JSON.stringify(updatedData));
        };
        
        return (
          <div className="space-y-4">
            {subfields?.map((field, index) => (
              <div key={index} className="space-y-2">
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
        );
      
      case 'text':
      case 'email':
        return (
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
        );
        
      case 'number':
        return (
          <Input
            id={`q${currentStep}`}
            type="number"
            placeholder={placeholder}
            className="w-full p-4 text-lg"
            {...register('answer', { 
              required: required && 'This field is required',
              valueAsNumber: true
            })}
          />
        );
        
      case 'select':
        return (
          <Select
            defaultValue={state.answers[`q${currentStep}`] || ''}
            onValueChange={(value) => setValue('answer', value)}
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
        );
        
      case 'radio':
        return (
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
        );
        
      case 'textarea':
        return (
          <Textarea
            id={`q${currentStep}`}
            placeholder={placeholder}
            className="w-full p-4 text-lg"
            rows={4}
            {...register('answer', { 
              required: required && 'This field is required'
            })}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      <Card className="card bg-card/80 backdrop-blur-sm border-0">
        <CardContent className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              <span className="text-primary">Care</span>Guide Assessment
            </h2>
            <div className="text-sm text-muted-foreground bg-background/60 px-3 py-1.5 rounded-full">
              Question {currentStep} of {wizardQuestions.length}
            </div>
          </div>
          
          <ProgressBar currentStep={currentStep} totalSteps={wizardQuestions.length} />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 min-h-[300px]">
            <div className="question-container bg-background/50 p-6 rounded-xl border border-border/50">
              <h3 className="text-xl font-medium text-foreground mb-6">{question.text}</h3>
              
              <div className="transition-all duration-300 ease-in-out transform hover:translate-y-[-2px]">
                {renderInput()}
              </div>
              
              {errors.answer && (
                <div className="flex items-center mt-3 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
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
                className="px-6 py-3 transition-all duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground"
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              
              <Button
                type="submit"
                className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
              >
                {currentStep === wizardQuestions.length ? (
                  <div className="flex items-center">
                    <span>See Results</span>
                    <Check className="ml-2 h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Continue</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
