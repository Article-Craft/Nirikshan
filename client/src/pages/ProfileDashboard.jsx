import React, { useState, useEffect } from 'react';
import { authAPI, complaintsAPI } from '../api';
import { 
  User, Mail, Phone, MapPin, Briefcase, Building, ShieldCheck, 
  Trash2, AlertTriangle, Check, Loader2, List, Shield, Bell, Eye, EyeOff 
} from 'lucide-react';

export default function ProfileDashboard({ setUser }) {
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tabs: 'overview' | 'edit' | 'security' | 'accessibility'
  const [activeTab, setActiveTab] = useState('overview');

  // Form profile state
  const [form, setForm] = useState({
    name: '', bio: '', phone: '', photoUrl: '', coverUrl: '', 
    occupation: '', organization: '', province: '', district: '', municipality: ''
  });

  // Local accessibility options
  const [contrastMode, setContrastMode] = useState(() => localStorage.getItem('accessibility_contrast') === 'true');
  const [fontScale, setFontScale] = useState(() => localStorage.getItem('accessibility_font') || 'normal');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const userProfile = await authAPI.getMe();
      setProfile(userProfile);
      setForm({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        photoUrl: userProfile.photoUrl || '',
        coverUrl: userProfile.coverUrl || '',
        occupation: userProfile.occupation || '',
        organization: userProfile.organization || '',
        province: userProfile.province || '',
        district: userProfile.district || '',
        municipality: userProfile.municipality || ''
      });

      // Fetch citizen complaints list
      const list = await complaintsAPI.getAll({ status: 'all' });
      // Filter locally for this user
      setComplaints(list.filter(c => c.isAnonymous === false)); // Simple local filter
    } catch (err) {
      console.error(err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await authAPI.updateProfile(form);
      setSuccess('Profile details saved successfully.');
      setProfile(res.user);
      // Sync App-level user state
      localStorage.setItem('nirikshan_user', JSON.stringify(res.user));
      setUser(res.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your profile? You will be signed out.')) return;
    try {
      await authAPI.deactivate();
      localStorage.removeItem('nirikshan_token');
      localStorage.removeItem('nirikshan_user');
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      alert('Deactivation failed.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('WARNING: Permanently delete your account? This action is irreversible.')) return;
    try {
      await authAPI.deleteAccount();
      localStorage.removeItem('nirikshan_token');
      localStorage.removeItem('nirikshan_user');
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      alert('Deletion failed.');
    }
  };

  const toggleContrast = () => {
    const next = !contrastMode;
    setContrastMode(next);
    localStorage.setItem('accessibility_contrast', String(next));
    if (next) {
      document.documentElement.classList.add('contrast-high');
    } else {
      document.documentElement.classList.remove('contrast-high');
    }
  };

  const changeFont = (scale) => {
    setFontScale(scale);
    localStorage.setItem('accessibility_font', scale);
    document.documentElement.style.fontSize = scale === 'large' ? '18px' : scale === 'small' ? '14px' : '16px';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-temple-brass mb-4" />
        <p className="text-sm font-semibold">Retrieving citizen dossier...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Cover and header card */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
        <div className="h-44 bg-gradient-to-r from-pagoda-wood to-slate-800 relative">
          {profile.coverUrl && <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />}
        </div>
        <div className="px-6 py-6 flex flex-col sm:flex-row items-center sm:items-end -mt-16 gap-6 relative z-10">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="Avatar" className="w-28 h-28 object-cover rounded-full border-4 border-white bg-slate-100 shadow-md" />
          ) : (
            <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center font-bold text-slate-400 text-3xl shadow-md uppercase">
              {profile.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left space-y-1 pb-2">
            <h1 className="text-2xl font-serif font-extrabold text-pagoda-wood flex items-center justify-center sm:justify-start gap-2">
              {profile.name}
              {profile.verificationBadge && <ShieldCheck className="w-5 h-5 text-temple-brass" />}
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">{profile.role} account</p>
            <p className="text-sm text-slate-600 font-medium max-w-2xl">{profile.bio || 'No biography details provided.'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar settings links */}
        <div className="lg:col-span-1 space-y-1 bg-white border border-slate-200 p-4 rounded h-fit">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'bg-pagoda-wood text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            Overview Dashboard
          </button>
          <button onClick={() => setActiveTab('edit')} className={`w-full text-left px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'edit' ? 'bg-pagoda-wood text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            Edit Information
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full text-left px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'security' ? 'bg-pagoda-wood text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            Security Settings
          </button>
          <button onClick={() => setActiveTab('accessibility')} className={`w-full text-left px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'accessibility' ? 'bg-pagoda-wood text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            Accessibility Preferences
          </button>
        </div>

        {/* Content body */}
        <div className="lg:col-span-3">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded mb-6 text-sm font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6 text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile details grid */}
              <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
                <h3 className="text-base font-bold text-pagoda-wood mb-4">Contact & Location dossiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-temple-brass" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Email Address</p>
                      <p className="text-pagoda-wood font-semibold mt-0.5">{profile.email || 'None Linked'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-temple-brass" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Phone Number</p>
                      <p className="text-pagoda-wood font-semibold mt-0.5">{profile.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-temple-brass" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Municipal Address</p>
                      <p className="text-pagoda-wood font-semibold mt-0.5">{[profile.municipality, profile.district, profile.province].filter(Boolean).join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-temple-brass" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Occupation</p>
                      <p className="text-pagoda-wood font-semibold mt-0.5">{profile.occupation || 'N/A'} {profile.organization ? `@ ${profile.organization}` : ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submissions feed */}
              <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
                <h3 className="text-base font-bold text-pagoda-wood mb-4">Your Grievance Submissions ({complaints.length})</h3>
                {complaints.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">You have not submitted any public grievances yet.</p>
                ) : (
                  <div className="space-y-4">
                    {complaints.map(c => (
                      <div key={c.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-pagoda-wood capitalize">{c.serviceType} issue</p>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] rounded font-bold capitalize border ${
                          c.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
              <h3 className="text-base font-bold text-pagoda-wood mb-6">Modify Profile Info</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500">Full Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Phone</label>
                    <input type="text" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Avatar Photo Link</label>
                  <input type="url" placeholder="https://..." value={form.photoUrl} onChange={e => setForm(prev => ({ ...prev, photoUrl: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Biography</label>
                  <textarea rows="3" value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass"></textarea>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500">Province</label>
                    <input type="text" value={form.province} onChange={e => setForm(prev => ({ ...prev, province: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">District</label>
                    <input type="text" value={form.district} onChange={e => setForm(prev => ({ ...prev, district: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Municipality</label>
                    <input type="text" value={form.municipality} onChange={e => setForm(prev => ({ ...prev, municipality: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500">Occupation</label>
                    <input type="text" value={form.occupation} onChange={e => setForm(prev => ({ ...prev, occupation: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Organization</label>
                    <input type="text" value={form.organization} onChange={e => setForm(prev => ({ ...prev, organization: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none focus:border-temple-brass" />
                  </div>
                </div>

                <button type="submit" disabled={actionLoading} className="px-6 py-3 bg-temple-brass text-white font-bold rounded hover:bg-temple-brass/90 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Profile Details
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-pagoda-wood mb-2">Account Self-Service</h3>
                <p className="text-xs text-slate-500">Manage account deactivations or permanent deletion logs.</p>
              </div>

              <div className="border border-red-200 bg-red-50/20 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-red-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Deactivate Citizen Account
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">Deactivating hides your name and reviews from public grids, putting account in dormant state.</p>
                </div>
                <button onClick={handleDeactivate} className="px-4 py-2 bg-red-600 text-white font-bold rounded text-xs hover:bg-red-700 transition-colors">
                  Deactivate
                </button>
              </div>

              <div className="border border-slate-200 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-slate-500" /> Delete Account Permanently
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">This will delete all uploaded feedback and profile data from the PostgreSQL cluster.</p>
                </div>
                <button onClick={handleDelete} className="px-4 py-2 border border-slate-300 hover:border-red-600 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold rounded text-xs transition-colors">
                  Delete Permanently
                </button>
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-pagoda-wood mb-2">Accessibility Preferences</h3>
                <p className="text-xs text-slate-500">Configure visual themes and font scale preferences locally.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-slate-800">High Contrast Mode</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Increases text clarity for visually impaired users.</p>
                  </div>
                  <button onClick={toggleContrast} className={`px-4 py-2 rounded text-xs font-bold transition-all ${contrastMode ? 'bg-pagoda-wood text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                    {contrastMode ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="flex justify-between items-center pb-4">
                  <div>
                    <h4 className="text-slate-800">Font Scaling Size</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Adjust relative text dimensions for reading comfort.</p>
                  </div>
                  <div className="flex gap-2">
                    {['small', 'normal', 'large'].map(scale => (
                      <button key={scale} onClick={() => changeFont(scale)} className={`px-3 py-1.5 capitalize rounded text-xs font-bold transition-all ${fontScale === scale ? 'bg-pagoda-wood text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
