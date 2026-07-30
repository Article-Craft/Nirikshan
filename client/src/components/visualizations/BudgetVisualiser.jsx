import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useBudgetData } from '../../hooks/useBudgetData';
import { formatNPR } from '../../utils/formatters';
import { AlertTriangle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-himalayan-mist border border-dust-beige p-4 shadow-md font-sans text-sm">
        <h4 className="font-serif font-bold text-pagoda-wood mb-2 border-b border-dust-beige pb-1">{label}</h4>
        <div className="space-y-1">
          <p className="text-terraced-pine font-semibold">
            Allocated: {formatNPR(data.allocated)}
          </p>
          <p className="text-temple-brass font-semibold">
            Completed: {formatNPR(data.completed)}
          </p>
        </div>
        {data.hasMismatch && (
          <div className="mt-2 pt-2 border-t border-dust-beige flex items-center gap-1.5 text-charred-brick">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Mismatch Detected</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function BudgetVisualiser({ regionId = 'all' }) {
  const { data, loading, error } = useBudgetData(regionId);

  if (error) {
    return (
      <div className="bg-weather-stone border border-dust-beige p-6 flex items-center justify-center h-80 text-status-broken font-serif">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-weather-stone border border-dust-beige p-6 h-80 flex flex-col gap-4">
        <div className="h-6 w-1/3 rounded bg-dust-beige/50 animate-shimmer" />
        <div className="flex-1 rounded bg-dust-beige/30 animate-shimmer flex items-end justify-around pb-4 px-4 gap-4">
          <div className="w-full h-1/2 rounded-t bg-dust-beige/50 animate-shimmer" />
          <div className="w-full h-3/4 rounded-t bg-dust-beige/50 animate-shimmer" />
          <div className="w-full h-1/3 rounded-t bg-dust-beige/50 animate-shimmer" />
          <div className="w-full h-full rounded-t bg-dust-beige/50 animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-weather-stone border border-dust-beige p-6 h-80 flex flex-col items-center justify-center text-slate-basalt/60 font-serif">
        <p>No budget data available for this period.</p>
      </div>
    );
  }

  // Calculate totals for the progress bar
  const totalAllocated = data.reduce((sum, item) => sum + item.allocated, 0);
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const progressPercentage = totalAllocated > 0 ? Math.round((totalCompleted / totalAllocated) * 100) : 0;

  return (
    <div className="bg-weather-stone border border-dust-beige p-6 shadow-sm flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-serif text-pagoda-wood tracking-tight mb-1">Fiscal Budget Allocation vs. Delivery</h3>
        <p className="text-sm text-slate-basalt/70 font-sans">
          Tracking committed funds against certified project completion.
        </p>
      </div>

      <div className="h-72 w-full font-sans text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFC4A8" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#453F36' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#453F36' }}
              tickFormatter={(value) => `Rs. ${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#CFC4A8', opacity: 0.2 }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar dataKey="allocated" name="Budget Allocated" fill="#2C3B2A" radius={[2, 2, 0, 0]} />
            <Bar dataKey="completed" name="Work Completed" fill="#9C7A3C" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.hasMismatch ? '#6E4438' : '#9C7A3C'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-6 border-t border-dust-beige/50">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-basalt">Overall Progress</span>
          <span className="font-serif font-bold text-pagoda-wood text-lg">{progressPercentage}%</span>
        </div>
        {/* Progress bars: Weathered Stone track, Temple Brass fill */}
        <div className="w-full bg-[#E4DCC8] border border-dust-beige/40 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-temple-brass h-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-basalt/60 uppercase tracking-widest font-semibold">
          <span>{formatNPR(totalCompleted)} Delivered</span>
          <span>{formatNPR(totalAllocated)} Committed</span>
        </div>
      </div>
    </div>
  );
}
