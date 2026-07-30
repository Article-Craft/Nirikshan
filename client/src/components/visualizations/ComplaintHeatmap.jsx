import React, { useState } from 'react';
import { useComplaintData } from '../../hooks/useComplaintData';
import { Filter, Info } from 'lucide-react';

// Heatmap gradient buckets
const getDensityColor = (density) => {
  if (density < 20) return '#F3EFE4'; // Himalayan Mist
  if (density < 40) return '#D4C5A5'; // Mix towards Turmeric Clay
  if (density < 60) return '#8C6A32'; // Turmeric Clay
  if (density < 80) return '#7D5735'; // Mix towards Charred Brick
  return '#6E4438';                   // Charred Brick
};

export default function ComplaintHeatmap() {
  const [filter, setFilter] = useState('all');
  const { data, loading, error } = useComplaintData(filter);

  return (
    <div className="bg-weather-stone border border-dust-beige p-6 shadow-sm flex flex-col font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-serif text-pagoda-wood tracking-tight mb-1">Civic Complaint Heatmap</h3>
          <p className="text-sm text-slate-basalt/70">
            Density of registered grievances across administrative regions.
          </p>
        </div>

        {/* Filter controls/dropdowns: Pagoda Wood text on Weathered Stone background, Temple Brass focus/active border */}
        <div className="relative inline-flex items-center">
          <Filter className="w-4 h-4 text-pagoda-wood absolute left-3 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-[#E4DCC8] text-pagoda-wood border border-dust-beige focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-2 pl-9 pr-8 text-sm font-semibold rounded-sm shadow-inner transition-colors cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="corruption">Corruption</option>
            <option value="services">Public Services</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pagoda-wood">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {error ? (
        <div className="h-64 flex items-center justify-center border border-dashed border-dust-beige text-status-broken font-serif text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="h-64 flex flex-col gap-2">
          {/* Shimmer grid layout */}
          <div className="flex gap-2 h-1/2">
             <div className="flex-1 bg-dust-beige/40 animate-shimmer rounded-sm" />
             <div className="flex-[2] bg-dust-beige/50 animate-shimmer rounded-sm" />
             <div className="flex-1 bg-dust-beige/30 animate-shimmer rounded-sm" />
          </div>
          <div className="flex gap-2 h-1/2">
             <div className="flex-[1.5] bg-dust-beige/50 animate-shimmer rounded-sm" />
             <div className="flex-1 bg-dust-beige/30 animate-shimmer rounded-sm" />
             <div className="flex-[1.5] bg-dust-beige/40 animate-shimmer rounded-sm" />
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center border border-dashed border-dust-beige text-slate-basalt/60 font-serif text-sm">
          No complaint data to display.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.map((item, index) => {
              const bg = getDensityColor(item.density);
              // Calculate text color for contrast (dark text on light bg, light text on dark bg)
              const textColor = item.density > 50 ? '#F3EFE4' : '#2E2418';
              const borderColor = item.density > 50 ? 'transparent' : '#CFC4A8';
              
              // Variable sizing/spanning to make it look somewhat like a treemap or diverse grid
              const spanClass = index === 1 ? 'md:col-span-2 md:row-span-2' : 
                                index === 4 ? 'md:col-span-2' : 'col-span-1';

              return (
                <div 
                  key={item.region} 
                  className={`relative p-4 rounded-sm flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm cursor-default ${spanClass}`}
                  style={{ backgroundColor: bg, color: textColor, border: `1px solid ${borderColor}`, minHeight: '100px' }}
                >
                  <span className="font-serif font-bold text-lg leading-tight z-10">{item.region}</span>
                  <div className="flex justify-between items-end mt-4 z-10">
                    <span className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Index</span>
                    <span className="font-bold text-xl">{item.density}</span>
                  </div>
                  
                  {/* Subtle texture overlay for premium feel */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')]"></div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-basalt font-semibold uppercase tracking-widest border-t border-dust-beige/50 pt-4">
            <div className="flex items-center gap-1.5 mb-3 sm:mb-0 text-slate-basalt/70">
              <Info className="w-3.5 h-3.5" />
              <span>Density Gradient Scale</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">Low (Calm)</span>
              <div className="flex h-3 shadow-inner rounded-sm overflow-hidden border border-dust-beige/50">
                <div className="w-8 h-full" style={{ backgroundColor: '#F3EFE4' }}></div>
                <div className="w-8 h-full" style={{ backgroundColor: '#D4C5A5' }}></div>
                <div className="w-8 h-full" style={{ backgroundColor: '#8C6A32' }}></div>
                <div className="w-8 h-full" style={{ backgroundColor: '#7D5735' }}></div>
                <div className="w-8 h-full" style={{ backgroundColor: '#6E4438' }}></div>
              </div>
              <span className="ml-3">High (Critical)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
