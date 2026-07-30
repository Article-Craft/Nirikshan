import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Map, PieChart, AlertCircle, ArrowRight, CheckCircle2, KeyRound, UserPlus, UserRound } from 'lucide-react';
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
    <div className="min-h-screen bg-himalayan-mist flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pagoda-wood to-slate-basalt text-himalayan-mist py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-temple-brass">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3e3527_1px,transparent_1px),linear-gradient(to_bottom,#3e3527_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider uppercase border border-temple-brass/50 bg-temple-brass/10 text-temple-brass rounded-full mb-6">
            <CheckCircle2 className="w-3.5 h-3.5" /> Civic Tech & Governance Project
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-himalayan-mist mb-6 leading-none">
            Democratizing Civic <span className="text-temple-brass">Accountability</span> in Nepal
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-himalayan-mist/80 font-serif leading-relaxed mb-6">
            Nirikshan (निरीक्षण) is an institutional government watchdog platform designed to track public promises, 
            analyse municipal budgets, and report local grievances directly.
          </p>
        </div>
      </section>

      {/* Auth Portal & Feature Grid Area */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 w-full mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Citizen Portal with Auth Form */}
          <div className="lg:col-span-6 bg-white border-b-4 border-rhododendron-green rounded-xl shadow-xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rhododendron-green/10 text-rhododendron-green rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-pagoda-wood">Citizen Portal</h3>
                  <p className="text-xs text-slate-basalt/60">Access watchdog features and report issues</p>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="flex border-b border-dust-beige/50 mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 border-b-2 ${activeTab === 'login' ? 'border-temple-brass text-temple-brass' : 'border-transparent text-slate-basalt/50 hover:text-slate-basalt'}`}
                >
                  <KeyRound className="w-4 h-4" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 border-b-2 ${activeTab === 'signup' ? 'border-temple-brass text-temple-brass' : 'border-transparent text-slate-basalt/50 hover:text-slate-basalt'}`}
                >
                  <UserPlus className="w-4 h-4" /> Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('guest'); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 border-b-2 ${activeTab === 'guest' ? 'border-temple-brass text-temple-brass' : 'border-transparent text-slate-basalt/50 hover:text-slate-basalt'}`}
                >
                  <UserRound className="w-4 h-4" /> Guest
                </button>
              </div>

              {/* Error messages */}
              {error && (
                <div className="mb-4 bg-status-broken/10 border border-status-broken/30 text-status-broken p-3 text-xs font-serif rounded">
                  {error}
                </div>
              )}

              {/* Render Forms */}
              {activeTab === 'guest' ? (
                <div className="mb-6">
                  <p className="text-slate-basalt/80 text-sm leading-relaxed mb-6">
                    Enter instantly as an anonymous guest. You can view the promises dashboard, read representative report cards, 
                    and explore interactive maps. Note that guest complaints are tracked using a temporary guest identifier.
                  </p>
                  <button
                    onClick={handleGuestAccess}
                    disabled={loading}
                    className="w-full bg-rhododendron-green text-white font-semibold py-3 px-6 rounded-lg hover:bg-rhododendron-green/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Continue as Guest
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mb-2">
                  {activeTab === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-basalt/70 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ashmit Giri"
                        className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2.5 px-3 text-sm rounded focus:outline-none focus:border-temple-brass"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-basalt/70 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@nirikshan.gov.np"
                      className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2.5 px-3 text-sm rounded focus:outline-none focus:border-temple-brass"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-basalt/70 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-himalayan-mist/50 border border-dust-beige/80 py-2.5 px-3 text-sm rounded focus:outline-none focus:border-temple-brass"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rhododendron-green text-white font-semibold py-3 px-6 rounded-lg hover:bg-rhododendron-green/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-6"
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        {activeTab === 'login' ? 'Sign In & Enter' : 'Register Account'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side: Showcase core watchdog info panels */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-xl">
              <h4 className="text-lg font-serif font-bold text-pagoda-wood mb-4">Why Register an Account?</h4>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-2.5 text-sm text-slate-basalt/90">
                  <CheckCircle2 className="w-4 h-4 text-rhododendron-green mt-0.5 flex-shrink-0" />
                  <span>**Personalized Dashboard**: Filter promises by your home constituency and track specific representatives.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-basalt/90">
                  <CheckCircle2 className="w-4 h-4 text-rhododendron-green mt-0.5 flex-shrink-0" />
                  <span>**Write Reviews & Ratings**: Submit official ratings and comments on representative report cards.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-basalt/90">
                  <CheckCircle2 className="w-4 h-4 text-rhododendron-green mt-0.5 flex-shrink-0" />
                  <span>**Draft RTI Requests**: Save draft Right to Information requests and templates directly under your profile.</span>
                </li>
              </ul>
            </div>

            <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-temple-brass/10 text-temple-brass rounded-lg flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-pagoda-wood text-sm">Administrative Access</h5>
                <p className="text-xs text-slate-basalt/70 leading-normal">
                  Supervisors, administrators, and moderators can sign in using their registered credentials in the standard Sign In form.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-pagoda-wood mb-3">Core Watchdog Features</h2>
          <p className="text-slate-basalt/70 max-w-xl mx-auto text-sm">
            Nirikshan integrates structured accountability modules to ensure transparent and reliable civic tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-lg">
            <div className="w-10 h-10 bg-temple-brass/15 text-temple-brass rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-pagoda-wood mb-2">Promise Tracker</h4>
            <p className="text-xs text-slate-basalt/80 leading-relaxed">
              Maintains an audit trail of political promises, complete with timelines, status badges, and citizen commentaries.
            </p>
          </div>

          <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-lg">
            <div className="w-10 h-10 bg-temple-brass/15 text-temple-brass rounded-lg flex items-center justify-center mb-4">
              <Map className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-pagoda-wood mb-2">Interactive Election Map</h4>
            <p className="text-xs text-slate-basalt/80 leading-relaxed">
              Integrates real 2026 Nepal general election boundaries and data from the Election Commission to showcase regional winners.
            </p>
          </div>

          <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-lg">
            <div className="w-10 h-10 bg-temple-brass/15 text-temple-brass rounded-lg flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-pagoda-wood mb-2">Budget Visualizer</h4>
            <p className="text-xs text-slate-basalt/80 leading-relaxed">
              Interactive progress tracking modules comparing municipal budget allocation with actual on-site physical completions.
            </p>
          </div>

          <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-lg">
            <div className="w-10 h-10 bg-temple-brass/15 text-temple-brass rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-pagoda-wood mb-2">Grievance Heatmap</h4>
            <p className="text-xs text-slate-basalt/80 leading-relaxed">
              Enables citizens to drop localized pins and coordinate complaints about water, road damage, or public services.
            </p>
          </div>

          <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-lg">
            <div className="w-10 h-10 bg-temple-brass/15 text-temple-brass rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-pagoda-wood mb-2">RTI Request Builder</h4>
            <p className="text-xs text-slate-basalt/80 leading-relaxed">
              Auto-generates official Right to Information requests using standardized legal layouts in Nepali.
            </p>
          </div>

          <div className="bg-weather-stone/30 border border-dust-beige/50 p-6 rounded-lg">
            <div className="w-10 h-10 bg-temple-brass/15 text-temple-brass rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-pagoda-wood mb-2">Representative Profiles</h4>
            <p className="text-xs text-slate-basalt/80 leading-relaxed">
              Features statistical cards detailing parliamentary attendance, bills sponsored, and citizen performance ratings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
