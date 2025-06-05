
import { useState, useCallback } from 'react';

export const useAccordionStates = (totalRows: number) => {
  // Initialize all rows as open (true)
  const [accordionStates, setAccordionStates] = useState<boolean[]>(
    Array(totalRows).fill(true)
  );

  const toggleRow = useCallback((rowIndex: number) => {
    setAccordionStates(prev => 
      prev.map((state, index) => index === rowIndex ? !state : state)
    );
  }, []);

  const openAll = useCallback(() => {
    setAccordionStates(Array(totalRows).fill(true));
  }, [totalRows]);

  const closeAll = useCallback(() => {
    setAccordionStates(Array(totalRows).fill(false));
  }, [totalRows]);

  // Update states array when totalRows changes
  const updateRowCount = useCallback((newRowCount: number) => {
    setAccordionStates(prev => {
      const newStates = [...prev];
      while (newStates.length < newRowCount) {
        newStates.push(true); // New rows default to open
      }
      return newStates.slice(0, newRowCount);
    });
  }, []);

  return {
    accordionStates,
    toggleRow,
    openAll,
    closeAll,
    updateRowCount
  };
};
