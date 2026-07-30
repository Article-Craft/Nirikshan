import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-weathered-stone text-slate-basalt border border-dust-beige',
    fulfilled: 'bg-status-fulfilled text-himalayan-mist',
    broken: 'bg-status-broken text-himalayan-mist',
    delayed: 'bg-status-delayed text-himalayan-mist',
    accent: 'bg-temple-brass text-himalayan-mist',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-sm text-xs font-semibold tracking-wider uppercase ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
