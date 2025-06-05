
import { useState } from 'react';

export const useSlideOutCalendar = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const openCalendar = () => {
    setIsCalendarOpen(true);
  };

  const closeCalendar = () => {
    setIsCalendarOpen(false);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return {
    isCalendarOpen,
    openCalendar,
    closeCalendar,
    toggleCalendar
  };
};
