import { useState, useEffect } from 'react';

export const useBudgetData = (regionId = 'all') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    const fetchBudget = setTimeout(() => {
      try {
        const mockData = [
          { name: 'Q1', allocated: 45000000, completed: 32000000, hasMismatch: false },
          { name: 'Q2', allocated: 52000000, completed: 48000000, hasMismatch: false },
          { name: 'Q3', allocated: 61000000, completed: 35000000, hasMismatch: true },
          { name: 'Q4', allocated: 48000000, completed: 15000000, hasMismatch: true },
        ];
        
        setData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch budget data');
      } finally {
        setLoading(false);
      }
    }, 1500); // 1.5s delay to show the Weathered Stone shimmer

    return () => clearTimeout(fetchBudget);
  }, [regionId]);

  return { data, loading, error };
};
