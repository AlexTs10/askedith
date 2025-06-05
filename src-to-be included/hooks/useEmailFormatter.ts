import { useMemo } from 'react';

export const useEmailFormatter = () => {
  const formatDate = useMemo(() => (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's within the last week, show day name
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  return { formatDate };
};
