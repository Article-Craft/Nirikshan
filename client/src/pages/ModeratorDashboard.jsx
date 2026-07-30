import React, { useEffect, useState } from 'react';
import { moderationAPI } from '../api';
import { Check, X, ShieldAlert, FileText, MapPin, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ModeratorDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await moderationAPI.getQueue();
      setQueue(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch moderation queue. Check authority headers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await moderationAPI.approve(id);
      } else {
        await moderationAPI.reject(id);
      }
      // Remove from state list
      setQueue(queue.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert(`Action failed: ${err.response?.data?.error || 'Server error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-basalt/60">
        <Loader className="animate-spin inline-block w-8 h-8 text-temple-brass mb-4" />
        <p>Loading moderation queues...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-dust-beige/60 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-serif text-pagoda-wood flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-temple-brass" />
            Verification Queue
          </h1>
          <p className="text-sm text-slate-basalt/70 font-serif">
            Review and verify updates submitted by the civic community.
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-status-broken/10 border border-status-broken/30 text-status-broken p-6 font-serif">
          {error}
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-20 bg-weather-stone/20 border border-dashed border-dust-beige/80">
          <p className="text-slate-basalt/60 font-serif">The verification queue is currently empty.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map((item) => (
            <div key={item.id} className="bg-weather-stone/30 border border-dust-beige/60 p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs text-slate-basalt/50 uppercase font-semibold">Project / Promise</span>
                    <h3 className="text-lg font-serif font-bold text-pagoda-wood">
                      <Link to={`/promises/${item.promise?.id}`} className="hover:text-temple-brass underline">
                        {item.promise?.title}
                      </Link>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-basalt/50 uppercase font-semibold block">Proposed Status</span>
                    <span className="inline-block text-xs uppercase font-semibold px-2 py-0.5 border border-temple-brass text-temple-brass bg-temple-brass/5">
                      {item.newStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-basalt/80 border-t border-b border-dust-beige/35 py-3">
                  <div>
                    <span className="font-semibold text-pagoda-wood block">Submitted By</span>
                    {item.changer?.name || 'Anonymous Citizen'}
                  </div>
                  {item.evidence?.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-temple-brass" />
                      <div>
                        <span className="font-semibold text-pagoda-wood block">Coordinates</span>
                        {item.evidence.location.coordinates[1].toFixed(4)}, {item.evidence.location.coordinates[0].toFixed(4)}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-basalt/50 uppercase font-semibold block">Provided Proof Details</span>
                  <p className="text-sm text-slate-basalt/95 leading-relaxed">{item.evidence?.description}</p>
                </div>

                {item.evidence?.file_url && (
                  <div className="pt-2">
                    <a
                      href={item.evidence.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-temple-brass hover:underline gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Uploaded Document / Image Link &rarr;
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col justify-end gap-3 md:border-l md:border-dust-beige/30 md:pl-6 min-w-[140px]">
                <button
                  disabled={actionLoading !== null}
                  onClick={() => handleAction(item.id, 'approve')}
                  className="flex-1 md:flex-initial bg-status-fulfilled text-himalayan-mist text-xs font-semibold py-2.5 px-4 flex items-center justify-center gap-1.5 hover:bg-status-fulfilled/90 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  disabled={actionLoading !== null}
                  onClick={() => handleAction(item.id, 'reject')}
                  className="flex-1 md:flex-initial bg-status-broken text-himalayan-mist text-xs font-semibold py-2.5 px-4 flex items-center justify-center gap-1.5 hover:bg-status-broken/90 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
