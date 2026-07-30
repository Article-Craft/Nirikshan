import React, { useState, useCallback } from 'react';
import { useComplaintData } from '../../hooks/useComplaintData';
import { complaintsAPI } from '../../api';
import {
  Filter,
  Info,
  MessageSquarePlus,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

// ─── Gradient helpers ─────────────────────────────────────────────────────────
// Custom gradient: himalayan-mist → turmeric-clay #8C6A32 → charred-brick #6E4438
const getDensityColor = (density) => {
  if (density === 0) return '#F3EFE4';   // Himalayan Mist – no complaints
  if (density < 2)  return '#E6DFD0';   // Near-Himalayan Mist
  if (density < 4)  return '#D4C5A5';   // Mid-mix towards Turmeric Clay
  if (density < 6)  return '#8C6A32';   // Turmeric Clay
  if (density < 8)  return '#7D5735';   // Mix towards Charred Brick
  return '#6E4438';                     // Charred Brick – highest density
};

const SERVICE_TYPES = ['all', 'infrastructure', 'corruption', 'services', 'health', 'education', 'other'];
const STATUSES = ['verified', 'pending', 'all'];

// ─── Complaint submission form ─────────────────────────────────────────────────
function SubmitComplaintModal({ onClose }) {
  const [form, setForm] = useState({
    serviceType: 'infrastructure',
    description: '',
    ward: '',
    locationLat: '',
    locationLng: '',
    isAnonymous: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        serviceType: form.serviceType,
        description: form.description,
        ward: form.ward || undefined,
        isAnonymous: form.isAnonymous,
      };
      if (form.locationLat && form.locationLng) {
        payload.locationLat = parseFloat(form.locationLat);
        payload.locationLng = parseFloat(form.locationLng);
      }
      await complaintsAPI.create(payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(46,36,24,0.65)' }}>
      <div className="bg-himalayan-mist border border-dust-beige w-full max-w-lg shadow-2xl relative rounded-sm overflow-hidden">
        {/* Decorative inner border lines */}
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-dust-beige/40 pointer-events-none" />
        <div className="absolute top-1 left-1 right-1 bottom-1 border border-dashed border-dust-beige/25 pointer-events-none" />

        {/* Header */}
        <div className="bg-pagoda-wood text-himalayan-mist px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-temple-brass" />
            <h3 className="text-base font-serif font-bold tracking-tight">Report a Civic Grievance</h3>
          </div>
          <button onClick={onClose} className="hover:text-temple-brass transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          /* ── Success / Pending Verification state ── */
          <div className="px-6 py-8 flex flex-col items-center text-center relative z-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-status-delayed/10 border border-status-delayed/30 flex items-center justify-center">
              <Clock className="w-8 h-8 text-status-delayed animate-pulse" />
            </div>
            <h4 className="text-xl font-serif text-pagoda-wood font-bold">Complaint Received</h4>
            <div className="bg-weather-stone border border-dust-beige/70 p-4 text-sm font-serif text-slate-basalt leading-relaxed text-left">
              <p className="font-semibold text-status-delayed flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4" /> Pending Verification
              </p>
              <p>
                Your complaint has been submitted and is now in the moderation queue.
                A Nirikshan moderator will review it before it appears publicly on the heatmap.
                This process typically takes <strong>24–48 hours</strong>.
              </p>
            </div>
            <p className="text-xs text-slate-basalt/60 font-sans">
              Thank you for contributing to civic transparency in Nepal.
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-pagoda-wood text-himalayan-mist px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all duration-300 shadow-sm"
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Complaint Form ── */
          <form onSubmit={handleSubmit} className="px-6 py-5 relative z-10 space-y-4">
            {submitError && (
              <div className="bg-status-broken/10 border border-status-broken/30 text-status-broken p-3 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
                  Service Type <span className="text-status-broken">*</span>
                </label>
                <div className="relative">
                  <select
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none bg-weather-stone border border-dust-beige text-pagoda-wood focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-2.5 px-3 text-sm font-medium rounded-sm shadow-inner transition-colors cursor-pointer"
                  >
                    <option value="infrastructure">Infrastructure</option>
                    <option value="corruption">Corruption</option>
                    <option value="services">Public Services</option>
                    <option value="health">Health</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 w-4 h-4 text-pagoda-wood" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
                  Ward (Optional)
                </label>
                <input
                  type="text"
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="e.g. Ward 14"
                  className="w-full bg-weather-stone border border-dust-beige text-slate-basalt focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-2.5 px-3 text-sm rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  name="locationLat"
                  value={form.locationLat}
                  onChange={handleChange}
                  placeholder="e.g. 27.7172"
                  className="w-full bg-weather-stone border border-dust-beige text-slate-basalt focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-2.5 px-3 text-sm rounded-sm font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  name="locationLng"
                  value={form.locationLng}
                  onChange={handleChange}
                  placeholder="e.g. 85.3240"
                  className="w-full bg-weather-stone border border-dust-beige text-slate-basalt focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-2.5 px-3 text-sm rounded-sm font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/70 mb-1.5">
                  Description <span className="text-status-broken">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe the issue clearly. Include location landmarks, dates observed, and any evidence available."
                  className="w-full bg-weather-stone border border-dust-beige text-slate-basalt focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-2.5 px-3 text-sm rounded-sm font-serif leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Anonymous toggle */}
            <label className="flex items-center gap-3 cursor-pointer group bg-weather-stone/50 border border-dust-beige/50 p-3 rounded-sm">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={form.isAnonymous}
                onChange={handleChange}
                className="w-4 h-4 accent-temple-brass"
              />
              <span className="text-xs text-slate-basalt font-sans">
                <span className="font-bold text-pagoda-wood">Submit anonymously</span>
                <span className="block text-slate-basalt/60 mt-0.5">Your identity will not be attached to this complaint. Enabled by default.</span>
              </span>
            </label>

            {/* Moderation notice */}
            <div className="bg-status-delayed/5 border border-status-delayed/25 p-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-status-delayed flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-basalt/80 font-serif leading-relaxed">
                All complaints enter a <strong className="text-status-delayed">moderation queue</strong> before appearing publicly. Moderators typically review within 24–48 hours.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-dust-beige text-xs uppercase tracking-wider font-semibold hover:bg-weather-stone text-slate-basalt transition-all rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-pagoda-wood text-himalayan-mist px-6 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all duration-300 shadow-sm rounded-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ComplaintHeatmap() {
  const [serviceType, setServiceType] = useState('all');
  const [complainStatus, setComplainStatus] = useState('verified');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Build filters object that's passed to the hook
  const filters = {
    ...(serviceType !== 'all' ? { serviceType } : {}),
    ...(complainStatus !== 'all' ? { status: complainStatus } : { status: 'all' }),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const { data, loading, error } = useComplaintData(filters);
  const totalComplaints = data.reduce((sum, item) => sum + item.density, 0);

  // Normalize density to 0-10 scale for coloring when dealing with real counts
  const maxDensity = Math.max(...data.map(d => d.density), 1);
  const normalizeForColor = (density) => (density / maxDensity) * 10;

  return (
    <>
      {showModal && (
        <SubmitComplaintModal onClose={() => setShowModal(false)} />
      )}

      <div className="bg-weather-stone border border-dust-beige p-6 shadow-sm flex flex-col font-sans">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
          <div>
            <h3 className="text-xl font-serif text-pagoda-wood tracking-tight mb-1">Civic Complaint Heatmap</h3>
            <p className="text-sm text-slate-basalt/70">
              Density of registered grievances across administrative provinces.
              {totalComplaints > 0 && (
                <span className="ml-2 text-temple-brass font-semibold">{totalComplaints} total</span>
              )}
            </p>
          </div>

          {/* Report Button */}
          <button
            id="report-complaint-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-pagoda-wood text-himalayan-mist px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all duration-300 shadow-sm whitespace-nowrap rounded-sm"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Report Grievance
          </button>
        </div>

        {/* ── Filter Controls ── */}
        <div className="flex flex-wrap gap-3 mb-5 bg-himalayan-mist/50 border border-dust-beige/50 p-3 rounded-sm">
          {/* Service Type */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-temple-brass flex-shrink-0" />
            <label className="font-semibold uppercase tracking-wider text-slate-basalt/70 whitespace-nowrap">Type:</label>
            <div className="relative">
              <select
                id="filter-service-type"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="appearance-none bg-weather-stone text-pagoda-wood border border-dust-beige focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-1.5 pl-2.5 pr-7 text-xs font-semibold rounded-sm shadow-inner transition-colors cursor-pointer"
              >
                {SERVICE_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1.5 w-3.5 h-3.5 text-pagoda-wood" />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold uppercase tracking-wider text-slate-basalt/70 whitespace-nowrap">Status:</label>
            <div className="relative">
              <select
                id="filter-complaint-status"
                value={complainStatus}
                onChange={e => setComplainStatus(e.target.value)}
                className="appearance-none bg-weather-stone text-pagoda-wood border border-dust-beige focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-1.5 pl-2.5 pr-7 text-xs font-semibold rounded-sm shadow-inner transition-colors cursor-pointer"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1.5 w-3.5 h-3.5 text-pagoda-wood" />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold uppercase tracking-wider text-slate-basalt/70 whitespace-nowrap">From:</label>
            <input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-weather-stone border border-dust-beige text-slate-basalt focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-1.5 px-2 text-xs rounded-sm"
            />
            <label className="font-semibold uppercase tracking-wider text-slate-basalt/70">To:</label>
            <input
              id="filter-end-date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-weather-stone border border-dust-beige text-slate-basalt focus:border-temple-brass focus:ring-1 focus:ring-temple-brass outline-none py-1.5 px-2 text-xs rounded-sm"
            />
            {(startDate || endDate || serviceType !== 'all' || complainStatus !== 'verified') && (
              <button
                onClick={() => {
                  setServiceType('all');
                  setComplainStatus('verified');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-slate-basalt/50 hover:text-status-broken transition-colors"
                title="Clear filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Body States ── */}
        {error ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-dust-beige text-status-broken font-serif text-sm gap-3">
            <AlertTriangle className="w-6 h-6" />
            <p>{error}</p>
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
        ) : data.length === 0 || totalComplaints === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-dust-beige text-slate-basalt/60 font-serif text-sm gap-3">
            <CheckCircle className="w-6 h-6 text-slate-basalt/30" />
            <p>No verified complaints match the selected filters.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-temple-brass hover:underline flex items-center gap-1"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Be the first to report a grievance
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.map((item, index) => {
                const normalizedDensity = normalizeForColor(item.density);
                const bg = getDensityColor(normalizedDensity);
                const textColor = normalizedDensity > 4 ? '#F3EFE4' : '#2E2418';
                const borderColor = normalizedDensity > 4 ? 'transparent' : '#CFC4A8';

                // Variable spanning to give a treemap-like feel
                const spanClass = index === 1 ? 'md:col-span-2 md:row-span-2' :
                                  index === 4 ? 'md:col-span-2' : 'col-span-1';

                return (
                  <div
                    key={item.region}
                    className={`relative p-4 rounded-sm flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm cursor-default ${spanClass}`}
                    style={{
                      backgroundColor: bg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      minHeight: '100px'
                    }}
                  >
                    <span className="font-serif font-bold text-lg leading-tight z-10">{item.region}</span>
                    <div className="flex justify-between items-end mt-4 z-10">
                      <span className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Complaints</span>
                      <span className="font-bold text-xl">
                        {item.density === 0 ? '—' : item.density}
                      </span>
                    </div>

                    {/* Subtle texture overlay for premium feel */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')]"></div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-basalt font-semibold uppercase tracking-widest border-t border-dust-beige/50 pt-4">
              <div className="flex items-center gap-1.5 mb-3 sm:mb-0 text-slate-basalt/70">
                <Info className="w-3.5 h-3.5" />
                <span>Density Gradient — Himalayan Mist → Turmeric Clay → Charred Brick</span>
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

            {/* Pending moderation notice */}
            {complainStatus !== 'pending' && (
              <div className="bg-status-delayed/5 border border-status-delayed/25 p-3 flex items-start gap-2 mt-1">
                <Clock className="w-4 h-4 text-status-delayed flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-basalt/80 font-serif leading-relaxed">
                  Only <strong>verified</strong> complaints appear here by default.
                  Newly submitted complaints enter a <strong className="text-status-delayed">moderation queue</strong> and will appear once reviewed by a Nirikshan moderator.
                  Switch the status filter to <em>Pending</em> to preview unverified submissions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
