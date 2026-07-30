import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { representativesAPI, constituenciesAPI } from '../api';
import RatingStars from '../components/RatingStars';
import { Search, AlertTriangle, ChevronRight, Users, Filter } from 'lucide-react';

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
function Shimmer({ className }) {
  return (
    <div className={`bg-weathered-stone relative overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-weathered-stone via-himalayan-mist/60 to-weathered-stone" />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-weathered-stone border border-dust-beige p-6 space-y-4">
          <Shimmer className="h-5 w-48" />
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-4 w-24" />
          <div className="pt-4 border-t border-dust-beige">
            <Shimmer className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-himalayan-mist border border-status-broken/30 p-6 flex items-start gap-4">
      <AlertTriangle className="w-5 h-5 text-status-broken shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-pagoda-wood mb-1">Failed to load representatives</p>
        <p className="text-sm text-slate-basalt">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs uppercase tracking-wider font-semibold text-temple-brass hover:text-pagoda-wood transition-colors shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Representative Card ──────────────────────────────────────────────────────
function RepCard({ rep }) {
  const constituency = rep.constituency || {};

  return (
    <Link
      to={`/representative/${rep.id}`}
      className="bg-himalayan-mist border border-dust-beige p-6 hover:bg-weathered-stone hover:border-temple-brass/40 transition-all group flex flex-col gap-3"
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-serif text-pagoda-wood group-hover:text-temple-brass transition-colors leading-snug">
          {rep.name}
        </h2>
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-basalt/60 mt-0.5">
          {rep.party}
        </p>
      </div>

      {/* Meta */}
      <div className="space-y-1 text-sm text-slate-basalt">
        {rep.position && (
          <p className="font-medium">{rep.position}</p>
        )}
        {constituency.name && (
          <p>
            <span className="text-slate-basalt/50">Constituency: </span>
            {constituency.name}
            {constituency.province && (
              <span className="text-slate-basalt/50"> — P{constituency.province}</span>
            )}
          </p>
        )}
        {rep.attendancePercent != null && (
          <p>
            <span className="text-slate-basalt/50">Attendance: </span>
            {rep.attendancePercent}%
          </p>
        )}
      </div>

      {/* Rating footer */}
      <div className="mt-auto pt-4 border-t border-dust-beige flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <RatingStars rating={Math.round(rep.averageRating || 0)} />
          <span className="text-xs text-slate-basalt/50">
            {rep.averageRating ? rep.averageRating.toFixed(1) : 'No ratings'} · {rep.ratingsCount || 0} review{rep.ratingsCount !== 1 ? 's' : ''}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-basalt/30 group-hover:text-temple-brass transition-colors" />
      </div>
    </Link>
  );
}

// ─── Province filter options ──────────────────────────────────────────────────
const PROVINCES = ['All', '1', '2', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

// ─── Main Directory Page ──────────────────────────────────────────────────────
export default function RepresentativeDirectory() {
  const [reps,         setReps]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const [constituencies, setConstituencies] = useState([]);

  const [searchQuery,   setSearchQuery]   = useState('');
  const [selectedParty, setSelectedParty] = useState('All');
  const [selectedProv,  setSelectedProv]  = useState('All');
  const [selectedCons,  setSelectedCons]  = useState('All');

  const fetchReps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await representativesAPI.getAll();
      setReps(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not load the representative directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConstituencies = useCallback(async () => {
    try {
      const data = await constituenciesAPI.getAll();
      setConstituencies(Array.isArray(data) ? data : []);
    } catch {
      // non-critical — filters degrade gracefully
    }
  }, []);

  useEffect(() => {
    fetchReps();
    fetchConstituencies();
  }, [fetchReps, fetchConstituencies]);

  // Derive unique parties from loaded data
  const parties = useMemo(() => {
    const set = new Set(reps.map(r => r.party).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [reps]);

  // Client-side filter chain
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reps.filter(rep => {
      if (q && !rep.name.toLowerCase().includes(q) && !(rep.party || '').toLowerCase().includes(q)) return false;
      if (selectedParty !== 'All' && rep.party !== selectedParty) return false;
      if (selectedProv !== 'All' && String(rep.constituency?.province) !== selectedProv) return false;
      if (selectedCons !== 'All' && String(rep.constituency?.id) !== selectedCons) return false;
      return true;
    });
  }, [reps, searchQuery, selectedParty, selectedProv, selectedCons]);

  return (
    <div className="min-h-screen bg-himalayan-mist text-slate-basalt pb-20">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="bg-weathered-stone border-b border-dust-beige py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-6">
            <Users className="w-8 h-8 text-temple-brass shrink-0 mt-1" />
            <div>
              <h1 className="text-4xl font-serif text-pagoda-wood">Representative Directory</h1>
              <p className="text-slate-basalt/70 mt-2 text-sm leading-relaxed max-w-xl">
                Browse elected representatives of Nepal. Click any profile to view their full Report Card — promises, attendance, citizen ratings, and legislative record.
              </p>
            </div>
          </div>

          {/* ── Filter bar ──────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 mt-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-basalt/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or party…"
                className="w-full pl-9 pr-3 py-2 bg-himalayan-mist border border-dust-beige text-sm text-slate-basalt placeholder:text-slate-basalt/40 focus:outline-none focus:border-temple-brass transition-colors"
                aria-label="Search representatives"
              />
            </div>

            {/* Party filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-basalt/40 pointer-events-none" />
              <select
                value={selectedParty}
                onChange={e => setSelectedParty(e.target.value)}
                className="pl-9 pr-8 py-2 bg-himalayan-mist border border-dust-beige text-sm text-slate-basalt focus:outline-none focus:border-temple-brass transition-colors appearance-none cursor-pointer"
                aria-label="Filter by party"
              >
                {parties.map(p => <option key={p} value={p}>{p === 'All' ? 'All Parties' : p}</option>)}
              </select>
            </div>

            {/* Province filter */}
            <select
              value={selectedProv}
              onChange={e => { setSelectedProv(e.target.value); setSelectedCons('All'); }}
              className="px-3 py-2 bg-himalayan-mist border border-dust-beige text-sm text-slate-basalt focus:outline-none focus:border-temple-brass transition-colors appearance-none cursor-pointer"
              aria-label="Filter by province"
            >
              {PROVINCES.map(p => <option key={p} value={p}>{p === 'All' ? 'All Provinces' : `Province ${p}`}</option>)}
            </select>

            {/* Constituency filter (populated from API) */}
            {constituencies.length > 0 && (
              <select
                value={selectedCons}
                onChange={e => setSelectedCons(e.target.value)}
                className="px-3 py-2 bg-himalayan-mist border border-dust-beige text-sm text-slate-basalt focus:outline-none focus:border-temple-brass transition-colors appearance-none cursor-pointer max-w-[200px]"
                aria-label="Filter by constituency"
              >
                <option value="All">All Constituencies</option>
                {constituencies
                  .filter(c => selectedProv === 'All' || String(c.province) === selectedProv)
                  .map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)
                }
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && <GridSkeleton />}

        {!loading && error && <ErrorBanner message={error} onRetry={fetchReps} />}

        {!loading && !error && (
          <>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-dust-beige">
              <p className="text-sm font-semibold text-slate-basalt/60 uppercase tracking-wider">
                {filtered.length} of {reps.length} representative{reps.length !== 1 ? 's' : ''}
              </p>
              {(searchQuery || selectedParty !== 'All' || selectedProv !== 'All' || selectedCons !== 'All') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedParty('All'); setSelectedProv('All'); setSelectedCons('All'); }}
                  className="text-xs uppercase tracking-wider font-semibold text-temple-brass hover:text-pagoda-wood transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-weathered-stone border border-dust-beige p-12 text-center">
                <p className="text-lg font-serif text-pagoda-wood mb-2">No representatives found</p>
                <p className="text-sm text-slate-basalt/60">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(rep => <RepCard key={rep.id} rep={rep} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
