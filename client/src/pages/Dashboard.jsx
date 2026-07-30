import React, { useEffect, useState } from 'react';
import { promisesAPI } from '../api';
import PromiseCard from '../components/PromiseCard';
import { Search, Filter, RefreshCw, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import BudgetVisualiser from '../components/visualizations/BudgetVisualiser';
import ComplaintHeatmap from '../components/visualizations/ComplaintHeatmap';

export default function Dashboard({ user }) {
  const [promises, setPromises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [constituency, setConstituency] = useState('');

  const fetchPromises = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await promisesAPI.getAll({
        page,
        status,
        constituency,
        search,
        limit: 9
      });
      setPromises(data.promises);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
      setError('Failed to load promises. Please verify your backend server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromises();
  }, [page, status, constituency]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPromises();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setConstituency('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Intro Header */}
      <div className="border-b border-dust-beige/60 pb-8 mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-serif text-pagoda-wood mb-4">
          Citizen Watchdog Portal
        </h1>
        <p className="text-slate-basalt/80 font-serif max-w-3xl text-lg leading-relaxed">
          Nirikshan (निरीक्षण) provides tools to track official public promises, evaluate progress, 
          and check representative profiles for transparency across Nepal.
        </p>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <BudgetVisualiser />
        <ComplaintHeatmap />
      </div>

      {/* Control Panel / Filters */}
      <div className="bg-weather-stone/40 border border-dust-beige/50 p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
              Search Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search title, official..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-temple-brass"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-slate-basalt/60 hover:text-temple-brass">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
              Filter by Status
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 text-sm focus:outline-none focus:border-temple-brass"
            >
              <option value="">All Statuses</option>
              <option value="promised">Promised</option>
              <option value="in_progress">In Progress</option>
              <option value="delayed">Delayed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="broken">Broken</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
              Constituency / District
            </label>
            <input
              type="text"
              placeholder="e.g. Kathmandu 4"
              value={constituency}
              onChange={(e) => { setConstituency(e.target.value); setPage(1); }}
              className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 text-sm focus:outline-none focus:border-temple-brass"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 bg-weather-stone border border-dust-beige text-slate-basalt text-sm py-2 px-4 hover:bg-dust-beige/25 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            
            {user && (user.role === 'admin' || user.role === 'moderator') && (
              <Link
                to="/promises/new"
                className="flex-1 bg-pagoda-wood text-himalayan-mist text-sm py-2 px-4 hover:bg-pagoda-wood/90 transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Promise
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-basalt/60">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-temple-brass rounded-full mb-4"></div>
          <p>Loading database records...</p>
        </div>
      ) : error ? (
        <div className="bg-status-broken/10 border border-status-broken/30 text-status-broken p-6 text-center my-10 font-serif">
          {error}
        </div>
      ) : promises.length === 0 ? (
        <div className="text-center py-20 bg-weather-stone/20 border border-dashed border-dust-beige/80">
          <p className="text-slate-basalt/60 font-serif">No verified government promises found matching those filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promises.map((promise) => (
              <PromiseCard key={promise.id} promise={promise} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-dust-beige text-sm disabled:opacity-40 hover:bg-weather-stone/50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-basalt/80">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border border-dust-beige text-sm disabled:opacity-40 hover:bg-weather-stone/50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
