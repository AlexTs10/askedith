
import { useState, useRef, useCallback } from 'react';

interface HoverState {
  isVisible: boolean;
  slideDirection: 'left' | 'right';
  position: { top: number; left?: number; right?: number };
}

export const useEmailPreviewHover = () => {
  const [hoverState, setHoverState] = useState<HoverState>({
    isVisible: false,
    slideDirection: 'left',
    position: { top: 0 }
  });
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    console.log('🐭 Mouse enter triggered on DocumentCard');
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      const rect = event.currentTarget.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const cardCenterX = rect.left + rect.width / 2;
      
      console.log('📊 Card position:', { 
        left: rect.left, 
        width: rect.width, 
        screenWidth, 
        cardCenterX,
        rightSide: cardCenterX > screenWidth / 2
      });
      
      // Determine slide direction based on card position
      const slideDirection = cardCenterX > screenWidth / 2 ? 'right' : 'left';
      
      // Calculate position with more spacing
      const top = rect.top + window.scrollY;
      const position = slideDirection === 'left'
        ? { top, left: rect.right + 30 } // Show to the right of the card
        : { top, right: screenWidth - rect.left + 30 }; // Show to the left of the card

      console.log('✅ Setting hover state:', { slideDirection, position, isVisible: true });

      setHoverState({
        isVisible: true,
        slideDirection,
        position
      });
    }, 300); // Slightly longer delay for stability
  }, []);

  const handleMouseLeave = useCallback(() => {
    console.log('🐭 Mouse leave triggered');
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      console.log('❌ Hiding preview');
      setHoverState(prev => ({ ...prev, isVisible: false }));
    }, 150);
  }, []);

  const cleanup = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  return {
    hoverState,
    handleMouseEnter,
    handleMouseLeave,
    cleanup
  };
};
