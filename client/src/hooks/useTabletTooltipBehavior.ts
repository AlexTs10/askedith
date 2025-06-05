
import React, { useState, useRef, useCallback } from 'react';
import { useIsTablet } from './use-tablet';

export const useTabletTooltipBehavior = () => {
  const [hoveredStatus, setHoveredStatus] = useState<'unread' | 'pending' | 'unresponded' | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tappedStatus, setTappedStatus] = useState<string | null>(null);
  const isTablet = useIsTablet();
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const handleStatusHover = useCallback((status: 'unread' | 'pending' | 'unresponded', event: React.MouseEvent, categoryId: string, pending: number) => {
    if (isTablet) {
      // On tablet, use tap-on-tap-off behavior
      const statusKey = `${categoryId}-${status}`;
      
      if (tappedStatus === statusKey) {
        // Tap off - close tooltip
        setHoveredStatus(null);
        setTappedStatus(null);
        console.log('📱 Tablet tap off - closing tooltip for:', status);
      } else {
        // Tap on - open tooltip
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top
        };
        
        setTooltipPosition(position);
        setHoveredStatus(status);
        setTappedStatus(statusKey);
        console.log('📱 Tablet tap on - opening tooltip for:', status);
      }
      return;
    }

    // Desktop/laptop hover behavior (existing logic)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top
    };

    hoverTimeoutRef.current = setTimeout(() => {
      console.log('🖥️ Desktop hover - opening tooltip for:', status);
      setTooltipPosition(position);
      setHoveredStatus(status);
    }, 800);
  }, [isTablet, tappedStatus]);

  const handleStatusLeave = useCallback(() => {
    if (isTablet) {
      // On tablet, don't close on "leave" - only on tap
      return;
    }
    
    // Desktop/laptop behavior
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      console.log('🖥️ Desktop hover leave - closing tooltip');
      setHoveredStatus(null);
      setTappedStatus(null);
    }, 1300);
  }, [isTablet]);

  const handleTooltipClose = useCallback(() => {
    console.log('❌ Manual tooltip close');
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setHoveredStatus(null);
    setTappedStatus(null);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (isTablet) return; // No mouse events on tablet
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, [isTablet]);

  const handleTooltipMouseLeave = useCallback(() => {
    if (isTablet) return; // No mouse events on tablet
    
    handleTooltipClose();
  }, [isTablet, handleTooltipClose]);

  // Handle clicks outside tooltip on tablet
  const handleOutsideClick = useCallback((event: Event) => {
    if (!isTablet || !hoveredStatus) return;
    
    const target = event.target as HTMLElement;
    if (!target.closest('[data-tooltip-trigger]') && !target.closest('[data-tooltip-content]')) {
      handleTooltipClose();
    }
  }, [isTablet, hoveredStatus, handleTooltipClose]);

  // Add/remove outside click listener for tablet
  React.useEffect(() => {
    if (isTablet && hoveredStatus) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [isTablet, hoveredStatus, handleOutsideClick]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  return {
    hoveredStatus,
    tooltipPosition,
    isTablet,
    handleStatusHover,
    handleStatusLeave,
    handleTooltipClose,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    cleanup
  };
};
