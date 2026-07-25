import { useState, useEffect } from 'react';
import { budgetAPI } from '../api';

export const useBudgetData = (regionId = 'all') => {
  const [data, setData] = useState({
    overview: [],
    trends: [],
    districtComparison: []
  });
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
        
        // 1. Overview (Project level)
        const overview = projects.map(proj => {
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

        // 2. District Comparison
        const districtMap = {};
        projects.forEach(proj => {
          const districtName = proj.district ? proj.district.name : 'Unknown';
          if (!districtMap[districtName]) {
            districtMap[districtName] = { name: districtName, allocated: 0, completed: 0 };
          }
          const allocated = Number(proj.allocatedAmount) || 0;
          const completionPercent = Number(proj.completionPercent) || 0;
          districtMap[districtName].allocated += allocated;
          districtMap[districtName].completed += allocated * (completionPercent / 100);
        });
        const districtComparison = Object.values(districtMap);

        // 3. Trends (Yearly)
        const trendsMap = {};
        projects.forEach(proj => {
          const year = proj.createdAt ? new Date(proj.createdAt).getFullYear().toString() : '2023';
          if (!trendsMap[year]) {
            trendsMap[year] = { year, allocated: 0, completed: 0 };
          }
          const allocated = Number(proj.allocatedAmount) || 0;
          const completionPercent = Number(proj.completionPercent) || 0;
          trendsMap[year].allocated += allocated;
          trendsMap[year].completed += allocated * (completionPercent / 100);
        });
        const trends = Object.values(trendsMap).sort((a, b) => a.year.localeCompare(b.year));

        setData({ overview, districtComparison, trends });
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
