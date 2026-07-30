import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, MapPin, ArrowRight } from 'lucide-react';

const statusLabels = {
  promised: { label: 'Promised', bg: 'bg-weather-stone text-pagoda-wood border-dust-beige' },
  in_progress: { label: 'In Progress', bg: 'bg-status-delayed/10 text-status-delayed border-status-delayed/20' },
  delayed: { label: 'Delayed', bg: 'bg-status-delayed/10 text-status-delayed border-status-delayed/30' },
  fulfilled: { label: 'Fulfilled', bg: 'bg-status-fulfilled/10 text-status-fulfilled border-status-fulfilled/30' },
  broken: { label: 'Broken', bg: 'bg-status-broken/10 text-status-broken border-status-broken/30' }
};

export default function PromiseCard({ promise }) {
  const statusInfo = statusLabels[promise.status] || statusLabels.promised;

  return (
    <div className="bg-weather-stone/50 border border-dust-beige/60 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <span className={`inline-block text-xs uppercase tracking-wider font-semibold px-2.5 py-1 border ${statusInfo.bg}`}>
            {statusInfo.label}
          </span>
          <span className="text-xs text-slate-basalt/70 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {promise.datePromised}
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold text-pagoda-wood mb-2 hover:text-temple-brass transition-colors">
          <Link to={`/promises/${promise.id}`}>{promise.title}</Link>
        </h3>

        <p className="text-slate-basalt/80 text-sm line-clamp-3 mb-4 leading-relaxed font-sans">
          {promise.description}
        </p>
      </div>

      <div className="border-t border-dust-beige/40 pt-4 mt-2">
        <div className="flex flex-col gap-1.5 text-xs text-slate-basalt/80 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-temple-brass" />
            <span className="font-semibold text-pagoda-wood">{promise.officialName}</span>
            <span className="text-slate-basalt/60">({promise.officialRole})</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-temple-brass" />
            <span>{promise.constituency}</span>
          </div>
        </div>

        <Link
          to={`/promises/${promise.id}`}
          className="inline-flex items-center text-xs font-semibold text-pagoda-wood hover:text-temple-brass transition-colors group"
        >
          Track Progress
          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
