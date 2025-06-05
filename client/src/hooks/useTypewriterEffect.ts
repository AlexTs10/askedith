import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

const categories: Category[] = [
  // Column 1
  { id: 'elder-law-attorneys', name: 'Elder Law Attorneys' },
  { id: 'home-care', name: 'Home Care' },
  { id: 'government-va', name: 'Government & VA' },
  // Column 2
  { id: 'professionals', name: 'Other Professionals' },
  { id: 'physical-therapy', name: 'Physical Therapy' },
  { id: 'hospitals', name: 'Hospitals' },
  // Column 3
  { id: 'paying-for-care', name: 'Paying for Care' },
  { id: 'senior-living', name: 'Senior Living' },
  { id: 'pharmacies', name: 'Pharmacies' }
];

export const useTypewriterEffect = (isActive: boolean) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setCurrentText('');
      setIsFading(false);
      return;
    }

    const currentCategory = categories[currentIndex];
    const targetText = `Show me ${currentCategory.name}...`;
    
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // Typing phase
      if (currentText.length < targetText.length) {
        timeoutId = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, 100);
      } else {
        // Pause before fading
        timeoutId = setTimeout(() => {
          setIsTyping(false);
          setIsFading(true);
        }, 2000);
      }
    } else {
      // Fading phase - clear text first, then reset states
      timeoutId = setTimeout(() => {
        setCurrentText('');
        setCurrentIndex((prev) => (prev + 1) % categories.length);
        setIsTyping(true);
        // Keep fading state true for a brief moment to prevent flicker
        setTimeout(() => {
          setIsFading(false);
        }, 50);
      }, 500); // 500ms fade duration
    }

    return () => clearTimeout(timeoutId);
  }, [currentText, currentIndex, isTyping, isActive]);

  return { text: currentText, isFading };
};
