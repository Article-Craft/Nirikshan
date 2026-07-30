import { useState, useEffect } from 'react';

export const useComplaintData = (filter = 'all') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    const fetchComplaints = setTimeout(() => {
      try {
        // Generate mock data representing regions/districts and their complaint densities
        // Using arbitrary coordinates/grid points or just category names for a density chart
        const mockData = [
          { region: 'Koshi', density: 12 },
          { region: 'Madhesh', density: 85 },
          { region: 'Bagmati', density: 45 },
          { region: 'Gandaki', density: 20 },
          { region: 'Lumbini', density: 60 },
          { region: 'Karnali', density: 5 },
          { region: 'Sudurpashchim', density: 30 },
        ];
        
        setData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch complaint data');
      } finally {
        setLoading(false);
      }
    }, 1500);

    return () => clearTimeout(fetchComplaints);
  }, [filter]);

  return { data, loading, error };
};
