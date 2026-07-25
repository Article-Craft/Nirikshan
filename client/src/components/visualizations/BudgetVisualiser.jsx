import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useBudgetData } from '../../hooks/useBudgetData';
import { formatNPR } from '../../utils/formatters';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-himalayan-mist border border-dust-beige p-4 shadow-md font-sans text-sm">
        <h4 className="font-serif font-bold text-pagoda-wood mb-2 border-b border-dust-beige pb-1">{label}</h4>
        <div className="space-y-1">
          <p className="text-terraced-pine font-semibold">
            Allocated: {formatNPR(data.allocated || 0)}
          </p>
          <p className="text-temple-brass font-semibold">
            Completed: {formatNPR(data.completed || 0)}
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

const EmptyState = ({ message }) => (
  <div className="bg-weather-stone border border-dashed border-dust-beige h-72 flex flex-col items-center justify-center text-slate-basalt/60 font-serif p-6 text-center gap-3">
    <AlertCircle className="w-6 h-6 opacity-50" />
    <p>{message}</p>
  </div>
);

export default function BudgetVisualiser({ regionId = 'all' }) {
  const { data, loading, error } = useBudgetData(regionId);
  const [activeTab, setActiveTab] = useState('overview');

  if (error) {
    return (
      <div className="bg-weather-stone border border-dust-beige p-6 flex items-center justify-center h-96 text-status-broken font-serif">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-weather-stone border border-dust-beige p-6 h-96 flex flex-col gap-4">
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

  const { overview, trends, districtComparison } = data;

  if (!overview || overview.length === 0) {
    return (
      <div className="bg-weather-stone border border-dust-beige p-6 h-96 flex flex-col items-center justify-center text-slate-basalt/60 font-serif">
        <p>No budget data available for this period.</p>
      </div>
    );
  }

  // Calculate totals for the progress bar
  const totalAllocated = overview.reduce((sum, item) => sum + item.allocated, 0);
  const totalCompleted = overview.reduce((sum, item) => sum + item.completed, 0);
  const progressPercentage = totalAllocated > 0 ? Math.round((totalCompleted / totalAllocated) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'districts', label: 'Districts' },
    { id: 'trends', label: 'Trends' },
    { id: 'sectors', label: 'Sectors' },
    { id: 'municipalities', label: 'Municipalities' }
  ];

  const renderChart = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overview} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
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
                {overview.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hasMismatch ? '#6E4438' : '#9C7A3C'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'districts':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
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
              <Bar dataKey="completed" name="Work Completed" fill="#9C7A3C" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'trends':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFC4A8" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#453F36' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#453F36' }}
                tickFormatter={(value) => `Rs. ${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="allocated" name="Budget Allocated" stroke="#2C3B2A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="completed" name="Work Completed" stroke="#9C7A3C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'sectors':
        return <EmptyState message="Development sector classification data is currently unavailable from official sources." />;
      case 'municipalities':
        return <EmptyState message="Granular municipality-level financial data is not yet published by the Ministry of Finance." />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-weather-stone border border-dust-beige p-6 shadow-sm flex flex-col h-full font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-serif text-pagoda-wood tracking-tight mb-1">Fiscal Budget Allocation</h3>
          <p className="text-sm text-slate-basalt/70">
            Tracking committed funds against certified project completion.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-dust-beige mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-temple-brass text-temple-brass'
                : 'border-transparent text-slate-basalt/60 hover:text-slate-basalt hover:border-dust-beige'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="h-72 w-full text-xs">
        {renderChart()}
      </div>

      <div className="mt-auto pt-6 border-t border-dust-beige/50">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-basalt">Overall Progress</span>
          <span className="font-serif font-bold text-pagoda-wood text-lg">{progressPercentage}%</span>
        </div>
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
