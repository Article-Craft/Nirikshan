import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { promisesAPI } from '../api';
import { Calendar, User, MapPin, ExternalLink, ShieldCheck, History } from 'lucide-react';
import SubmitUpdateForm from './SubmitUpdateForm';

const statusLabels = {
  promised: { label: 'Promised', bg: 'bg-weather-stone text-pagoda-wood border-dust-beige' },
  in_progress: { label: 'In Progress', bg: 'bg-status-delayed/10 text-status-delayed border-status-delayed/20' },
  delayed: { label: 'Delayed', bg: 'bg-status-delayed/10 text-status-delayed border-status-delayed/30' },
  fulfilled: { label: 'Fulfilled', bg: 'bg-status-fulfilled/10 text-status-fulfilled border-status-fulfilled/30' },
  broken: { label: 'Broken', bg: 'bg-status-broken/10 text-status-broken border-status-broken/30' }
};

export default function PromiseDetail({ user }) {
  const { id } = useParams();
  const [promise, setPromise] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const fetchPromiseData = async () => {
    setLoading(true);
    try {
      const data = await promisesAPI.getById(id);
      setPromise(data);
      const timelineData = await promisesAPI.getTimeline(id);
      setTimeline(timelineData);
    } catch (err) {
      console.error(err);
      setError('Promise not found or API server connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromiseData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-basalt/60">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-temple-brass rounded-full mb-4"></div>
        <p>Retrieving platform data...</p>
      </div>
    );
  }

  if (error || !promise) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-status-broken/10 border border-status-broken/30 text-status-broken p-6 font-serif mb-6">
          {error || 'The requested resource could not be found.'}
        </div>
        <Link to="/" className="text-sm font-semibold text-pagoda-wood hover:text-temple-brass underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentStatusInfo = statusLabels[promise.status] || statusLabels.promised;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link to="/" className="text-xs font-semibold uppercase tracking-wider text-slate-basalt/60 hover:text-temple-brass">
          &larr; Back to Watchdog Feed
        </Link>
      </div>

      {/* Main Core Detail Panel */}
      <div className="bg-weather-stone/30 border border-dust-beige/60 p-8 mb-8 shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <span className={`inline-block text-xs uppercase tracking-wider font-semibold px-3 py-1 border ${currentStatusInfo.bg}`}>
            {currentStatusInfo.label}
          </span>
          {promise.verified && (
            <span className="inline-flex items-center gap-1 text-xs text-status-fulfilled font-semibold bg-status-fulfilled/5 px-2.5 py-1 border border-status-fulfilled/20">
              <ShieldCheck className="w-4 h-4" />
              Verified Official Data
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-pagoda-wood mb-4 leading-tight">
          {promise.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 border-y border-dust-beige/40 py-6 text-sm text-slate-basalt/80">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-temple-brass" />
            <div>
              <p className="text-xs text-slate-basalt/50 uppercase font-semibold">Official</p>
              <p className="font-semibold text-pagoda-wood">{promise.officialName} ({promise.officialRole})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-temple-brass" />
            <div>
              <p className="text-xs text-slate-basalt/50 uppercase font-semibold">Constituency</p>
              <p className="font-semibold text-pagoda-wood">{promise.constituency}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-temple-brass" />
            <div>
              <p className="text-xs text-slate-basalt/50 uppercase font-semibold">Date Promised</p>
              <p className="font-semibold text-pagoda-wood">{promise.datePromised}</p>
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-slate-basalt/90 mb-6 leading-relaxed font-sans">
          <p className="whitespace-pre-wrap">{promise.description}</p>
        </div>

        {promise.sourceUrl && (
          <div className="mt-8 pt-4 border-t border-dust-beige/30">
            <a
              href={promise.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold text-temple-brass hover:text-pagoda-wood transition-colors gap-1"
            >
              View Primary Source Citation
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Stepper Timeline & Evidence Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline (Stepper UI) */}
        <div className="lg:col-span-2 bg-weather-stone/20 border border-dust-beige/50 p-6">
          <h2 className="text-2xl font-serif text-pagoda-wood mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-temple-brass" />
            Status Roadmap & Updates
          </h2>

          {timeline.length === 0 ? (
            <div className="py-10 text-center text-slate-basalt/60 text-sm">
              No status transitions have been logged yet.
            </div>
          ) : (
            <div className="relative border-l-2 border-dust-beige ml-4 pl-6 space-y-8">
              {timeline.map((step) => {
                const stepStatus = statusLabels[step.newStatus] || statusLabels.promised;
                return (
                  <div key={step.id} className="relative">
                    {/* Circle Node */}
                    <span className="absolute -left-[31px] top-1.5 bg-himalayan-mist border-2 border-dust-beige rounded-full w-4 h-4 flex items-center justify-center">
                      <span className="bg-temple-brass rounded-full w-1.5 h-1.5"></span>
                    </span>

                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-xs uppercase tracking-wider font-semibold px-2 py-0.5 border ${stepStatus.bg}`}>
                        {stepStatus.label}
                      </span>
                      <span className="text-xs text-slate-basalt/60">
                        {new Date(step.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-basalt/70 mb-1">
                      Proposed by: <span className="font-semibold">{step.changer?.name || 'Anonymous User'}</span>
                    </p>

                    {step.evidence && (
                      <div className="mt-3 bg-weather-stone/40 border border-dust-beige/50 p-4">
                        <p className="text-sm text-slate-basalt/90 mb-3">{step.evidence.description}</p>
                        <a
                          href={step.evidence.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-semibold text-pagoda-wood hover:text-temple-brass gap-1"
                        >
                          View Uploaded Proof Document &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Panel / Submission */}
        <div className="bg-weather-stone/40 border border-dust-beige/50 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif text-pagoda-wood mb-3">Provide Real-World Proof</h3>
            <p className="text-sm text-slate-basalt/80 mb-6 leading-relaxed">
              If you have local project data, site photos, or budget audit files showing a different status, 
              please submit a status update request with evidence.
            </p>
          </div>

          {user ? (
            <div>
              <button
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="w-full bg-pagoda-wood text-himalayan-mist text-sm font-semibold py-3 hover:bg-pagoda-wood/90 transition-colors"
              >
                {showUpdateForm ? 'Cancel Proposal' : 'Propose Status Update'}
              </button>
            </div>
          ) : (
            <div className="bg-weather-stone border border-dust-beige p-4 text-center text-xs text-slate-basalt/70">
              Please <Link to="/login" className="underline font-semibold text-pagoda-wood">Login</Link> or{' '}
              <button
                onClick={() => window.location.reload()}
                className="underline font-semibold text-pagoda-wood"
              >
                guest authenticate
              </button>{' '}
              to submit updates.
            </div>
          )}
        </div>
      </div>

      {showUpdateForm && user && (
        <div className="mt-10 pt-8 border-t border-dust-beige/60">
          <SubmitUpdateForm
            promiseId={promise.id}
            onSuccess={() => {
              setShowUpdateForm(false);
              fetchPromiseData();
            }}
          />
        </div>
      )}
    </div>
  );
}
