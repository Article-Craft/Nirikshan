import React, { useState } from 'react';
import { LayoutDashboard, ShieldCheck, Users, Landmark, PlusCircle, LogOut, Menu, X, Sliders, Building } from 'lucide-react';

export default function AdminLayout({ user, setUser, activeTab, setActiveTab, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('nirikshan_token');
    localStorage.removeItem('nirikshan_user');
    setUser(null);
    window.location.href = '/';
  };

  const navItems = [
    { id: 'overview', name: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'moderation', name: 'Moderation Queue', icon: ShieldCheck },
    { id: 'representatives', name: 'Manage Representatives', icon: Users },
    { id: 'parties', name: 'Political Parties', icon: Building },
    { id: 'budgets', name: 'Manage Budgets', icon: Landmark },
    { id: 'promises', name: 'Create Promise', icon: PlusCircle },
    { id: 'settings', name: 'Platform Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain rounded-full bg-white p-1" />
          <div>
            <h1 className="text-base font-bold tracking-wider text-white">NIRIKSHAN</h1>
            <p className="text-[9px] tracking-widest text-temple-brass uppercase font-bold">Admin Console</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-temple-brass/25 border border-temple-brass/40 flex items-center justify-center font-bold text-temple-brass">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-xs font-semibold text-white truncate max-w-[170px]">{user?.name || 'Administrator'}</p>
              <span className="text-[10px] text-slate-400 capitalize px-2 py-0.5 bg-slate-800 rounded font-medium mt-1 inline-block">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-temple-brass text-slate-950 font-bold shadow-md shadow-temple-brass/10 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-status-broken hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white p-0.5" />
          <span className="text-sm font-bold tracking-wider text-white">NIRIKSHAN ADMIN</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          
          {/* Menu Drawer */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-slate-900 h-full z-50 border-r border-slate-800 pt-16">
            <nav className="flex-grow p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-temple-brass text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-status-broken transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content body wrapper */}
      <main className="flex-grow flex flex-col min-w-0 pt-16 lg:pt-0">
        <header className="hidden lg:flex h-20 items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Watchdog administration console</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Server Connection: Operational
          </div>
        </header>
        <div className="flex-grow p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto text-left">
          {children}
        </div>
      </main>
    </div>
  );
}
