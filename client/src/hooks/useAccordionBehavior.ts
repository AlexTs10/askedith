
import { useState, useRef, useCallback } from 'react';

export const useAccordionBehavior = (isScrollLocked: boolean) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandTimeoutRef = useRef<NodeJS.Timeout>();

  const handleHeaderHover = useCallback(() => {
    if (isScrollLocked) return;
    
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
    }
    
    expandTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 300); // 300ms delay as requested
  }, [isScrollLocked]);

  const handleHeaderLeave = useCallback(() => {
    // Clear expand timeout to prevent opening if user moves away quickly
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
    }
    // DO NOT auto-close on leave - stays open until manually closed
  }, []);

  const handleHeaderClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
  }, []);

  return {
    isExpanded,
    handleHeaderHover,
    handleHeaderLeave,
    handleHeaderClick,
    cleanup
  };
};
