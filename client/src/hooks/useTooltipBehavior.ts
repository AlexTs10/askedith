
import { useState, useRef, useCallback } from 'react';

export const useTooltipBehavior = () => {
  const [hoveredStatus, setHoveredStatus] = useState<'unread' | 'pending' | 'unresponded' | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipGracePeriod, setTooltipGracePeriod] = useState(false);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const gracePeriodTimeoutRef = useRef<NodeJS.Timeout>();

  const handleStatusHover = useCallback((status: 'unread' | 'pending' | 'unresponded', event: React.MouseEvent, categoryId: string, pending: number) => {
    console.log('🔍 Status hover triggered:', {
      status,
      tooltipGracePeriod,
      hoveredStatus,
      isInGracePeriod: tooltipGracePeriod && hoveredStatus,
      categoryId,
      pendingCount: pending
    });

    // If we're in a grace period and a tooltip is already open, ignore new hovers
    if (tooltipGracePeriod && hoveredStatus) {
      console.log('🚫 Grace period active - ignoring hover for:', status);
      return;
    }

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
      console.log('✅ Opening tooltip for:', status, 'in category:', categoryId);
      setTooltipPosition(position);
      setHoveredStatus(status);
      
      // Start grace period when tooltip opens
      setTooltipGracePeriod(true);
      console.log('🛡️ Grace period started for 1 second');
      
      if (gracePeriodTimeoutRef.current) {
        clearTimeout(gracePeriodTimeoutRef.current);
      }
      
      gracePeriodTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Grace period ended');
        setTooltipGracePeriod(false);
      }, 1000); // 1 second grace period
    }, 800);
  }, [tooltipGracePeriod, hoveredStatus]);

  const handleStatusLeave = useCallback(() => {
    console.log('👋 Status leave triggered, grace period active:', tooltipGracePeriod);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      console.log('🔒 Closing tooltip after delay');
      setHoveredStatus(null);
      setTooltipGracePeriod(false);
      if (gracePeriodTimeoutRef.current) {
        clearTimeout(gracePeriodTimeoutRef.current);
      }
    }, 1300); // 1.3 seconds (1 second + 300ms)
  }, [tooltipGracePeriod]);

  const handleTooltipClose = useCallback(() => {
    console.log('❌ Manual tooltip close');
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (gracePeriodTimeoutRef.current) {
      clearTimeout(gracePeriodTimeoutRef.current);
    }
    setHoveredStatus(null);
    setTooltipGracePeriod(false);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    handleTooltipClose();
  }, [handleTooltipClose]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (gracePeriodTimeoutRef.current) clearTimeout(gracePeriodTimeoutRef.current);
  }, []);

  return {
    hoveredStatus,
    tooltipPosition,
    tooltipGracePeriod,
    handleStatusHover,
    handleStatusLeave,
    handleTooltipClose,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    cleanup
  };
};
