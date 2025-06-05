
import { useState, useRef, useEffect, useCallback } from 'react';

export const useScrollBehavior = (isExpanded: boolean) => {
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const scrollLockTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for scroll events to activate scroll lock
  useEffect(() => {
    const handleScroll = () => {
      setIsScrollLocked(true);
      
      if (scrollLockTimeoutRef.current) {
        clearTimeout(scrollLockTimeoutRef.current);
      }
      
      scrollLockTimeoutRef.current = setTimeout(() => {
        setIsScrollLocked(false);
      }, 5000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollLockTimeoutRef.current) {
        clearTimeout(scrollLockTimeoutRef.current);
      }
    };
  }, []);

  // Gentle auto-scroll into view when accordion expands
  useEffect(() => {
    if (isExpanded && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const padding = 44; // Extra height padding
          
          // Check if the expanded accordion needs adjustment
          if (rect.bottom > viewportHeight - padding || rect.top < padding) {
            containerRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }
      }, 200); // Slight delay to allow expansion animation
    }
  }, [isExpanded]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (scrollLockTimeoutRef.current) clearTimeout(scrollLockTimeoutRef.current);
  }, []);

  return {
    isScrollLocked,
    containerRef,
    cleanup
  };
};
