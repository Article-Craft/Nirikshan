import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../components/Badge';
import RatingStars from '../components/RatingStars';
import StatBlock from '../components/StatBlock';
import DonutChart from '../components/DonutChart';
import { representativesAPI, promisesAPI } from '../api';
import {
  ArrowLeft, MapPin, Building2, Calendar, FileText,
  CheckCircle2, Clock, XCircle, Star, AlertTriangle,
  ChevronRight, User
} from 'lucide-react';

// ─── Skeleton Shimmer ────────────────────────────────────────────────────────
function Shimmer({ className }) {
  return (
    <div
      className={`bg-weathered-stone relative overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-weathered-stone via-himalayan-mist/60 to-weathered-stone" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="bg-weathered-stone border-b border-dust-beige pt-8 pb-12 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Shimmer className="h-4 w-32 mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-12 w-96 max-w-full" />
            <Shimmer className="h-4 w-64" />
            <Shimmer className="h-20 w-full max-w-2xl" />
          </div>
          <Shimmer className="h-48 w-72 shrink-0" />
        </div>
      </div>
    </div>
  );
}

function BodySkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Shimmer className="h-8 w-56" />
          <Shimmer className="h-56 w-full" />
          <Shimmer className="h-6 w-48" />
          {[1, 2, 3].map(i => <Shimmer key={i} className="h-16 w-full" />)}
        </div>
        <div className="space-y-10">
          <Shimmer className="h-32 w-full" />
          <Shimmer className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-himalayan-mist border border-status-broken/30 p-6 flex items-start gap-4">
      <AlertTriangle className="w-5 h-5 text-status-broken shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-pagoda-wood mb-1">Unable to load data</p>
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

// ─── Promise Status helpers ───────────────────────────────────────────────────
const STATUS_META = {
  fulfilled: { icon: CheckCircle2, label: 'Fulfilled', colorClass: 'text-status-fulfilled' },
  delayed:   { icon: Clock,        label: 'Delayed',   colorClass: 'text-status-delayed'   },
  pending:   { icon: Clock,        label: 'Pending',   colorClass: 'text-status-delayed'   },
  broken:    { icon: XCircle,      label: 'Broken',    colorClass: 'text-status-broken'    },
};

function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.pending;
}

// ─── Rating Form ──────────────────────────────────────────────────────────────
function RatingForm({ repId, currentUserRating, onSubmitSuccess }) {
  const [hovered, setHovered]       = useState(0);
  const [selected, setSelected]     = useState(currentUserRating || 0);
  const [comment, setComment]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await representativesAPI.submitRating(repId, { stars: selected, comment });
      setSuccess(true);
      onSubmitSuccess(selected);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm text-status-fulfilled font-semibold py-2">
        <CheckCircle2 className="w-4 h-4" />
        Your rating has been recorded. Thank you.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-widest font-semibold text-slate-basalt mb-2">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(star)}
              className="focus:outline-none"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hovered || selected)
                    ? 'fill-temple-brass text-temple-brass'
                    : 'fill-weathered-stone text-dust-beige'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-semibold text-slate-basalt mb-2" htmlFor="rating-comment">
          Comment <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="rating-comment"
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your assessment..."
          className="w-full bg-himalayan-mist border border-dust-beige text-slate-basalt text-sm px-3 py-2 resize-none focus:outline-none focus:border-temple-brass transition-colors placeholder:text-slate-basalt/40"
        />
      </div>

      {error && (
        <p className="text-xs text-status-broken font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={!selected || submitting}
        className="w-full py-2.5 bg-temple-brass text-himalayan-mist text-sm font-semibold uppercase tracking-wider hover:bg-pagoda-wood transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : 'Submit Rating'}
      </button>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RepresentativeReportCard() {
  const { id } = useParams();

  const [rep,          setRep]          = useState(null);
  const [repLoading,   setRepLoading]   = useState(true);
  const [repError,     setRepError]     = useState(null);

  const [promises,     setPromises]     = useState([]);
  const [promLoading,  setPromLoading]  = useState(true);
  const [promError,    setPromError]    = useState(null);

  // Optimistic aggregate rating displayed in header card
  const [displayRating, setDisplayRating] = useState(null);

  const fetchRep = useCallback(async () => {
    setRepLoading(true);
    setRepError(null);
    try {
      const data = await representativesAPI.getById(id);
      setRep(data);
      setDisplayRating(data.averageRating);
    } catch (err) {
      setRepError(err?.response?.data?.error || 'Could not load representative details.');
    } finally {
      setRepLoading(false);
    }
  }, [id]);

  const fetchPromises = useCallback(async () => {
    setPromLoading(true);
    setPromError(null);
    try {
      const data = await promisesAPI.getAll({ official_id: id });
      setPromises(Array.isArray(data) ? data : data.promises || []);
    } catch (err) {
      setPromError(err?.response?.data?.error || 'Could not load promises for this representative.');
    } finally {
      setPromLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRep();
    fetchPromises();
  }, [fetchRep, fetchPromises]);

  // Optimistic rating update: recalculate displayed average locally
  const handleRatingSubmitted = (stars) => {
    setDisplayRating(prev => {
      const count = rep?.ratingsCount || 0;
      const total = (prev || 0) * count + stars;
      return parseFloat((total / (count + 1)).toFixed(1));
    });
  };

  // ── Derive promise stats from live data ────────────────────────────────────
  const stats = {
    total:     promises.length,
    fulfilled: promises.filter(p => p.status === 'fulfilled').length,
    delayed:   promises.filter(p => p.status === 'delayed' || p.status === 'pending').length,
    broken:    promises.filter(p => p.status === 'broken').length,
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (repLoading) {
    return (
      <div className="min-h-screen bg-himalayan-mist text-slate-basalt pb-16">
        <ProfileSkeleton />
        <BodySkeleton />
      </div>
    );
  }

  // ── Rep-level error ────────────────────────────────────────────────────────
  if (repError) {
    return (
      <div className="min-h-screen bg-himalayan-mist text-slate-basalt">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Link
            to="/directory"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-slate-basalt hover:text-temple-brass transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
          <ErrorBanner message={repError} onRetry={fetchRep} />
        </div>
      </div>
    );
  }

  const constituency = rep.constituency || {};
  const attendance   = rep.attendancePercent != null ? `${rep.attendancePercent}%` : 'N/A';

  return (
    <div className="min-h-screen bg-himalayan-mist text-slate-basalt pb-16">
      {/* ── Hero / Profile Header ─────────────────────────────────────── */}
      <div className="bg-weathered-stone border-b border-dust-beige pt-8 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/directory"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-slate-basalt hover:text-temple-brass transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            {/* Left: identity */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="accent">{rep.position || 'Representative'}</Badge>
                <span className="text-sm font-semibold text-slate-basalt/70 uppercase tracking-wider">
                  {rep.party}
                </span>
              </div>

              <h1 className="text-5xl font-serif text-pagoda-wood mb-4 leading-tight">
                {rep.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-basalt font-medium mb-6">
                {constituency.name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-temple-brass" />
                    {constituency.name}
                    {constituency.province && (
                      <span className="text-slate-basalt/50">— Province {constituency.province}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-temple-brass" />
                  Parliament of Nepal
                </div>
                {rep.contactInfo && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-temple-brass" />
                    {rep.contactInfo}
                  </div>
                )}
              </div>
            </div>

            {/* Right: rating card */}
            <div className="bg-himalayan-mist p-6 border border-dust-beige shadow-sm min-w-[280px] shrink-0">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-basalt mb-4">
                Public Rating
              </h3>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-serif text-pagoda-wood">
                  {displayRating ? displayRating.toFixed(1) : '—'}
                </span>
                <span className="text-sm text-slate-basalt/60 font-medium mb-1.5">/ 5.0</span>
              </div>
              {displayRating != null && (
                <RatingStars rating={Math.round(displayRating)} />
              )}
              <p className="text-xs text-slate-basalt/50 mt-2">
                {rep.ratingsCount || 0} citizen {rep.ratingsCount === 1 ? 'rating' : 'ratings'}
              </p>
              <div className="mt-6 pt-6 border-t border-dust-beige">
                <StatBlock label="Session Attendance" value={attendance} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif text-pagoda-wood mb-8 pb-4 border-b border-dust-beige">
              Performance Report Card
            </h2>

            {/* Promise donut + breakdown */}
            <div className="bg-weathered-stone p-8 border border-dust-beige mb-12">
              {stats.total === 0 && !promLoading ? (
                <p className="text-sm text-slate-basalt/60 text-center py-4">
                  No promises on record for this representative.
                </p>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="shrink-0">
                    <DonutChart
                      fulfilled={stats.fulfilled}
                      delayed={stats.delayed}
                      broken={stats.broken}
                      total={stats.total}
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-status-fulfilled font-semibold text-sm uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Fulfilled
                      </div>
                      <span className="text-3xl font-serif text-pagoda-wood">{stats.fulfilled}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-status-delayed font-semibold text-sm uppercase tracking-wider">
                        <Clock className="w-4 h-4" /> Delayed / Pending
                      </div>
                      <span className="text-3xl font-serif text-pagoda-wood">{stats.delayed}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-status-broken font-semibold text-sm uppercase tracking-wider">
                        <XCircle className="w-4 h-4" /> Broken
                      </div>
                      <span className="text-3xl font-serif text-pagoda-wood">{stats.broken}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Promise timeline */}
            <h3 className="text-xl font-serif text-pagoda-wood mb-6">
              Promises &amp; Initiatives
            </h3>

            {promLoading && (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <Shimmer key={i} className="h-16 w-full" />)}
              </div>
            )}

            {!promLoading && promError && (
              <ErrorBanner message={promError} onRetry={fetchPromises} />
            )}

            {!promLoading && !promError && promises.length === 0 && (
              <p className="text-sm text-slate-basalt/60 border border-dust-beige p-5">
                No promises are linked to this representative yet.
              </p>
            )}

            {!promLoading && !promError && promises.length > 0 && (
              <div className="space-y-3">
                {promises.map(promise => {
                  const meta = statusMeta(promise.status);
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={promise.id}
                      to={`/promises/${promise.id}`}
                      className="bg-himalayan-mist border border-dust-beige p-5 hover:bg-weathered-stone transition-colors group flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <FileText className="w-5 h-5 shrink-0 text-slate-basalt/40 group-hover:text-temple-brass transition-colors" />
                        <div className="min-w-0">
                          <h4 className="text-base font-semibold text-pagoda-wood truncate">{promise.title}</h4>
                          {promise.createdAt && (
                            <span className="text-xs text-slate-basalt/60 font-medium">
                              {new Date(promise.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <Badge variant={promise.status}>{promise.status}</Badge>
                        <ChevronRight className="w-4 h-4 text-slate-basalt/30 group-hover:text-temple-brass transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-10">
            {/* Legislative stats */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-basalt mb-6 pb-2 border-b border-dust-beige">
                Legislative Impact
              </h3>
              <div className="space-y-8">
                <StatBlock
                  label="Bills Sponsored"
                  value={rep.billsSponsored ?? '—'}
                  description="Primary sponsor on national legislation"
                />
              </div>
            </div>

            {/* Rate this representative */}
            <div className="bg-terraced-pine text-himalayan-mist p-6 border border-dust-beige">
              <h3 className="text-lg font-serif mb-2">Rate this Representative</h3>
              <p className="text-sm text-himalayan-mist/70 leading-relaxed mb-2">
                Share your assessment of {rep.name.split(' ').slice(-1)[0]}'s performance as a public servant.
              </p>
              <RatingForm
                repId={id}
                currentUserRating={null}
                onSubmitSuccess={handleRatingSubmitted}
              />
            </div>

            {/* Citizen action */}
            <div className="bg-himalayan-mist p-6 border border-dust-beige">
              <h3 className="text-base font-serif text-pagoda-wood mb-2">Report a Discrepancy</h3>
              <p className="text-sm text-slate-basalt/80 mb-4 leading-relaxed">
                Notice incorrect data on this report card? Submit evidence to the moderation queue.
              </p>
              <Link
                to="/promises/new"
                className="block w-full py-2.5 bg-pagoda-wood text-himalayan-mist text-sm font-semibold uppercase tracking-wider text-center hover:bg-terraced-pine transition-colors"
              >
                Submit Evidence
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
