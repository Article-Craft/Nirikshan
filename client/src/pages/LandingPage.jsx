import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Map, BarChart3, AlertTriangle, ArrowRight, CheckCircle2, KeyRound, UserPlus, UserMinus, Landmark, Users } from 'lucide-react';
import { authAPI } from '../api';

export default function LandingPage({ setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'guest'
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

  const handleGuestAccess = async () => {
    setError('');
    setLoading(true);
    try {
      const session = await authAPI.anonymousSession();
      localStorage.setItem('nirikshan_token', session.token);
      localStorage.setItem('nirikshan_user', JSON.stringify(session.user));
      setUser(session.user);
      navigate('/promises');
    } catch (err) {
      console.error(err);
      setError('Failed to initialize guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-himalayan-mist flex flex-col text-slate-basalt">
      {/* Main Hero & Auth Split Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Institutional Presentation */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-weather-stone/60 border border-dust-beige text-pagoda-wood text-xs font-semibold uppercase tracking-wider rounded-sm">
              <Landmark className="w-4 h-4 text-temple-brass" /> Official Civic Watchdog Portal
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <img src="/logo.png" alt="Nirikshan Logo" className="w-16 h-16 object-contain rounded-full p-1.5 bg-white border-2 border-dust-beige shadow-md" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-pagoda-wood leading-none tracking-tight">
                NIRIKSHAN <span className="font-sans font-light text-2xl lg:text-3xl text-temple-brass block sm:inline sm:ml-3">निरीक्षण</span>
              </h1>
            </div>
            <p className="text-lg text-slate-basalt/90 font-serif leading-relaxed max-w-2xl">
              An independent, data-driven platform monitoring public office performance, tracking representative commitments, 
              and visualizing municipal infrastructure expenditure across Nepal.
            </p>
          </div>

          {/* Quick Platform Metrics */}
          <div className="grid grid-cols-3 gap-6 py-6 border-y border-dust-beige/50">
            <div>
              <div className="text-2xl font-bold text-pagoda-wood">165</div>
              <div className="text-xs text-slate-basalt/70 uppercase tracking-wider">FPTP Constituencies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pagoda-wood">100%</div>
              <div className="text-xs text-slate-basalt/70 uppercase tracking-wider">Verified Data</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pagoda-wood">7</div>
              <div className="text-xs text-slate-basalt/70 uppercase tracking-wider">Provinces Mapped</div>
            </div>
          </div>

          {/* Institutional Compliance Checklist */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-temple-brass flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-basalt/80">
                <strong>Constituency Mapping</strong>: Powered by verified election results directly from the Election Commission of Nepal.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-temple-brass flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-basalt/80">
                <strong>RTI Request Standardization</strong>: Generates legally compliant Right to Information document templates in official Nepali formatting.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Clean, Structured Auth Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white border border-dust-beige rounded-none shadow-md overflow-hidden">
            {/* Top Branding Line */}
            <div className="h-1.5 bg-temple-brass"></div>
            
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-serif font-bold text-pagoda-wood">Citizen Access Portal</h3>
                <p className="text-xs text-slate-basalt/60">Log in or continue anonymously to begin tracking</p>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-dust-beige/40 mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className={`flex-1 pb-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${activeTab === 'login' ? 'border-temple-brass text-temple-brass font-bold' : 'border-transparent text-slate-basalt/40 hover:text-slate-basalt/80'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setError(''); }}
                  className={`flex-1 pb-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${activeTab === 'signup' ? 'border-temple-brass text-temple-brass font-bold' : 'border-transparent text-slate-basalt/40 hover:text-slate-basalt/80'}`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('guest'); setError(''); }}
                  className={`flex-1 pb-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${activeTab === 'guest' ? 'border-temple-brass text-temple-brass font-bold' : 'border-transparent text-slate-basalt/40 hover:text-slate-basalt/80'}`}
                >
                  Guest Access
                </button>
              </div>

              {/* Message Display */}
              {error && (
                <div className="mb-4 bg-status-broken/10 border border-status-broken/20 text-status-broken px-4 py-2 text-xs rounded-sm">
                  {error}
                </div>
              )}

              {/* Auth Forms */}
              {activeTab === 'guest' ? (
                <div className="space-y-6">
                  <p className="text-xs text-slate-basalt/80 leading-relaxed">
                    Access features immediately without account registration. Guest users can inspect constituencies, browse political promise feeds, and view local budgets. Note that reports submitted as a guest are linked to temporary identifiers.
                  </p>
                  <button
                    onClick={handleGuestAccess}
                    disabled={loading}
                    className="w-full bg-pagoda-wood text-himalayan-mist font-semibold py-3 px-4 hover:bg-pagoda-wood/90 transition-all flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-himalayan-mist border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Continue as Guest</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
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
                        className="w-full bg-himalayan-mist/30 border border-dust-beige py-2 px-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
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
                      className="w-full bg-himalayan-mist/30 border border-dust-beige py-2 px-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
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
                      className="w-full bg-himalayan-mist/30 border border-dust-beige py-2 px-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pagoda-wood text-himalayan-mist font-semibold py-3 px-4 hover:bg-pagoda-wood/90 transition-all flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 mt-6"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-himalayan-mist border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>{activeTab === 'login' ? 'Sign In & Enter' : 'Create Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Administrative Access Footer */}
              <div className="mt-6 pt-6 border-t border-dust-beige/30 flex items-center gap-3">
                <Shield className="w-4 h-4 text-temple-brass flex-shrink-0" />
                <p className="text-[10px] text-slate-basalt/60 leading-normal">
                  Supervisors and system administrators can log in directly using their authorized email in the standard Sign In form.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Architectural Platform Sections */}
      <section className="bg-weather-stone/30 border-y border-dust-beige/50 py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-temple-brass pl-4 mb-12">
            <h2 className="text-2xl font-serif text-pagoda-wood font-bold">Platform Modules & Scope</h2>
            <p className="text-xs text-slate-basalt/70 uppercase tracking-wider mt-1">Data layers integrated into the watchdog infrastructure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pagoda-wood font-bold">
                <FileText className="w-5 h-5 text-temple-brass" />
                <h3>Promise Tracker</h3>
              </div>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Maintains an audit ledger of campaign commitments and physical progress. Citizens can verify timelines, check status flags (fulfilled, delayed, or broken), and inspect source references.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pagoda-wood font-bold">
                <Map className="w-5 h-5 text-temple-brass" />
                <h3>Interactive Election Map</h3>
              </div>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Renders interactive GIS boundaries mapping Nepal's 165 FPTP constituencies with real 2026 election data, providing contact files for elected MPs and local Chief District Officers.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pagoda-wood font-bold">
                <BarChart3 className="w-5 h-5 text-temple-brass" />
                <h3>Budget & Progress Visualizer</h3>
              </div>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Cross-references development budget allocation files with project completion percentages. Identifies allocation anomalies and progress delays in municipal public works.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pagoda-wood font-bold">
                <AlertTriangle className="w-5 h-5 text-temple-brass" />
                <h3>Grievance Heatmap</h3>
              </div>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Allows anonymous reporting of service breakages or infrastructure failure (water, roads, pollution). Pinpoints reports to visual maps to detect high-frequency municipal issue clusters.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pagoda-wood font-bold">
                <FileText className="w-5 h-5 text-temple-brass" />
                <h3>RTI Request Builder</h3>
              </div>
              <p className="text-xs text-slate-basalt/80 leading-relaxed">
                Assists citizens in compiling official Right to Information request PDFs formatted per the Right to Information Act of Nepal, simplifying municipal queries.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pagoda-wood font-bold">
                <Users className="w-5 h-5 text-temple-brass" />
                <h3>Representative Directory</h3>
              </div>
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
