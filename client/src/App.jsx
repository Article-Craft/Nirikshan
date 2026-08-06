import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PromiseDetail from './pages/PromiseDetail';
import ModeratorDashboard from './pages/ModeratorDashboard';
import CreatePromise from './pages/CreatePromise';
import InteractiveMap from './pages/InteractiveMap';
import RepresentativeDirectory from './pages/RepresentativeDirectory';
import RepresentativeReportCard from './pages/RepresentativeReportCard';
import RtiAssistant from './pages/RtiAssistant';
import CivicMap from './pages/CivicMap';
import LandingPage from './pages/LandingPage';
import ProfileDashboard from './pages/ProfileDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import { authAPI } from './api';
import { ShieldCheck, UserCheck, LogOut, Loader, Award, Shield, Mail, Phone, MapPin, Globe, Menu, X } from 'lucide-react';

function Header({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const showLoginLink = location.pathname !== '/';
  const isLoggedIn = user && !user.isAnonymous;

  // Close menu on link click
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('nirikshan_token');
    localStorage.removeItem('nirikshan_user');
    setUser(null);
    closeMenu();
    navigate('/');
  };

  return (
    <header className="bg-pagoda-wood text-himalayan-mist border-b border-dust-beige shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Nirikshan Logo" className="w-10 h-10 object-contain rounded-full p-1 bg-white border border-dust-beige shadow-sm" />
          <span className="text-lg sm:text-2xl font-serif tracking-wider font-extrabold text-himalayan-mist group-hover:text-temple-brass transition-colors">
            NIRIKSHAN <span className="font-sans font-light text-xs sm:text-sm tracking-widest text-temple-brass block md:inline md:ml-2">निरीक्षण</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isLoggedIn && (
            <>
              <Link to="/promises" className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors">
                Promises Feed
              </Link>

              <Link to="/map" className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors">
                Interactive Map
              </Link>

              <Link to="/directory" className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors">
                Representatives Directory
              </Link>

              <Link to="/rti" className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors">
                RTI Assistant
              </Link>

              <Link to="/civic-map" className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors">
                Civic Map
              </Link>
              
              {(user.role === 'moderator' || user.role === 'admin') && (
                <Link
                  to="/moderation"
                  className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors flex items-center gap-1 text-temple-brass"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Moderation
                </Link>
              )}
            </>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-3 border-l border-dust-beige/30 pl-6">
              <span className="text-xs text-slate-basalt bg-weather-stone px-2.5 py-1 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-temple-brass" />
                {user.name} ({user.role})
              </span>
              <button
                onClick={() => { handleLogout(); closeMenu(); }}
                title="Log Out"
                className="text-himalayan-mist/70 hover:text-status-broken transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-dust-beige/30 pl-6">
              <a 
                href="/#auth-section" 
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs uppercase tracking-wider font-extrabold bg-temple-brass hover:bg-temple-brass/90 text-pagoda-wood px-4 py-2.5 rounded transition-all duration-200 shadow-sm border border-temple-brass/20 hover:scale-105 active:scale-95"
              >
                Sign In / Register
              </a>
            </div>
          )}
        </nav>

        {/* Hamburger menu button for mobile */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-himalayan-mist hover:text-temple-brass focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-dust-beige/20 px-4 py-6 space-y-4 animate-fade-in absolute top-20 left-0 w-full shadow-lg z-[1050]">
          {isLoggedIn ? (
            <div className="flex flex-col space-y-3">
              <div className="pb-3 border-b border-white/10 mb-2 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-temple-brass" />
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={() => { handleLogout(); closeMenu(); }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
              <Link to="/promises" onClick={closeMenu} className="text-sm uppercase tracking-wider font-semibold block hover:text-temple-brass transition-colors">
                Promises Feed
              </Link>
              <Link to="/map" onClick={closeMenu} className="text-sm uppercase tracking-wider font-semibold block hover:text-temple-brass transition-colors">
                Interactive Map
              </Link>
              <Link to="/directory" onClick={closeMenu} className="text-sm uppercase tracking-wider font-semibold block hover:text-temple-brass transition-colors">
                Representatives Directory
              </Link>
              <Link to="/rti" onClick={closeMenu} className="text-sm uppercase tracking-wider font-semibold block hover:text-temple-brass transition-colors">
                RTI Assistant
              </Link>
              <Link to="/civic-map" onClick={closeMenu} className="text-sm uppercase tracking-wider font-semibold block hover:text-temple-brass transition-colors">
                Civic Map
              </Link>
              {(user.role === 'moderator' || user.role === 'admin') && (
                <Link to="/moderation" onClick={closeMenu} className="text-sm uppercase tracking-wider font-semibold block hover:text-temple-brass transition-colors text-temple-brass">
                  Moderation
                </Link>
              )}
            </div>
          ) : (
            <a 
              href="/#auth-section" 
              onClick={(e) => {
                closeMenu();
                if (location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className="text-sm uppercase tracking-wider font-bold bg-temple-brass hover:bg-temple-brass/90 text-pagoda-wood px-4 py-2.5 rounded block text-center transition-all duration-200 shadow-sm"
            >
              Sign In / Register
            </a>
          )}
        </div>
      )}
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderFade, setPreloaderFade] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "Establishing secure connection to Nirikshan backend...",
    "Fetching 77 district administrative dossiers...",
    "Verifying constituency representative records...",
    "Initializing civic watchdog mapping system..."
  ];

  // Auto sign-in or check existing session on mount
  useEffect(() => {
    const initSession = async () => {
      const savedUser = localStorage.getItem('nirikshan_user');
      const token = localStorage.getItem('nirikshan_token');
      
      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser);
        // Only set user if they are not anonymous/guest
        if (parsedUser && !parsedUser.isAnonymous) {
          setUser(parsedUser);
        }
      }
      setLoading(false);
    };
    initSession();

    // Cycle through loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 500);

    // Start preloader fade-out sequence
    const timerFade = setTimeout(() => setPreloaderFade(true), 2100);
    const timerRemove = setTimeout(() => setShowPreloader(false), 2600);
    
    return () => {
      clearInterval(stepInterval);
      clearTimeout(timerFade);
      clearTimeout(timerRemove);
    };
  }, []);

  const isPreloading = loading || showPreloader;

  return (
    <>
      {isPreloading && (
        <div className={`fixed inset-0 bg-[#2E2418] z-[9999] flex flex-col items-center justify-center text-himalayan-mist transition-opacity duration-700 ${preloaderFade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center space-y-8 max-w-sm w-full mx-4 text-center">
            {/* Logo centerpiece */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Nirikshan Logo" 
                className="w-20 h-20 object-contain rounded-full p-1 bg-white/5 border border-white/10" 
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-serif tracking-[0.2em] font-extrabold text-white uppercase">
                 NIRIKSHAN
              </h1>
              <span className="font-sans font-light text-xs tracking-[0.3em] text-temple-brass block uppercase">निरीक्षण</span>
              <p className="text-slate-400 text-[9px] tracking-[0.25em] uppercase font-bold">National Civic Integrity Portal</p>
            </div>

            {/* Step text */}
            <div className="h-6 flex items-center justify-center">
              <p className="text-xs text-slate-300 font-medium tracking-wide transition-all duration-300">
                {loadingSteps[loadingStep]}
              </p>
            </div>

            {/* Loading progression bar */}
            <div className="w-48 bg-white/10 h-[2px] rounded-full overflow-hidden relative">
              <div 
                className="bg-temple-brass h-full rounded-full absolute top-0 left-0 transition-all duration-500" 
                style={{ width: `${(loadingStep + 1) * 25}%` }}
              />
            </div>
          </div>
        </div>
      )}
      <Router>
        {user && (user.role === 'admin' || user.role === 'moderator') ? (
          <AdminLayout user={user} setUser={setUser} activeTab={activeAdminTab} setActiveTab={setActiveAdminTab}>
            <AdminDashboard activeTab={activeAdminTab} />
          </AdminLayout>
        ) : (
          <div className="min-h-screen flex flex-col bg-himalayan-mist font-sans">
            <Header user={user} setUser={setUser} />
            {/* Page Content */}
            <main className="flex-grow">
              {/* Client-side routing configuration for Nirikshan */}
              <Routes>
                <Route path="/" element={<LandingPage setUser={setUser} />} />
                <Route path="/promises" element={user && !user.isAnonymous ? <Dashboard user={user} /> : <Navigate to="/" replace />} />
                <Route path="/map" element={user && !user.isAnonymous ? <InteractiveMap /> : <Navigate to="/" replace />} />
                <Route path="/directory" element={user && !user.isAnonymous ? <RepresentativeDirectory /> : <Navigate to="/" replace />} />
                <Route path="/rti" element={user && !user.isAnonymous ? <RtiAssistant user={user} /> : <Navigate to="/" replace />} />
                <Route path="/civic-map" element={user && !user.isAnonymous ? <CivicMap /> : <Navigate to="/" replace />} />
                <Route path="/promises/:id" element={user && !user.isAnonymous ? <PromiseDetail user={user} /> : <Navigate to="/" replace />} />
                <Route path="/promises/new" element={user && !user.isAnonymous ? <CreatePromise /> : <Navigate to="/" replace />} />
                <Route path="/moderation" element={user && !user.isAnonymous ? <ModeratorDashboard /> : <Navigate to="/" replace />} />
                <Route path="/representative/:id" element={user && !user.isAnonymous ? <RepresentativeReportCard /> : <Navigate to="/" replace />} />
                <Route path="/profile" element={user && !user.isAnonymous ? <ProfileDashboard setUser={setUser} /> : <Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Premium Multi-Column Footer */}
            <footer className="bg-pagoda-wood text-himalayan-mist/75 border-t-2 border-temple-brass/30 pt-16 pb-8 mt-20 w-full text-xs">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                  {/* Column 1: Brand & Logo */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img src="/logo.png" alt="Nirikshan Logo" className="w-10 h-10 object-contain rounded-full bg-white border border-temple-brass p-1 shadow-md" />
                      <div>
                        <span className="text-lg font-serif font-extrabold tracking-wider text-himalayan-mist">NIRIKSHAN</span>
                        <span className="text-xs font-sans tracking-widest text-temple-brass block text-left">निरीक्षण</span>
                      </div>
                    </div>
                    <p className="text-xs text-himalayan-mist/60 leading-relaxed text-left">
                      Empowering the public through real-time tracking of constituency developments, budgets, and pledges. Built to promote transparency and accountability in governance across Nepal.
                    </p>
                  </div>

                  {/* Column 2: Navigation Links */}
                  <div className="text-left">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-temple-brass mb-4">Core Modules</h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <Link to="/promises" className="hover:text-temple-brass hover:translate-x-1 transition-all duration-200 inline-block">Campaign Promises Feed</Link>
                      </li>
                      <li>
                        <Link to="/map" className="hover:text-temple-brass hover:translate-x-1 transition-all duration-200 inline-block">GIS Election Boundaries</Link>
                      </li>
                      <li>
                        <Link to="/directory" className="hover:text-temple-brass hover:translate-x-1 transition-all duration-200 inline-block">Representative Directory</Link>
                      </li>
                      <li>
                        <Link to="/rti" className="hover:text-temple-brass hover:translate-x-1 transition-all duration-200 inline-block">RTI Request Builder</Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Integrity & Compliance */}
                  <div className="text-left">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-temple-brass mb-4">Integrity Framework</h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <span className="text-himalayan-mist/60 block">RTI Act Nepal Compliant</span>
                      </li>
                      <li>
                        <span className="text-himalayan-mist/60 block">ECN Open-Data Mapped</span>
                      </li>
                      <li>
                        <span className="text-himalayan-mist/60 block">Decentralized Audit Trails</span>
                      </li>
                      <li>
                        <span className="text-himalayan-mist/60 block">Moderator Peer-Review Logs</span>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Contact & Support */}
                  <div className="space-y-3 text-xs text-left">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-temple-brass mb-4">Secretariat Info</h4>
                    <div className="flex items-center gap-2.5 text-himalayan-mist/65 hover:text-temple-brass transition-colors">
                      <MapPin className="w-4 h-4 text-temple-brass flex-shrink-0" />
                      <span>Kathmandu, Nepal</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-himalayan-mist/65 hover:text-temple-brass transition-colors">
                      <Mail className="w-4 h-4 text-temple-brass flex-shrink-0" />
                      <span>contact@nirikshan.gov.np</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-himalayan-mist/65 hover:text-temple-brass transition-colors">
                      <Phone className="w-4 h-4 text-temple-brass flex-shrink-0" />
                      <span>+977 1-4200000</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-himalayan-mist/65 hover:text-temple-brass transition-colors">
                      <Globe className="w-4 h-4 text-temple-brass flex-shrink-0" />
                      <span>nirikshan.gov.np</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-himalayan-mist/40">
                  <p>&copy; 2026 Nirikshan Watchdog Platform. Final-Year Academic Project.</p>
                  <p className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-temple-brass" /> Built for Transparency & Civic Accountability in Nepal
                  </p>
                </div>
              </div>
            </footer>
          </div>
        )}
      </Router>
    </>
  );
}
