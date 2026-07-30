import React from 'react';

export default function StatBlock({ label, value, description }) {
  return (
    <div className="flex flex-col border-l-4 border-temple-brass pl-4 py-1">
      <span className="text-3xl font-serif text-pagoda-wood mb-1">{value}</span>
      <span className="text-xs uppercase tracking-wider font-semibold text-slate-basalt">{label}</span>
      {description && <span className="text-sm text-slate-basalt mt-1">{description}</span>}
    </div>
  );
}
