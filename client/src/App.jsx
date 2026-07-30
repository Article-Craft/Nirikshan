import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
import { ShieldCheck, UserCheck, LogOut, Loader, Award } from 'lucide-react';

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
        setUser(JSON.parse(savedUser));
        setLoading(false);
      } else {
        // Automatically start an anonymous guest session if no user is logged in
        try {
          const session = await authAPI.anonymousSession();
          localStorage.setItem('nirikshan_token', session.token);
          localStorage.setItem('nirikshan_user', JSON.stringify(session.user));
          setUser(session.user);
        } catch (err) {
          console.error('Failed to init anonymous session:', err);
        } finally {
          setLoading(false);
        }
      }
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

  const handleDemoSignIn = async (role) => {
    setLoading(true);
    try {
      // Create a dummy user register/login sequence for demonstration purposes
      const email = `demo_${role}@nirikshan.gov.np`;
      const name = `${role.toUpperCase()} User`;
      const password = 'password123';

      let response;
      try {
        response = await authAPI.register({ name, email, password, role });
      } catch (err) {
        // If already exists, login
        response = await authAPI.login({ email, password });
      }

      localStorage.setItem('nirikshan_token', response.token);
      localStorage.setItem('nirikshan_user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (err) {
      console.error(err);
      alert('Demo sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const isPreloading = loading || showPreloader;

  return (
    <>
      {isPreloading && (
        <div className={`fixed inset-0 bg-pagoda-wood z-[9999] flex flex-col items-center justify-center text-himalayan-mist transition-opacity duration-500 ${preloaderFade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center space-y-6">
            <img src="/logo.png" alt="Nirikshan Logo" className="w-24 h-24 object-contain animate-pulse" />
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
                <img src="/logo.png" alt="Nirikshan Logo" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-serif tracking-wider font-extrabold text-himalayan-mist group-hover:text-temple-brass transition-colors">
                  NIRIKSHAN <span className="font-sans font-light text-sm tracking-widest text-temple-brass block md:inline md:ml-2">निरीक्षण</span>
                </span>
              </Link>

              <nav className="flex items-center gap-6">
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
                
                {user && (user.role === 'moderator' || user.role === 'admin') && (
                  <Link
                    to="/moderation"
                    className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors flex items-center gap-1 text-temple-brass"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Moderation
                  </Link>
                )}

                {user ? (
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
              <Route path="/promises" element={<Dashboard user={user} />} />
              <Route path="/map" element={<InteractiveMap />} />
              <Route path="/directory" element={<RepresentativeDirectory />} />
              <Route path="/rti" element={<RtiAssistant />} />
              <Route path="/civic-map" element={<CivicMap />} />
              <Route path="/promises/:id" element={<PromiseDetail user={user} />} />
              <Route path="/promises/new" element={<CreatePromise />} />
              <Route path="/moderation" element={<ModeratorDashboard />} />
              <Route path="/representative/:id" element={<RepresentativeReportCard />} />
            </Routes>
          </main>

          {/* Premium Institutional Footer */}
          <footer className="bg-pagoda-wood text-himalayan-mist/60 border-t border-dust-beige/20 py-8 mt-20 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p>&copy; 2026 Nirikshan Watchdog Platform. Final-Year Academic Project.</p>
              <p className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-temple-brass" />
                Built for Transparency & Civic Accountability in Nepal
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </>
  );
}
