export const formatNPR = (amount) => {
  if (amount === undefined || amount === null) return 'NPR 0';
  
  // Format with commas for South Asian numbering system if possible, 
  // but standard en-IN locale works well for NPR format.
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(amount);
};
