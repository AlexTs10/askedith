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
      answer: state.answers[`q${currentStep}`] || ''
    }
  });

  // Update form value when step changes
  useEffect(() => {
    setValue('answer', state.answers[`q${currentStep}`] || '');
  }, [currentStep, state.answers, setValue]);

  // Handle form submission
  const onSubmit = (data: { answer: string }) => {
    // Save the answer to the state
    const updatedAnswers = {
      ...state.answers,
      [`q${currentStep}`]: data.answer
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
    const { type, placeholder, options, required } = question;
    
    switch (type) {
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
    <Card className="bg-white rounded-xl shadow-md">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">Care Assessment</h2>
        </div>
        
        <ProgressBar currentStep={currentStep} totalSteps={wizardQuestions.length} />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 min-h-[300px]">
          <div className="question-container">
            <h3 className="text-xl font-medium text-neutral-dark mb-3">{question.text}</h3>
            {renderInput()}
            {errors.answer && (
              <p className="text-error text-sm mt-2">{errors.answer.message as string}</p>
            )}
          </div>
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="px-6 py-3 rounded-lg font-medium"
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
            
            <Button
              type="submit"
              className="ml-auto px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark"
            >
              {currentStep === wizardQuestions.length ? (
                <>
                  See Results
                  <Check className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
