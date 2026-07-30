import { useState, useEffect } from 'react';
import { budgetAPI } from '../api';

export const useBudgetData = (regionId = 'all') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = {};
    if (regionId && regionId !== 'all') {
      params.district_id = regionId;
    }

    budgetAPI.getAll(params)
      .then((projects) => {
        if (!isMounted) return;
        const mappedData = projects.map(proj => {
          const allocated = Number(proj.allocatedAmount) || 0;
          const completionPercent = Number(proj.completionPercent) || 0;
          const completed = allocated * (completionPercent / 100);
          return {
            name: proj.title,
            allocated,
            completed,
            hasMismatch: proj.evidenceStatus !== 'verified'
          };
        });
        setData(mappedData);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('useBudgetData error:', err);
        setError(err.response?.data?.error || 'Failed to fetch budget data');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [regionId]);

  return { data, loading, error };
};
