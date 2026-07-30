import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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
import { authAPI } from './api';
import { ShieldCheck, UserCheck, LogOut, Loader, Award, Shield, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderFade, setPreloaderFade] = useState(false);

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

    // Start preloader fade-out sequence
    const timerFade = setTimeout(() => setPreloaderFade(true), 1300);
    const timerRemove = setTimeout(() => setShowPreloader(false), 1800);
    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerRemove);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nirikshan_token');
    localStorage.removeItem('nirikshan_user');
    setUser(null);
    window.location.reload();
  };

  const isPreloading = loading || showPreloader;

  return (
    <>
      {isPreloading && (
        <div className={`fixed inset-0 bg-pagoda-wood z-[9999] flex flex-col items-center justify-center text-himalayan-mist transition-opacity duration-500 ${preloaderFade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center space-y-6">
            <img src="/logo.png" alt="Nirikshan Logo" className="w-24 h-24 object-contain rounded-full p-2 bg-white border-2 border-temple-brass shadow-xl animate-pulse" />
            <h1 className="text-3xl font-serif tracking-wider font-extrabold text-himalayan-mist text-center">
               NIRIKSHAN <span className="font-sans font-light text-lg tracking-widest text-temple-brass block text-center mt-2">निरीक्षण</span>
            </h1>
            <p className="text-himalayan-mist/60 text-xs tracking-widest uppercase text-center">Citizen Government Watchdog</p>
          </div>
        </div>
      )}
      <Router>
        <div className="min-h-screen flex flex-col bg-himalayan-mist font-sans">
          {/* Institutional Navbar */}
          <header className="bg-pagoda-wood text-himalayan-mist border-b border-dust-beige shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/logo.png" alt="Nirikshan Logo" className="w-10 h-10 object-contain rounded-full p-1 bg-white border border-dust-beige shadow-sm" />
                <span className="text-2xl font-serif tracking-wider font-extrabold text-himalayan-mist group-hover:text-temple-brass transition-colors">
                  NIRIKSHAN <span className="font-sans font-light text-sm tracking-widest text-temple-brass block md:inline md:ml-2">निरीक्षण</span>
                </span>
              </Link>

              <nav className="flex items-center gap-6">
                {user && !user.isAnonymous && (
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
                  </>
                )}
                
                {user && !user.isAnonymous && (user.role === 'moderator' || user.role === 'admin') && (
                  <Link
                    to="/moderation"
                    className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors flex items-center gap-1 text-temple-brass"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Moderation
                  </Link>
                )}

                {user && !user.isAnonymous ? (
                  <div className="flex items-center gap-3 border-l border-dust-beige/30 pl-6">
                    <span className="text-xs text-slate-basalt bg-weather-stone px-2.5 py-1 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-temple-brass" />
                      {user.name} ({user.role})
                    </span>
                    <button
                      onClick={handleLogout}
                      title="Log Out"
                      className="text-himalayan-mist/70 hover:text-status-broken transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </nav>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage setUser={setUser} />} />
              <Route path="/promises" element={user && !user.isAnonymous ? <Dashboard user={user} /> : <Navigate to="/" replace />} />
              <Route path="/map" element={user && !user.isAnonymous ? <InteractiveMap /> : <Navigate to="/" replace />} />
              <Route path="/directory" element={user && !user.isAnonymous ? <RepresentativeDirectory /> : <Navigate to="/" replace />} />
              <Route path="/rti" element={user && !user.isAnonymous ? <RtiAssistant /> : <Navigate to="/" replace />} />
              <Route path="/civic-map" element={user && !user.isAnonymous ? <CivicMap /> : <Navigate to="/" replace />} />
              <Route path="/promises/:id" element={user && !user.isAnonymous ? <PromiseDetail user={user} /> : <Navigate to="/" replace />} />
              <Route path="/promises/new" element={user && !user.isAnonymous ? <CreatePromise /> : <Navigate to="/" replace />} />
              <Route path="/moderation" element={user && !user.isAnonymous ? <ModeratorDashboard /> : <Navigate to="/" replace />} />
              <Route path="/representative/:id" element={user && !user.isAnonymous ? <RepresentativeReportCard /> : <Navigate to="/" replace />} />
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
      </Router>
    </>
  );
}
