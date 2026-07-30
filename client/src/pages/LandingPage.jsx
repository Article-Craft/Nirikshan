import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Map, BarChart3, AlertTriangle, ArrowRight, CheckCircle2, KeyRound, UserPlus, Landmark, Users } from 'lucide-react';
import { authAPI } from '../api';

export default function LandingPage({ setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (activeTab === 'login') {
        response = await authAPI.login({ email, password });
      } else if (activeTab === 'signup') {
        response = await authAPI.register({ name, email, password, role: 'citizen' });
      }

      localStorage.setItem('nirikshan_token', response.token);
      localStorage.setItem('nirikshan_user', JSON.stringify(response.user));
      setUser(response.user);
      navigate('/promises');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    setActiveTab('login');
    setEmail(`demo_${role}@nirikshan.gov.np`);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-himalayan-mist flex flex-col text-slate-basalt selection:bg-temple-brass selection:text-white">
      {/* Premium Gradient Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-pagoda-wood to-slate-basalt text-himalayan-mist py-24 sm:py-32 border-b border-temple-brass/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#9C7A3C_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        
        {/* Subtle Nepal Map Background */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 opacity-[0.12] pointer-events-none select-none flex items-center justify-center lg:justify-end pr-0 lg:pr-8 z-0">
          <img 
            src="/nepal-map.svg" 
            alt="Nepal Map Outline" 
            className="h-full max-h-[90%] w-auto object-contain"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Vision & Brand */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-weather-stone/10 border border-dust-beige/30 text-temple-brass text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
                <Landmark className="w-4 h-4" /> Official Civic Watchdog Portal
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 flex-wrap">
                  <img src="/logo.png" alt="Nirikshan Logo" className="w-20 h-20 object-contain rounded-full p-2 bg-white border-2 border-temple-brass shadow-2xl transition-transform hover:scale-105 duration-300" />
                  <div>
                    <h1 className="text-5xl sm:text-6xl font-serif font-extrabold text-himalayan-mist leading-none tracking-tight">
                      NIRIKSHAN
                    </h1>
                    <span className="font-sans font-light text-2xl tracking-widest text-temple-brass block mt-1">निरीक्षण</span>
                  </div>
                </div>
                
                <p className="text-xl text-himalayan-mist/90 font-serif leading-relaxed max-w-2xl border-l-2 border-temple-brass/50 pl-6 italic">
                  "Empowering citizens through rigorous tracking of municipal performance, transparent governance monitoring, and active accountability infrastructures across Nepal."
                </p>
              </div>

              {/* Statistics Panel */}
              <div className="grid grid-cols-3 gap-6 py-6 border-y border-dust-beige/20">
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-temple-brass font-serif">165</div>
                  <div className="text-[10px] text-himalayan-mist/60 uppercase tracking-widest font-bold">FPTP Constituencies</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-temple-brass font-serif">100%</div>
                  <div className="text-[10px] text-himalayan-mist/60 uppercase tracking-widest font-bold">Verified Audit Logs</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-temple-brass font-serif">7</div>
                  <div className="text-[10px] text-himalayan-mist/60 uppercase tracking-widest font-bold">Provinces Mapped</div>
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="flex flex-wrap gap-4 text-sm text-himalayan-mist/70">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-temple-brass" />
                  <span>ECN Dataset Compliant</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-temple-brass" />
                  <span>RTI Act Framework</span>
                </div>
              </div>
            </div>

            {/* Right Column: Sleek Auth Card */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white text-slate-basalt border-2 border-temple-brass/25 rounded shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-temple-brass/10">
                <div className="h-2 bg-gradient-to-r from-temple-brass via-pagoda-wood to-temple-brass"></div>
                
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-serif font-bold text-pagoda-wood">Citizen Access Portal</h3>
                    <p className="text-xs text-slate-basalt/60 mt-1">Authenticate credentials or create an account to begin audit logs inspection</p>
                  </div>

                  {/* Clean Tab Switcher */}
                  <div className="flex bg-himalayan-mist p-1 rounded-sm mb-6 border border-dust-beige/30">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setError(''); }}
                      className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold transition-all rounded-sm ${activeTab === 'login' ? 'bg-pagoda-wood text-himalayan-mist shadow-sm' : 'text-slate-basalt/60 hover:text-slate-basalt'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signup'); setError(''); }}
                      className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold transition-all rounded-sm ${activeTab === 'signup' ? 'bg-pagoda-wood text-himalayan-mist shadow-sm' : 'text-slate-basalt/60 hover:text-slate-basalt'}`}
                    >
                      Register
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 bg-status-broken/10 border border-status-broken/20 text-status-broken px-4 py-2.5 text-xs font-semibold rounded-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'signup' && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-basalt/70 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ashmit Giri"
                          className="w-full bg-himalayan-mist/40 border border-dust-beige py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass focus:border-temple-brass rounded-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-basalt/70 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="citizen@nirikshan.gov.np"
                        className="w-full bg-himalayan-mist/40 border border-dust-beige py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass focus:border-temple-brass rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-basalt/70 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-himalayan-mist/40 border border-dust-beige py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass focus:border-temple-brass rounded-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-pagoda-wood text-himalayan-mist font-semibold py-3 px-4 hover:bg-pagoda-wood/90 transition-all flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 mt-6 shadow-md"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-himalayan-mist border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>{activeTab === 'login' ? 'Authenticate & Enter' : 'Create Account'}</span>
                          <ArrowRight className="w-4.5 h-4.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Helper/Demo credentials area */}
                  <div className="mt-6 pt-6 border-t border-dust-beige/45">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-basalt/50 mb-2">Demo Quick Sign-In</span>
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => handleQuickFill('citizen')}
                        className="text-[11px] bg-himalayan-mist hover:bg-weather-stone text-pagoda-wood font-semibold py-1.5 px-3 rounded border border-dust-beige/45 transition-colors"
                      >
                        Citizen Account
                      </button>
                      <button 
                        onClick={() => handleQuickFill('moderator')}
                        className="text-[11px] bg-himalayan-mist hover:bg-weather-stone text-pagoda-wood font-semibold py-1.5 px-3 rounded border border-dust-beige/45 transition-colors"
                      >
                        Moderator Account
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dust-beige/30 flex items-start gap-2.5">
                    <Shield className="w-4.5 h-4.5 text-temple-brass flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-basalt/60 leading-normal">
                      Security warning: Access is logged. Please authenticate with official credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Grid: Architectural Platform Sections */}
      <section className="bg-weather-stone/30 py-24 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-serif text-pagoda-wood font-extrabold tracking-tight sm:text-4xl">Platform Modules & Scope</h2>
            <p className="text-sm text-slate-basalt/70 uppercase tracking-widest font-semibold">Data layers integrated into the watchdog infrastructure</p>
            <div className="h-1 w-20 bg-temple-brass mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-dust-beige/50 shadow-sm rounded-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-himalayan-mist flex items-center justify-center rounded-sm mb-6 group-hover:bg-temple-brass/10 transition-colors">
                <FileText className="w-6 h-6 text-temple-brass" />
              </div>
              <h3 className="text-lg font-serif font-bold text-pagoda-wood mb-3">Promise Tracker</h3>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Maintains an audit ledger of campaign commitments and physical progress. Citizens can verify timelines, check status flags (fulfilled, delayed, or broken), and inspect source references.
              </p>
            </div>

            <div className="bg-white p-8 border border-dust-beige/50 shadow-sm rounded-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-himalayan-mist flex items-center justify-center rounded-sm mb-6 group-hover:bg-temple-brass/10 transition-colors">
                <Map className="w-6 h-6 text-temple-brass" />
              </div>
              <h3 className="text-lg font-serif font-bold text-pagoda-wood mb-3">Interactive Election Map</h3>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Renders interactive GIS boundaries mapping Nepal's 165 FPTP constituencies with real 2026 election data, providing contact files for elected MPs and local Chief District Officers.
              </p>
            </div>

            <div className="bg-white p-8 border border-dust-beige/50 shadow-sm rounded-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-himalayan-mist flex items-center justify-center rounded-sm mb-6 group-hover:bg-temple-brass/10 transition-colors">
                <BarChart3 className="w-6 h-6 text-temple-brass" />
              </div>
              <h3 className="text-lg font-serif font-bold text-pagoda-wood mb-3">Budget & Progress Visualizer</h3>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Cross-references development budget allocation files with project completion percentages. Identifies allocation anomalies and progress delays in municipal public works.
              </p>
            </div>

            <div className="bg-white p-8 border border-dust-beige/50 shadow-sm rounded-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-himalayan-mist flex items-center justify-center rounded-sm mb-6 group-hover:bg-temple-brass/10 transition-colors">
                <AlertTriangle className="w-6 h-6 text-temple-brass" />
              </div>
              <h3 className="text-lg font-serif font-bold text-pagoda-wood mb-3">Grievance Heatmap</h3>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Allows anonymous reporting of service breakages or infrastructure failure (water, roads, pollution). Pinpoints reports to visual maps to detect high-frequency municipal issue clusters.
              </p>
            </div>

            <div className="bg-white p-8 border border-dust-beige/50 shadow-sm rounded-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-himalayan-mist flex items-center justify-center rounded-sm mb-6 group-hover:bg-temple-brass/10 transition-colors">
                <FileText className="w-6 h-6 text-temple-brass" />
              </div>
              <h3 className="text-lg font-serif font-bold text-pagoda-wood mb-3">RTI Request Builder</h3>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Assists citizens in compiling official Right to Information request PDFs formatted per the Right to Information Act of Nepal, simplifying municipal queries.
              </p>
            </div>

            <div className="bg-white p-8 border border-dust-beige/50 shadow-sm rounded-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-himalayan-mist flex items-center justify-center rounded-sm mb-6 group-hover:bg-temple-brass/10 transition-colors">
                <Users className="w-6 h-6 text-temple-brass" />
              </div>
              <h3 className="text-lg font-serif font-bold text-pagoda-wood mb-3">Representative Directory</h3>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Synthesizes parliament attendance indexes, legislation sponsorship counts, and community rating reports to build performance report cards for elected officials.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
