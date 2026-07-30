import React, { useState } from 'react';
import { promisesAPI } from '../api';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function SubmitUpdateForm({ promiseId, onSuccess }) {
  const [newStatus, setNewStatus] = useState('in_progress');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        newStatus,
        fileUrl,
        description,
      };

      if (lat && lng) {
        payload.lat = parseFloat(lat);
        payload.lng = parseFloat(lng);
      }

      const res = await promisesAPI.submitStatusUpdate(promiseId, payload);
      setSuccessMsg(res.message);
      
      // Clear inputs
      setFileUrl('');
      setDescription('');
      setLat('');
      setLng('');

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit status update request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-weather-stone/40 border border-dust-beige/60 p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-serif text-pagoda-wood mb-4">Propose Progress Verification Update</h3>
      
      {error && (
        <div className="bg-status-broken/10 border border-status-broken/20 text-status-broken p-3 text-sm flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-status-fulfilled/10 border border-status-fulfilled/20 text-status-fulfilled p-3 text-sm flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-basalt mb-1">Proposed Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
            required
          >
            <option value="promised">Promised</option>
            <option value="in_progress">In Progress</option>
            <option value="delayed">Delayed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="broken">Broken</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-basalt mb-1">Evidence File URL (e.g. Photo, Budget Audit link)</label>
          <input
            type="url"
            placeholder="https://example.com/uploads/photo.jpg"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-basalt mb-1">Latitude (Optional)</label>
            <input
              type="number"
              step="any"
              placeholder="27.7172"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-basalt mb-1">Longitude (Optional)</label>
            <input
              type="number"
              step="any"
              placeholder="85.3240"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2 px-3 focus:outline-none focus:border-temple-brass"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-basalt mb-1">Detailed Description of Site Progress</label>
          <textarea
            rows="4"
            placeholder="Describe what you observed. Reference local landmarks, current stage of build, or official budgets..."
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
          {loading ? 'Submitting to queue...' : 'Submit Verification Proposal'}
        </button>
      </form>
    </div>
  );
}
