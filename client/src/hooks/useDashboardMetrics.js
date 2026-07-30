import { useState, useEffect } from 'react';
import { complaintsAPI } from '../api';

const getProvinceFromCoords = (lat, lng) => {
  if (!lat || !lng) return 'Bagmati';
  if (lng > 86.5) return 'Koshi';
  if (lng < 81.3) return 'Sudurpashchim';
  if (lng < 83.2 && lat > 28.2) return 'Karnali';
  if (lng < 83.9 && lat < 28.2) return 'Lumbini';
  if (lng >= 83.2 && lng < 84.6 && lat >= 27.8) return 'Gandaki';
  if (lng >= 84.5 && lng < 86.5 && lat < 27.35) return 'Madhesh';
  return 'Bagmati';
};

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalComplaints: 0,
    openCases: 0,
    resolvedCases: 0,
    mostReportedDistrict: 'N/A',
    avgResponseTime: null,
    trends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchMetrics = async () => {
      try {
        const complaints = await complaintsAPI.getAll({ status: 'all' });
        
        if (!isMounted) return;

        let total = complaints.length;
        let open = 0;
        let resolved = 0;
        const districtCounts = {};

        complaints.forEach(c => {
          if (c.status === 'pending') open++;
          if (c.status === 'verified') resolved++;
          
          const dist = getProvinceFromCoords(c.locationLat, c.locationLng);
          districtCounts[dist] = (districtCounts[dist] || 0) + 1;
        });

        let mostReported = 'N/A';
        let maxCount = 0;
        Object.entries(districtCounts).forEach(([dist, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostReported = dist;
          }
        });

        setMetrics({
          totalComplaints: total,
          openCases: open,
          resolvedCases: resolved,
          mostReportedDistrict: mostReported,
          avgResponseTime: null,
          trends: null
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load dashboard metrics:', err);
        setError('Failed to load metrics');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return { metrics, loading, error };
};
