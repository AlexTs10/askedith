
import { useState, useRef, useCallback } from 'react';
import { APPOINTMENTS } from '../data/appointmentData';

export const useCalendarHover = () => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const hoveredDayRef = useRef<HTMLDivElement | null>(null);

  // Get appointments for a specific date
  const getAppointmentsForDate = (targetDate: Date) => {
    return APPOINTMENTS.filter(app => 
      app.date.getDate() === targetDate.getDate() && 
      app.date.getMonth() === targetDate.getMonth() && 
      app.date.getFullYear() === targetDate.getFullYear()
    );
  };

  // Clear any existing timeout
  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  // Set a timeout to hide the tooltip
  const setHideTimeout = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      if (!isTooltipHovered) {
        setHoveredDate(null);
        hoveredDayRef.current = null;
      }
    }, 300);
  };

  // Enhanced hover detection that works across all months
  const handleCalendarMouseMove = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // More comprehensive day button detection
    const dayButton = target.closest(`
      [role="gridcell"] button,
      .rdp-day,
      .rdp-button_reset,
      button[name="day"],
      [data-day],
      button[class*="day"]
    `.replace(/\s+/g, ' ').trim()) as HTMLElement;
    
    if (dayButton) {
      // Check if it's a button element and if it's disabled
      const isButton = dayButton instanceof HTMLButtonElement;
      const isDisabled = isButton && (dayButton.disabled || dayButton.hasAttribute('disabled'));
      
      if (!isDisabled) {
        // Try multiple methods to get the day number
        let dayNumber: number | null = null;
        
        // Method 1: Direct text content (most reliable)
        const textContent = dayButton.textContent?.trim();
        if (textContent && !isNaN(parseInt(textContent)) && textContent.length <= 2) {
          dayNumber = parseInt(textContent);
        }
        
        // Method 2: data attributes
        if (!dayNumber && dayButton.dataset.day) {
          dayNumber = parseInt(dayButton.dataset.day);
        }
        
        // Method 3: aria-label parsing
        if (!dayNumber && dayButton.getAttribute('aria-label')) {
          const ariaLabel = dayButton.getAttribute('aria-label');
          const match = ariaLabel?.match(/(\d+)/);
          if (match) {
            dayNumber = parseInt(match[1]);
          }
        }
        
        // Method 4: Check if button is in a cell with day info
        if (!dayNumber) {
          const cell = dayButton.closest('[role="gridcell"]');
          if (cell) {
            const cellText = cell.textContent?.trim();
            if (cellText && !isNaN(parseInt(cellText)) && cellText.length <= 2) {
              dayNumber = parseInt(cellText);
            }
          }
        }
        
        if (dayNumber && dayNumber >= 1 && dayNumber <= 31) {
          // Use current calendar month for date construction
          const hoveredDateObj = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), dayNumber);
          
          // Validate the date is actually valid and in the current month
          if (hoveredDateObj.getMonth() === currentCalendarMonth.getMonth() && 
              hoveredDateObj.getFullYear() === currentCalendarMonth.getFullYear()) {
            
            clearHideTimeout();
            
            // Store the day button reference for positioning
            hoveredDayRef.current = dayButton as HTMLDivElement;
            
            // Only update if date changed
            if (!hoveredDate || hoveredDate.getTime() !== hoveredDateObj.getTime()) {
              setHoveredDate(hoveredDateObj);
            }
            return;
          }
        }
      }
    }
    
    // If we get here, we're not over a valid day - set timeout to hide
    setHideTimeout();
  };

  const handleCalendarMouseLeave = () => {
    setHideTimeout();
  };

  const handleTooltipMouseEnter = () => {
    clearHideTimeout();
    setIsTooltipHovered(true);
  };

  const handleTooltipMouseLeave = () => {
    setIsTooltipHovered(false);
    setHideTimeout();
  };

  const handleAddAppointmentFromTooltip = (targetDate: Date, onDateSelect: (date: Date) => void, onAddAppointment: () => void) => {
    clearHideTimeout();
    setHoveredDate(null);
    hoveredDayRef.current = null;
    setIsTooltipHovered(false);
    onDateSelect(targetDate);
    onAddAppointment();
  };

  // Handle month changes in calendar
  const handleCalendarMonthChange = (newMonth: Date) => {
    setCurrentCalendarMonth(newMonth);
    setHoveredDate(null); // Clear hover when month changes
    hoveredDayRef.current = null;
    setIsTooltipHovered(false);
  };

  return {
    hoveredDate,
    tooltipPosition,
    currentCalendarMonth,
    hoveredDayRef,
    getAppointmentsForDate,
    handleCalendarMouseMove,
    handleCalendarMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    handleAddAppointmentFromTooltip,
    handleCalendarMonthChange,
    setCurrentCalendarMonth
  };
};
