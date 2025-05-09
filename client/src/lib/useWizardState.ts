import { useState, useEffect } from 'react';
import { Resource } from '@shared/schema';

// Type for answers
export type WizardAnswers = {
  [key: string]: string;
};

// Type for the emails to send
export interface EmailTemplate {
  to: string;
  subject: string;
  body: string;
}

// Interface for the global wizard state
export interface WizardState {
  currentQuestion: number;
  answers: WizardAnswers;
  resources: Resource[];
  selectedResourceIds: number[];
  emailsToSend: EmailTemplate[];
  currentEmailIndex: number;
}

// LocalStorage key
const STORAGE_KEY = 'careGuideAnswers';

// Default resources to select (1 and 2)
const DEFAULT_SELECTED_RESOURCES = [1, 2];

export function useWizardState() {
  // Initialize state from localStorage or with defaults
  const [state, setState] = useState<WizardState>(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        return {
          ...parsedState,
          resources: [],  // Resources will be fetched from API
          emailsToSend: parsedState.emailsToSend || [],
          currentEmailIndex: parsedState.currentEmailIndex || 0
        };
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    
    // Default state
    return {
      currentQuestion: 1,
      answers: {},
      resources: [],
      selectedResourceIds: DEFAULT_SELECTED_RESOURCES,
      emailsToSend: [],
      currentEmailIndex: 0
    };
  });

  // Persist answers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  // Method to update the state
  const updateState = (newState: Partial<WizardState>) => {
    setState(currentState => ({ ...currentState, ...newState }));
  };

  // Method to reset the state
  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentQuestion: 1,
      answers: {},
      resources: state.resources, // Keep fetched resources
      selectedResourceIds: DEFAULT_SELECTED_RESOURCES,
      emailsToSend: [],
      currentEmailIndex: 0
    });
  };

  return {
    state,
    updateState,
    resetState
  };
}

export default useWizardState;
