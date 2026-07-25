import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { representativesAPI } from '../api';
import RatingStars from '../components/RatingStars';
import { Search, AlertTriangle, ChevronRight, Users, Filter, Landmark } from 'lucide-react';

function Shimmer({ className }) {
  return (
    <div className={`bg-slate-200 relative overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-slate-200 via-white/60 to-slate-200" />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 p-6 space-y-4 rounded">
          <Shimmer className="h-5 w-48" />
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-4 w-40" />
          <div className="pt-4 border-t border-slate-200">
            <Shimmer className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-white border border-red-200 p-6 flex items-start gap-4 rounded text-left">
      <AlertTriangle className="w-5 h-5 text-nepal-red shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-pagoda-wood mb-1">Failed to load representatives</p>
        <p className="text-sm text-slate-basalt">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs uppercase tracking-wider font-bold text-nepal-red hover:text-pagoda-wood transition-colors shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function RepCard({ rep }) {
  const constituency = rep.constituency || {};

  return (
    <Link
      to={`/representative/${rep.id}`}
      className="bg-white border border-slate-200 p-6 hover:border-nepal-red transition-all group flex flex-col gap-3 rounded shadow-sm hover:shadow"
    >
      <div>
        <h2 className="text-base font-bold text-pagoda-wood group-hover:text-nepal-red transition-colors leading-snug">
          {rep.name}
        </h2>
        <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-0.5">
          {rep.party}
        </p>
      </div>

      <div className="space-y-1.5 text-xs text-slate-600 font-medium">
        {rep.position && (
          <p className="font-semibold text-slate-700">{rep.position}</p>
        )}
        {constituency.name && (
          <p className="flex items-center gap-1">
            <span className="text-slate-400 font-bold uppercase text-[9px]">Const:</span>
            {constituency.name}
          </p>
        )}
        {rep.attendancePercent != null && (
          <p className="flex items-center gap-1">
            <span className="text-slate-400 font-bold uppercase text-[9px]">Attendance:</span>
            {rep.attendancePercent}%
          </p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <RatingStars rating={Math.round(rep.averageRating || rep.ratingValue || 4)} />
          <span className="text-[9px] text-slate-400 font-bold uppercase">
            Rating: {(rep.averageRating || rep.ratingValue || 4.0)}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-nepal-red transition-colors" />
      </div>
    </Link>
  );
}

export default function RepresentativeDirectory() {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await representativesAPI.getAll();
      setReps(Array.isArray(data) ? data : data.representatives || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch the representatives registry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uniqueParties = useMemo(() => {
    const parties = reps.map(r => r.party).filter(Boolean);
    return Array.from(new Set(parties)).sort();
  }, [reps]);

  const uniqueProvinces = useMemo(() => {
    const provinces = reps.map(r => r.constituency?.province).filter(Boolean);
    return Array.from(new Set(provinces)).sort();
  }, [reps]);

  const filteredReps = useMemo(() => {
    return reps.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.constituency?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchesParty = !partyFilter || r.party === partyFilter;
      const matchesProvince = !provinceFilter || r.constituency?.province === provinceFilter;
      return matchesSearch && matchesParty && matchesProvince;
    });
  }, [reps, search, partyFilter, provinceFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-pagoda-wood font-extrabold tracking-tight">
            Elected Representatives Directory
          </h1>
          <p className="text-sm text-slate-basalt/70 mt-1 leading-relaxed">
            Verify official report cards, attendance rates, voting logs, and promise audits.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase rounded">
          <Users className="w-4 h-4 text-nepal-red" /> {filteredReps.length} Representatives Mapped
        </div>
      </div>

      {error ? (
        <ErrorBanner message={error} onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 border border-slate-200 rounded shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-pagoda-wood border-b border-slate-100 pb-2.5">
                <Filter className="w-4 h-4 text-nepal-red" />
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Search &amp; Filters</h3>
              </div>

              {/* Search input */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider">Search Keyword</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name or constituency..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-3 pr-10 text-xs font-semibold rounded focus:outline-none focus:ring-1 focus:ring-nepal-red focus:border-nepal-red"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Party selection */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider">Filter by Party</label>
                <select
                  value={partyFilter}
                  onChange={e => setPartyFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs font-semibold rounded focus:outline-none focus:ring-1 focus:ring-nepal-red focus:border-nepal-red"
                >
                  <option value="">All Political Parties</option>
                  {uniqueParties.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Province selection */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider">Filter by Province</label>
                <select
                  value={provinceFilter}
                  onChange={e => setProvinceFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs font-semibold rounded focus:outline-none focus:ring-1 focus:ring-nepal-red focus:border-nepal-red"
                >
                  <option value="">All Provinces</option>
                  {uniqueProvinces.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setSearch('');
                  setPartyFilter('');
                  setProvinceFilter('');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-extrabold uppercase rounded transition-colors text-slate-700"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Grid display */}
          <div className="lg:col-span-3">
            {loading ? (
              <GridSkeleton />
            ) : filteredReps.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 rounded text-center text-xs text-slate-400 font-semibold italic">
                No matching representatives found. Please adjust search parameters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReps.map(rep => (
                  <RepCard key={rep.id} rep={rep} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
