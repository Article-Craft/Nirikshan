import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../components/Badge';
import RatingStars from '../components/RatingStars';
import StatBlock from '../components/StatBlock';
import DonutChart from '../components/DonutChart';
import { ArrowLeft, MapPin, Building2, Calendar, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function RepresentativeReportCard() {
  const { id } = useParams();

  // Mock data for the representative
  const representative = {
    id,
    name: 'Hon. Pradeep Gyawali',
    role: 'Member of Parliament',
    party: 'CPN (UML)',
    constituency: 'Gulmi-1',
    termStart: '2022',
    rating: 4,
    attendance: '85%',
    bio: 'Serving the people of Gulmi-1, focused on infrastructure development and educational reforms in the rural sectors. Known for active participation in parliamentary discussions on foreign policy.',
    stats: {
      totalPromises: 24,
      fulfilled: 12,
      delayed: 8,
      broken: 4,
      fundsUtilized: 'Rs. 4.5 Cr',
      billsSponsored: 7
    },
    recentPromises: [
      { id: 1, title: 'Upgrade Ridi-Balkot Road', status: 'delayed', date: '2023-04-12' },
      { id: 2, title: 'Establish 5 new health posts', status: 'fulfilled', date: '2022-11-05' },
      { id: 3, title: 'Provide free wifi in public schools', status: 'broken', date: '2023-01-20' },
    ]
  };

  return (
    <div className="min-h-screen bg-himalayan-mist text-slate-basalt pb-16">
      {/* Header section with minimal editorial feel */}
      <div className="bg-weathered-stone border-b border-dust-beige pt-8 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/directory" className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-slate-basalt hover:text-temple-brass transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="accent">{representative.role}</Badge>
                <span className="text-sm font-semibold text-slate-basalt/70 uppercase tracking-wider">{representative.party}</span>
              </div>
              <h1 className="text-5xl font-serif text-pagoda-wood mb-4">{representative.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-basalt font-medium mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-temple-brass" />
                  {representative.constituency}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-temple-brass" />
                  Parliament of Nepal
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-temple-brass" />
                  Elected {representative.termStart}
                </div>
              </div>
              <p className="text-lg leading-relaxed text-slate-basalt/90 max-w-2xl font-serif">
                {representative.bio}
              </p>
            </div>
            
            <div className="bg-himalayan-mist p-6 border border-dust-beige shadow-sm min-w-[280px]">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-basalt mb-4">Public Rating</h3>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-serif text-pagoda-wood">{representative.rating}.0</span>
                <span className="text-sm text-slate-basalt/60 font-medium mb-1.5">/ 5.0</span>
              </div>
              <RatingStars rating={representative.rating} />
              <div className="mt-6 pt-6 border-t border-dust-beige">
                <StatBlock label="Session Attendance" value={representative.attendance} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Performance Overview */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif text-pagoda-wood mb-8 pb-4 border-b border-dust-beige">Performance Report Card</h2>
            
            <div className="bg-weathered-stone p-8 border border-dust-beige mb-12">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-shrink-0">
                  <DonutChart 
                    fulfilled={representative.stats.fulfilled} 
                    delayed={representative.stats.delayed} 
                    broken={representative.stats.broken} 
                    total={representative.stats.totalPromises} 
                  />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-status-fulfilled font-semibold text-sm uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" /> Fulfilled
                    </div>
                    <span className="text-3xl font-serif text-pagoda-wood">{representative.stats.fulfilled}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-status-delayed font-semibold text-sm uppercase tracking-wider">
                      <Clock className="w-4 h-4" /> Delayed
                    </div>
                    <span className="text-3xl font-serif text-pagoda-wood">{representative.stats.delayed}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-status-broken font-semibold text-sm uppercase tracking-wider">
                      <XCircle className="w-4 h-4" /> Broken
                    </div>
                    <span className="text-3xl font-serif text-pagoda-wood">{representative.stats.broken}</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-serif text-pagoda-wood mb-6">Recent Promises & Initiatives</h3>
            <div className="space-y-4">
              {representative.recentPromises.map(promise => (
                <div key={promise.id} className="bg-himalayan-mist border border-dust-beige p-5 hover:bg-weathered-stone transition-colors group cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <FileText className="w-5 h-5 text-slate-basalt/50 group-hover:text-temple-brass transition-colors" />
                    <div>
                      <h4 className="text-base font-semibold text-pagoda-wood">{promise.title}</h4>
                      <span className="text-xs text-slate-basalt/60 font-medium">Declared on {promise.date}</span>
                    </div>
                  </div>
                  <Badge variant={promise.status}>{promise.status}</Badge>
                </div>
              ))}
            </div>
            
            <button className="mt-6 text-sm font-semibold uppercase tracking-wider text-temple-brass hover:text-pagoda-wood transition-colors flex items-center">
              View All Promises
              <ArrowLeft className="w-4 h-4 ml-1 transform rotate-180" />
            </button>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-12">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-basalt mb-6 pb-2 border-b border-dust-beige">Legislative Impact</h3>
              <div className="space-y-8">
                <StatBlock 
                  label="Bills Sponsored" 
                  value={representative.stats.billsSponsored} 
                  description="Primary sponsor on national legislation"
                />
                <StatBlock 
                  label="Funds Utilized" 
                  value={representative.stats.fundsUtilized} 
                  description="Constituency development budget allocated"
                />
              </div>
            </div>
            
            <div className="bg-terraced-pine text-himalayan-mist p-6 border border-dust-beige">
              <h3 className="text-lg font-serif mb-4">Citizen Action</h3>
              <p className="text-sm text-himalayan-mist/80 mb-6 leading-relaxed">
                Notice a discrepancy in this representative's report card? Submit evidence to help maintain accountability.
              </p>
              <button className="w-full py-2.5 bg-temple-brass text-himalayan-mist text-sm font-semibold uppercase tracking-wider hover:bg-pagoda-wood transition-colors">
                Submit Evidence
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
