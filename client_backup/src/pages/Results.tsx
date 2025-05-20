// Redirect to new clean results page
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import CleanResultsPage from './CleanResultsPage';

export default function Results() {
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    // Redirect to the clean results page
    navigate('/clean-results');
  }, [navigate]);
  
  return <CleanResultsPage />;
}