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

export const useComplaintData = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Transform filters if they are string (for backward compatibility)
    const params = typeof filters === 'string' ? { serviceType: filters } : filters;

    complaintsAPI.getAll(params)
      .then((complaints) => {
        if (!isMounted) return;
        
        // Initialize counts for all 7 provinces
        const counts = {
          Koshi: 0,
          Madhesh: 0,
          Bagmati: 0,
          Gandaki: 0,
          Lumbini: 0,
          Karnali: 0,
          Sudurpashchim: 0
        };

        // Populate counts
        complaints.forEach(complaint => {
          const province = getProvinceFromCoords(complaint.locationLat, complaint.locationLng);
          if (counts[province] !== undefined) {
            counts[province] += 1;
          }
        });

        // Map to format required by ComplaintHeatmap
        const mappedData = Object.keys(counts).map(province => ({
          region: province,
          density: counts[province] // Using raw count of complaints
        }));

        setData(mappedData);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('useComplaintData error:', err);
        setError(err.response?.data?.error || 'Failed to fetch complaint data');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
};
