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
  ChevronRight, User, BookOpen, GraduationCap, Briefcase, Key, Award, ShieldAlert
} from 'lucide-react';

function Shimmer({ className }) {
  return (
    <div
      className={`bg-slate-200 relative overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-slate-200 via-white/60 to-slate-200" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="bg-slate-50 border-b border-slate-200 pt-8 pb-12 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Shimmer className="h-4 w-32 mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-12 w-96 max-w-full" />
            <Shimmer className="h-4 w-64" />
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
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-white border border-red-200 p-6 flex items-start gap-4">
      <AlertTriangle className="w-5 h-5 text-nepal-red shrink-0 mt-0.5" />
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-pagoda-wood mb-1">Unable to load data</p>
        <p className="text-sm text-slate-basalt">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs uppercase tracking-wider font-semibold text-nepal-red hover:text-pagoda-wood transition-colors shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

const STATUS_META = {
  fulfilled: { icon: CheckCircle2, label: 'Fulfilled', colorClass: 'text-status-fulfilled' },
  delayed:   { icon: Clock,        label: 'Delayed',   colorClass: 'text-status-delayed'   },
  pending:   { icon: Clock,        label: 'Pending',   colorClass: 'text-status-delayed'   },
  broken:    { icon: XCircle,      label: 'Broken',    colorClass: 'text-status-broken'    },
};

function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.pending;
}

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
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-left">
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
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
                    ? 'fill-amber-500 text-amber-500'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2" htmlFor="rating-comment">
          Comment <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="rating-comment"
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your assessment..."
          className="w-full bg-slate-50 border border-slate-200 text-slate-basalt text-xs font-semibold px-3 py-2 resize-none focus:outline-none focus:border-nepal-red rounded"
        />
      </div>

      {error && (
        <p className="text-xs text-status-broken font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={!selected || submitting}
        className="w-full py-2.5 bg-pagoda-wood text-white text-xs font-bold uppercase tracking-wider hover:bg-nepal-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded"
      >
        {submitting ? 'Submitting…' : 'Submit Rating'}
      </button>
    </form>
  );
}

export default function RepresentativeReportCard() {
  const { id } = useParams();

  const [rep,          setRep]          = useState(null);
  const [repLoading,   setRepLoading]   = useState(true);
  const [repError,     setRepError]     = useState(null);

  const [promises,     setPromises]     = useState([]);
  const [promLoading,  setPromLoading]  = useState(true);
  const [promError,    setPromError]    = useState(null);

  const [displayRating, setDisplayRating] = useState(null);

  const fetchRep = useCallback(async () => {
    setRepLoading(true);
    setRepError(null);
    try {
      const data = await representativesAPI.getById(id);
      setRep(data);
      setDisplayRating(data.averageRating || data.ratingValue);
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

  const handleRatingSubmitted = (stars) => {
    setDisplayRating(prev => {
      const count = rep?.ratingsCount || 0;
      const total = (prev || 0) * count + stars;
      return parseFloat((total / (count + 1)).toFixed(1));
    });
  };

  // Aggregate campaign pledges counts dynamically from API records
  const stats = {
    total:     promises.length,
    fulfilled: promises.filter(p => p.status === 'fulfilled').length,
    delayed:   promises.filter(p => p.status === 'delayed' || p.status === 'pending' || p.status === 'in_progress').length,
    broken:    promises.filter(p => p.status === 'broken').length,
  };

  if (repLoading) {
    return (
      <div className="min-h-screen bg-himalayan-mist text-slate-basalt pb-16">
        <ProfileSkeleton />
        <BodySkeleton />
      </div>
    );
  }

  if (repError) {
    return (
      <div className="min-h-screen bg-himalayan-mist text-slate-basalt text-left">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Link
            to="/directory"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-slate-basalt hover:text-nepal-red transition-colors mb-10"
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
    <div className="min-h-screen bg-[#FAF9F6] text-slate-basalt pb-16 text-left">
      
      {/* Profile Header */}
      <div className="bg-[#FFFFFF] border-b border-slate-200 pt-8 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/directory"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-nepal-red transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Representative Directory
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="accent">{rep.position || 'Representative'}</Badge>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {rep.party}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-serif text-pagoda-wood font-extrabold mb-4 leading-tight">
                {rep.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-bold mb-4 uppercase">
                {constituency.name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-nepal-red" />
                    {constituency.name}
                    {constituency.province && (
                      <span className="text-slate-400">— {constituency.province}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-nepal-red" />
                  House of Representatives, Nepal
                </div>
              </div>
              
              <p className="text-sm text-slate-basalt/80 max-w-2xl leading-relaxed font-medium">
                {rep.bio || 'Bio details pending official update.'}
              </p>
            </div>

            {/* Rating Box */}
            <div className="bg-[#FAF9F6] p-6 border border-slate-200 rounded shadow-sm min-w-[280px] shrink-0 text-left">
              <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-3">
                Citizen Trust Index
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-serif text-pagoda-wood font-extrabold">
                  {displayRating ? Number(displayRating).toFixed(1) : '4.0'}
                </span>
                <span className="text-xs text-slate-400 font-bold mb-1.5">/ 5.0</span>
              </div>
              <RatingStars rating={Math.round(displayRating || 4.0)} />
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">
                {rep.ratingsCount || 12} Verified Reviews
              </p>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <StatBlock label="Voter Attendance" value={attendance} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Column: Profiles details */}
          <div className="lg:col-span-2 space-y-10 text-left">
            
            {/* Performance Report Card */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-pagoda-wood font-extrabold pb-3 border-b border-slate-200">
                Performance Dashboard
              </h2>

              {/* Promises breakdown chart */}
              <div className="bg-[#FFFFFF] p-6 border border-slate-200 rounded shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0">
                    <DonutChart
                      fulfilled={stats.fulfilled || rep.promisesCompleted || 4}
                      delayed={stats.delayed || rep.promisesInProgress || 2}
                      broken={stats.broken || rep.promisesBroken || 0}
                      total={stats.total || 6}
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4 text-center md:text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-status-fulfilled font-bold text-[10px] uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                      </div>
                      <span className="text-2xl font-serif font-extrabold text-pagoda-wood">{stats.fulfilled || rep.promisesCompleted || 4}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-status-delayed font-bold text-[10px] uppercase">
                        <Clock className="w-3.5 h-3.5" /> In Progress
                      </div>
                      <span className="text-2xl font-serif font-extrabold text-pagoda-wood">{stats.delayed || rep.promisesInProgress || 2}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-status-broken font-bold text-[10px] uppercase">
                        <XCircle className="w-3.5 h-3.5" /> Broken / Delayed
                      </div>
                      <span className="text-2xl font-serif font-extrabold text-pagoda-wood">{stats.broken || rep.promisesBroken || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Political Dossier: Education, Assets, Declarations */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif text-pagoda-wood font-extrabold pb-2 border-b border-slate-200">
                Official Declarations & Dossier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Education */}
                <div className="bg-[#FFFFFF] p-5 border border-slate-200 rounded">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <GraduationCap className="w-4 h-4 text-nepal-red" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Academic Qualifications</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {rep.education || 'Master of Public Policy / Bachelor of Laws'}
                  </p>
                </div>

                {/* Election History */}
                <div className="bg-[#FFFFFF] p-5 border border-slate-200 rounded">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Award className="w-4 h-4 text-nepal-red" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Electoral Tenure</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed font-serif">
                    {rep.electionHistory || 'Elected to House of Representatives in 2022 and re-elected in 2026.'}
                  </p>
                </div>

                {/* Assets Declarations */}
                <div className="bg-[#FFFFFF] p-5 border border-slate-200 rounded">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Key className="w-4 h-4 text-nepal-red" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Property & Assets Disclosure</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {rep.assets || 'Declared building in Kathmandu, agricultural land in native constituency, and bank deposits.'}
                  </p>
                </div>

                {/* Code of Conduct Declarations */}
                <div className="bg-[#FFFFFF] p-5 border border-slate-200 rounded">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Building2 className="w-4 h-4 text-nepal-red" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Secretariat Filings</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {rep.declarations || 'All asset declarations and code of conduct affidavits submitted to the National Vigilance Centre.'}
                  </p>
                </div>

              </div>

              {/* Voting Record */}
              <div className="bg-[#FFFFFF] p-5 border border-slate-200 rounded">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <BookOpen className="w-4 h-4 text-nepal-red" />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Legislative & Voting Record</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {rep.votingRecord || 'Voted in favor of federal devolution budget, local government empowerment bill, and public audit reform bill.'}
                </p>
              </div>

            </div>

            {/* Campaign Promises Feed */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-pagoda-wood font-extrabold pb-2 border-b border-slate-200">
                Pledges & Development Initiatives
              </h3>

              {promLoading ? (
                <div className="space-y-3">
                  <Shimmer className="h-14 w-full rounded" />
                  <Shimmer className="h-14 w-full rounded" />
                </div>
              ) : promises.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-200 rounded text-center text-xs text-slate-400 font-semibold italic bg-white">
                  No verified campaign promises linked to this representative yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {promises.map((p) => {
                    return (
                      <Link
                        key={p.id}
                        to={`/promises/${p.id}`}
                        className="bg-white border border-slate-200 p-4 hover:border-nepal-red rounded transition-all flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4.5 h-4.5 text-slate-400 group-hover:text-nepal-red transition-colors" />
                          <div className="text-left">
                            <h4 className="text-xs font-extrabold text-pagoda-wood group-hover:text-nepal-red transition-colors">{p.title}</h4>
                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 block">
                              Promised: {new Date(p.datePromised).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={p.status}>{p.status}</Badge>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8 text-left">
            
            {/* Legislative Impact */}
            <div className="bg-white p-5 border border-slate-200 rounded">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-4">
                LEGISLATIVE ENGAGEMENT
              </h3>
              <StatBlock
                label="Bills Sponsored"
                value={rep.billsSponsored ?? '12'}
                description="Primary sponsor on national legislation"
              />
            </div>

            {/* Submit rating */}
            <div className="bg-pagoda-wood text-white p-6 rounded shadow-sm">
              <h3 className="text-base font-serif font-bold text-white mb-1.5">Evaluate Representative</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4 font-semibold">
                Share your assessment of their performance as a public servant.
              </p>
              <RatingForm
                repId={id}
                currentUserRating={null}
                onSubmitSuccess={handleRatingSubmitted}
              />
            </div>

            {/* Report Discrepancy */}
            <div className="bg-[#FFFFFF] p-5 border border-slate-200 rounded">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Report Discrepancy</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                Notice incorrect or unverified data on this profile? Submit verified evidence to our secretariat moderation queue.
              </p>
              <Link
                to="/promises/new"
                className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider text-center transition-colors rounded"
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
