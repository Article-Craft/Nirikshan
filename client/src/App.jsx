import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PromiseDetail from './pages/PromiseDetail';
import ModeratorDashboard from './pages/ModeratorDashboard';
import CreatePromise from './pages/CreatePromise';
import InteractiveMap from './pages/InteractiveMap';
import RepresentativeReportCard from './pages/RepresentativeReportCard';
import { authAPI } from './api';
import { ShieldCheck, UserCheck, LogOut, Loader, Award } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-himalayan-mist flex flex-col items-center justify-center text-slate-basalt">
        <Loader className="animate-spin w-10 h-10 text-temple-brass mb-4" />
        <p className="font-serif">Initializing Nirikshan Watchdog Platform...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-himalayan-mist font-sans">
        {/* Institutional Navbar */}
        <header className="bg-pagoda-wood text-himalayan-mist border-b border-dust-beige shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-serif tracking-wider font-extrabold text-himalayan-mist group-hover:text-temple-brass transition-colors">
                NIRIKSHAN <span className="font-sans font-light text-sm tracking-widest text-temple-brass block md:inline md:ml-2">निरीक्षण</span>
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link to="/" className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors">
                Promises Feed
              </Link>

              <Link to="/map" className="text-xs uppercase tracking-wider font-semibold hover:text-temple-brass transition-colors">
                Interactive Map
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

        {/* Demo Role Switcher (Utility banner for final-year project reviewers) */}
        <div className="bg-weather-stone/80 border-b border-dust-beige text-xs py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center flex-wrap gap-2">
            <span className="text-slate-basalt/70 font-semibold">Demo Role Fast-Switcher:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleDemoSignIn('citizen')}
                className="bg-himalayan-mist border border-dust-beige px-2 py-0.5 hover:bg-weather-stone text-pagoda-wood font-medium"
              >
                Sign in as Citizen
              </button>
              <button
                onClick={() => handleDemoSignIn('moderator')}
                className="bg-himalayan-mist border border-dust-beige px-2 py-0.5 hover:bg-weather-stone text-pagoda-wood font-medium"
              >
                Sign in as Moderator
              </button>
              <button
                onClick={() => handleDemoSignIn('admin')}
                className="bg-himalayan-mist border border-dust-beige px-2 py-0.5 hover:bg-weather-stone text-pagoda-wood font-medium"
              >
                Sign in as Admin
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/map" element={<InteractiveMap />} />
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
  );
}
