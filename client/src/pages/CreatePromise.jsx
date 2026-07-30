import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { promisesAPI } from '../api';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CreatePromise() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [officialName, setOfficialName] = useState('');
  const [officialRole, setOfficialRole] = useState('');
  const [constituency, setConstituency] = useState('');
  const [datePromised, setDatePromised] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title,
        description,
        officialName,
        officialRole,
        constituency,
        datePromised,
        sourceUrl: sourceUrl || undefined
      };

      await promisesAPI.create(payload);
      setSuccess('Promise successfully registered in watchdog database.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to register promise record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link to="/" className="text-xs font-semibold uppercase tracking-wider text-slate-basalt/60 hover:text-temple-brass">
          &larr; Return to Dashboard
        </Link>
      </div>

      <div className="bg-weather-stone/30 border border-dust-beige/60 p-8 shadow-sm">
        <h2 className="text-3xl font-serif text-pagoda-wood mb-6">Register Official Promise</h2>

        {error && (
          <div className="bg-status-broken/10 border border-status-broken/20 text-status-broken p-3 text-sm flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-status-fulfilled/10 border border-status-fulfilled/20 text-status-fulfilled p-3 text-sm flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-basalt mb-1">Promise Title</label>
            <input
              type="text"
              placeholder="e.g. Kathmandu Ring Road Expansion Phase 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-basalt mb-1">Official Representative Name</label>
              <input
                type="text"
                placeholder="e.g. Gagan Thapa"
                value={officialName}
                onChange={(e) => setOfficialName(e.target.value)}
                className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-basalt mb-1">Official Representative Role</label>
              <input
                type="text"
                placeholder="e.g. Member of Parliament"
                value={officialRole}
                onChange={(e) => setOfficialRole(e.target.value)}
                className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-basalt mb-1">Constituency / District</label>
              <input
                type="text"
                placeholder="e.g. Kathmandu 4"
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-basalt mb-1">Date Promised</label>
              <input
                type="date"
                value={datePromised}
                onChange={(e) => setDatePromised(e.target.value)}
                className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-basalt mb-1">Primary Source URL (Official Statement, News article)</label>
            <input
              type="url"
              placeholder="https://nepalnews.com/story/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-basalt mb-1">Detailed Description of the Promise</label>
            <textarea
              rows="5"
              placeholder="State the terms of the promise, targeted timelines, and specific objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pagoda-wood text-himalayan-mist font-semibold py-2.5 hover:bg-pagoda-wood/90 transition-colors disabled:opacity-40"
          >
            {loading ? 'Registering...' : 'Register Promise'}
          </button>
        </form>
      </div>
    </div>
  );
}
