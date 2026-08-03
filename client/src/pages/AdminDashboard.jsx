import React, { useState, useEffect, useMemo } from 'react';
import { 
  moderationAPI, representativesAPI, budgetAPI, promisesAPI, 
  districtsAPI, constituenciesAPI, partiesAPI, adminAPI 
} from '../api';
import { 
  Users, Landmark, Award, ShieldAlert, PlusCircle, Check, X, 
  MapPin, Loader2, AlertCircle, FileText, TrendingUp, Info, Trash2, ShieldCheck, ListPlus, BarChart3, PieChart as PieIcon, Building, Sliders 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';


export default function AdminDashboard({ activeTab }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [queue, setQueue] = useState([]);
  const [representatives, setRepresentatives] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Extended platform states
  const [usersList, setUsersList] = useState([]);
  const [partiesList, setPartiesList] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({ platformName: 'Nirikshan Civic Portal', maintenanceMode: 'false' });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [partyForm, setPartyForm] = useState({ name: '', logoUrl: '', manifesto: '', leaders: '' });

  // Form states
  const [repForm, setRepForm] = useState({ name: '', party: 'Nepali Congress', constituencyId: '', position: 'Member of Parliament', attendancePercent: 90, billsSponsored: 0, contactInfo: '', photoUrl: '' });
  const [budgetForm, setBudgetForm] = useState({ title: '', districtId: '', allocatedAmount: '', completionPercent: 0, description: '' });
  const [promiseForm, setPromiseForm] = useState({ title: '', description: '', officialName: '', officialRole: '', constituency: '', datePromised: new Date().toISOString().split('T')[0], sourceUrl: '' });

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    pendingItems: 0,
    totalReps: 0,
    totalBudgets: 0,
    totalBudgetAmount: 0,
  });

  // Chart Datasets
  const partyData = useMemo(() => {
    const counts = {};
    representatives.forEach(r => {
      counts[r.party] = (counts[r.party] || 0) + 1;
    });
    return Object.keys(counts).map(party => ({
      name: party,
      value: counts[party]
    }));
  }, [representatives]);

  const budgetData = useMemo(() => {
    const distMap = {};
    budgets.forEach(b => {
      const dName = b.district?.name || `District ${b.districtId}`;
      distMap[dName] = (distMap[dName] || 0) + Number(b.allocatedAmount || 0);
    });
    return Object.keys(distMap).map(name => ({
      name,
      amount: Number((distMap[name] / 10000000).toFixed(2)) // in Crore NPR
    }));
  }, [budgets]);

  const COLORS = ['#1E3A8A', '#DC2626', '#2563EB', '#991B1B', '#D97706', '#4B5563', '#10B981', '#8B5CF6'];

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [queueData, repsData, budgetsData, districtsData, constituenciesData] = await Promise.all([
        moderationAPI.getQueue(),
        representativesAPI.getAll(),
        budgetAPI.getAll(),
        districtsAPI.getAll(),
        constituenciesAPI.getAll()
      ]);

      setQueue(queueData);
      setRepresentatives(repsData);
      setBudgets(budgetsData);
      setDistricts(districtsData);
      setConstituencies(constituenciesData);

      // Admin-only metrics
      try {
        const uList = await adminAPI.getUsers();
        setUsersList(uList);
      } catch (e) {
        console.warn('User directory restricted for moderators.');
      }

      try {
        const pList = await partiesAPI.getAll();
        setPartiesList(pList);
      } catch (e) {
        console.warn('Political party registry access restricted.');
      }

      try {
        const settingsMap = await adminAPI.getSettings();
        if (settingsMap && Object.keys(settingsMap).length > 0) {
          setPlatformSettings(settingsMap);
        }
      } catch (e) {
        console.warn('System settings access restricted.');
      }

      // Pre-fill dropdown defaults
      if (districtsData.length > 0 && !budgetForm.districtId) {
        setBudgetForm(prev => ({ ...prev, districtId: districtsData[0].id }));
      }
      if (constituenciesData.length > 0 && !repForm.constituencyId) {
        setRepForm(prev => ({ ...prev, constituencyId: constituenciesData[0].id }));
      }

      // Calculate stats
      const totalAmount = budgetsData.reduce((sum, item) => sum + Number(item.allocatedAmount || 0), 0);
      setStats({
        pendingItems: queueData.length,
        totalReps: repsData.length,
        totalBudgets: budgetsData.length,
        totalBudgetAmount: totalAmount,
      });

    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModerationAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await moderationAPI.approve(id);
      } else {
        await moderationAPI.reject(id);
      }
      setQueue(prev => prev.filter(item => item.id !== id));
      setStats(prev => ({ ...prev, pendingItems: prev.pendingItems - 1 }));
    } catch (err) {
      console.error(err);
      alert(`Action failed: ${err.response?.data?.error || 'Server error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateRepresentative = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      await representativesAPI.create(repForm);
      setFormSuccess('Representative registered successfully!');
      setRepForm({ name: '', party: 'Nepali Congress', constituencyId: constituencies[0]?.id || '', position: 'Member of Parliament', attendancePercent: 90, billsSponsored: 0, contactInfo: '', photoUrl: '' });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to register representative.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      await budgetAPI.create(budgetForm);
      setFormSuccess('Budget project allocated successfully!');
      setBudgetForm({ title: '', districtId: districts[0]?.id || '', allocatedAmount: '', completionPercent: 0, description: '' });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to allocate budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePromise = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      await promisesAPI.create(promiseForm);
      setFormSuccess('Campaign promise published successfully!');
      setPromiseForm({ title: '', description: '', officialName: '', officialRole: '', constituency: '', datePromised: new Date().toISOString().split('T')[0], sourceUrl: '' });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to publish promise.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      setFormSuccess('User account status updated successfully.');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to modify account status.');
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setFormSuccess('User access permissions configured successfully.');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to assign user role.');
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      await partiesAPI.create(partyForm);
      setFormSuccess('Political party created successfully!');
      setPartyForm({ name: '', logoUrl: '', manifesto: '', leaders: '' });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to register party.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      await adminAPI.saveSettings(platformSettings);
      setFormSuccess('Platform configurations applied successfully.');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to apply configurations.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-temple-brass mb-4" />
        <p className="text-sm font-medium">Loading administrative dossier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Messages */}
      {(formSuccess || formError || error) && (
        <div className="animate-fade-in space-y-2">
          {formSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-4 rounded-lg flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {formSuccess}
            </div>
          )}
          {(formError || error) && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              {formError || error}
            </div>
          )}
        </div>
      )}

      {/* TABS CONTROLLER */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.pendingItems}</h3>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">Moderation requests waiting review</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Representatives</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.totalReps}</h3>
                </div>
                <div className="p-3 bg-temple-brass/10 border border-temple-brass/20 text-temple-brass rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">Total cataloged representatives</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Projects</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.totalBudgets}</h3>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                  <Landmark className="w-6 h-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">Rs. {(stats.totalBudgetAmount / 10000000).toFixed(1)} Crore allocated</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System State</p>
                  <h3 className="text-2xl font-bold text-emerald-400 mt-3">Live</h3>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">Neon Cloud PostgreSQL connected</p>
            </div>
          </div>

          {/* Graphics & Graphs Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Budget Allocations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-temple-brass" /> District Budget Allocations (Crore NPR)
              </h3>
              <div className="h-64 w-full text-xs">
                {budgetData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">No budget projects recorded.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }} />
                      <Bar dataKey="amount" fill="#D97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie Chart: Party Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-temple-brass" /> Representative Party Affiliations
              </h3>
              <div className="h-64 w-full text-xs flex items-center justify-center">
                {partyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">No representatives loaded.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={partyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {partyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }} />
                      <Legend formatter={(value) => <span className="text-slate-300 text-[10px]">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Pending Reviews Submitter Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-temple-brass animate-pulse" /> Pending Submitter Audit Log ({queue.length})
            </h3>
            {queue.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No pending submissions logged in queue.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 font-semibold">Uploader Profile</th>
                      <th className="py-3 font-semibold">Proposed Category</th>
                      <th className="py-3 font-semibold">Description / Proposal Details</th>
                      <th className="py-3 font-semibold text-right">Proof File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {queue.map(item => (
                      <tr key={item.id} className="hover:bg-slate-950/20">
                        <td className="py-3 font-medium text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          {item.changer?.name || 'Anonymous Guest'}
                        </td>
                        <td className="py-3 capitalize">
                          {item.type === 'update' ? `Promise Status Change (to ${item.newStatus})` : item.type}
                        </td>
                        <td className="py-3 truncate max-w-xs text-slate-400">
                          {item.evidence?.description || 'N/A'}
                        </td>
                        <td className="py-3 text-right">
                          {item.evidence?.file_url ? (
                            <a 
                              href={item.evidence.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-temple-brass hover:underline font-semibold"
                            >
                              View Proof &rarr;
                            </a>
                          ) : (
                            <span className="text-slate-600">None Provided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-temple-brass" /> Administrative Quick Guide
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Welcome to the **Nirikshan Watchdog Administration Panel**. As an administrator or moderator, you have the authority to manage election datasets, register newly elected representatives, and allocate municipal budget tracker projects. Additionally, you are responsible for checking the Verification Queue to approve or reject community feedback, anonymous citizen grievances, and campaign status updates.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-temple-brass" /> Verification Queue ({queue.length})
            </h3>
          </div>

          {queue.length === 0 ? (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-400">
              No submissions currently pending moderation.
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-slate-700 transition-all">
                  <div className="flex-grow space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] text-temple-brass bg-temple-brass/10 border border-temple-brass/20 px-2 py-0.5 rounded font-semibold uppercase">{item.type}</span>
                        <h4 className="text-base font-bold text-white mt-1.5">{item.promise?.title}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Proposed Status</span>
                        <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 mt-1 inline-block uppercase">
                          {item.newStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 border-t border-b border-slate-800/80 py-3">
                      <div>
                        <span className="text-slate-500 block">Submitted By</span>
                        {item.changer?.name || 'Anonymous Citizen'}
                      </div>
                      {item.evidence?.location && (
                        <div>
                          <span className="text-slate-500 block">Location Coordinates</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-temple-brass shrink-0" />
                            {item.evidence.location.coordinates[1].toFixed(4)}, {item.evidence.location.coordinates[0].toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Details & Context</span>
                      <p className="text-sm text-slate-200">{item.evidence?.description}</p>
                    </div>

                    {item.evidence?.file_url && (
                      <div className="pt-2">
                        <a
                          href={item.evidence.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-semibold text-temple-brass hover:underline gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Uploaded Document / Image Link &rarr;
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col justify-end gap-3 min-w-[140px] border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleModerationAction(item.id, 'approve')}
                      className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleModerationAction(item.id, 'reject')}
                      className="flex-1 md:flex-initial bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'representatives' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-temple-brass" /> Register Representative
            </h3>
            <form onSubmit={handleCreateRepresentative} className="space-y-4 text-xs">
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Representative Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balendra Shah"
                  value={repForm.name}
                  onChange={e => setRepForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Political Affiliation</label>
                <select
                  value={repForm.party}
                  onChange={e => setRepForm(prev => ({ ...prev, party: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
                >
                  <option value="Nepali Congress">Nepali Congress</option>
                  <option value="CPN (UML)">CPN (UML)</option>
                  <option value="RSP">Rastriya Swatantra Party (RSP)</option>
                  <option value="CPN (Maoist Centre)">CPN (Maoist Centre)</option>
                  <option value="RPP">Rastriya Prajatantra Party (RPP)</option>
                  <option value="Independent">Independent</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Constituency ID</label>
                <select
                  value={repForm.constituencyId}
                  onChange={e => setRepForm(prev => ({ ...prev, constituencyId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
                >
                  {constituencies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.province})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Official Position</label>
                <input
                  type="text"
                  placeholder="e.g. Member of Parliament"
                  value={repForm.position}
                  onChange={e => setRepForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-semibold">Attendance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={repForm.attendancePercent}
                    onChange={e => setRepForm(prev => ({ ...prev, attendancePercent: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-semibold">Bills Sponsored</label>
                  <input
                    type="number"
                    min="0"
                    value={repForm.billsSponsored}
                    onChange={e => setRepForm(prev => ({ ...prev, billsSponsored: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Contact Email/Phone</label>
                <input
                  type="text"
                  placeholder="e.g. balen@kathmandu.gov.np"
                  value={repForm.contactInfo}
                  onChange={e => setRepForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://unsplash.com/photos/..."
                  value={repForm.photoUrl}
                  onChange={e => setRepForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-temple-brass hover:bg-temple-brass/90 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 mt-2 text-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Submit Registration
              </button>
            </form>
          </div>

          {/* List Display */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-temple-brass" /> Active Representatives Directory ({representatives.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 font-semibold">Name</th>
                    <th className="py-3 font-semibold">Party</th>
                    <th className="py-3 font-semibold">Constituency</th>
                    <th className="py-3 font-semibold text-center">Attendance</th>
                    <th className="py-3 font-semibold text-center">Bills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {representatives.slice(0, 15).map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-medium text-white">{rep.name}</td>
                      <td className="py-3">{rep.party}</td>
                      <td className="py-3">{rep.constituency?.name || rep.constituencyId}</td>
                      <td className="py-3 text-center">{rep.attendancePercent || 0}%</td>
                      <td className="py-3 text-center">{rep.billsSponsored || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {representatives.length > 15 && (
                <p className="text-[10px] text-slate-500 italic mt-3 text-center">Showing first 15 records in administrator view.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Allocate Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-temple-brass" /> Allocate Budget Project
            </h3>
            <form onSubmit={handleCreateBudget} className="space-y-4 text-xs">
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ring Road Extension Phase II"
                  value={budgetForm.title}
                  onChange={e => setBudgetForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">District Scope</label>
                <select
                  value={budgetForm.districtId}
                  onChange={e => setBudgetForm(prev => ({ ...prev, districtId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.province})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Allocated Amount (NPR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000000"
                  value={budgetForm.allocatedAmount}
                  onChange={e => setBudgetForm(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Completion %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={budgetForm.completionPercent}
                  onChange={e => setBudgetForm(prev => ({ ...prev, completionPercent: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Description / Notes</label>
                <textarea
                  placeholder="Detailed project roadmap, audit summaries, or milestones..."
                  rows="4"
                  value={budgetForm.description}
                  onChange={e => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-temple-brass hover:bg-temple-brass/90 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 mt-2 text-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Submit Allocation
              </button>
            </form>
          </div>

          {/* List Display */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-temple-brass" /> Budget Projects ledger ({budgets.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 font-semibold">Project Title</th>
                    <th className="py-3 font-semibold">District</th>
                    <th className="py-3 font-semibold text-right">Allocated Amount</th>
                    <th className="py-3 font-semibold text-center">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {budgets.map(b => (
                    <tr key={b.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-medium text-white">{b.title}</td>
                      <td className="py-3">{b.district?.name || b.districtId}</td>
                      <td className="py-3 text-right font-mono">Rs. {Number(b.allocatedAmount).toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold">
                          {b.completionPercent || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'promises' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <PlusCircle className="w-5 h-5 text-temple-brass" /> Publish Campaign Promise
          </h3>
          <form onSubmit={handleCreatePromise} className="space-y-4 text-xs">
            <div className="space-y-1.5 text-left">
              <label className="text-slate-400 font-semibold">Promise Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Free Secondary Education for Girls"
                value={promiseForm.title}
                onChange={e => setPromiseForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-slate-400 font-semibold">Description / Pledge Details</label>
              <textarea
                required
                placeholder="Detail what exactly was pledged, the timeline, and scope of this campaign promise..."
                rows="5"
                value={promiseForm.description}
                onChange={e => setPromiseForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Official Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KP Sharma Oli"
                  value={promiseForm.officialName}
                  onChange={e => setPromiseForm(prev => ({ ...prev, officialName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Official Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prime Minister"
                  value={promiseForm.officialRole}
                  onChange={e => setPromiseForm(prev => ({ ...prev, officialRole: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Constituency Scope</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jhapa 5"
                  value={promiseForm.constituency}
                  onChange={e => setPromiseForm(prev => ({ ...prev, constituency: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Date Promised</label>
                <input
                  type="date"
                  required
                  value={promiseForm.datePromised}
                  onChange={e => setPromiseForm(prev => ({ ...prev, datePromised: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-slate-400 font-semibold">Source URL (Declaration / News Link)</label>
              <input
                type="url"
                placeholder="e.g. https://ekantipur.com/news/..."
                value={promiseForm.sourceUrl}
                onChange={e => setPromiseForm(prev => ({ ...prev, sourceUrl: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-temple-brass hover:bg-temple-brass/90 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 mt-4 text-sm"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Publish Verified Promise
            </button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-temple-brass" /> User Management
            </h3>
            <input
              type="text"
              placeholder="Search citizens by name or email..."
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass w-full sm:w-72"
            />
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/20">
                  <th className="p-4 font-semibold">User Details</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Account Status</th>
                  <th className="p-4 font-semibold text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {usersList
                  .filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase())))
                  .map(u => (
                    <tr key={u.id} className="hover:bg-slate-950/20">
                      <td className="p-4">
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.email || 'Anonymous Session'}</p>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-temple-brass"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="moderator">Moderator</option>
                          <option value="government_office">Government Office</option>
                          <option value="admin">Administrator</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold capitalize text-[10px] ${
                          u.status === 'active' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800' :
                          u.status === 'suspended' ? 'bg-amber-950/40 text-amber-400 border border-amber-800' :
                          'bg-red-950/40 text-red-400 border border-red-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {u.status !== 'suspended' && (
                          <button
                            onClick={() => handleUserStatusChange(u.id, 'suspended')}
                            className="px-2.5 py-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/20 rounded font-semibold text-[10px] transition-all"
                          >
                            Suspend
                          </button>
                        )}
                        {u.status !== 'banned' && (
                          <button
                            onClick={() => handleUserStatusChange(u.id, 'banned')}
                            className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded font-semibold text-[10px] transition-all"
                          >
                            Ban
                          </button>
                        )}
                        {u.status !== 'active' && (
                          <button
                            onClick={() => handleUserStatusChange(u.id, 'active')}
                            className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded font-semibold text-[10px] transition-all"
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'parties' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 h-fit">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Building className="w-5 h-5 text-temple-brass" /> Register Party
            </h3>
            <form onSubmit={handleCreateParty} className="space-y-4 text-xs">
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Party Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CPN (Unified Socialist)"
                  value={partyForm.name}
                  onChange={e => setPartyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Logo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={partyForm.logoUrl}
                  onChange={e => setPartyForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Key Leaders</label>
                <input
                  type="text"
                  placeholder="e.g. Madhav Kumar Nepal"
                  value={partyForm.leaders}
                  onChange={e => setPartyForm(prev => ({ ...prev, leaders: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-slate-400 font-semibold">Manifesto Highlight Summary</label>
                <textarea
                  placeholder="Core pledges and ideology..."
                  rows="4"
                  value={partyForm.manifesto}
                  onChange={e => setPartyForm(prev => ({ ...prev, manifesto: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-temple-brass"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-temple-brass hover:bg-temple-brass/90 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 text-xs"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Add Party Profile
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-temple-brass" /> Registered Entities ({partiesList.length})
            </h3>
            {partiesList.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-12">No political parties registered in database.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partiesList.map(p => (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-4 hover:border-slate-700 transition-all">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-white rounded border border-slate-800 p-1" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-500">P</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate text-sm">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Leaders: {p.leaders || 'N/A'}</p>
                      <p className="text-[10px] text-slate-500 italic mt-2 line-clamp-3 leading-relaxed">{p.manifesto || 'No manifesto summary uploaded.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Sliders className="w-5 h-5 text-temple-brass" /> Platform Configuration Manager
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="space-y-1.5 text-left">
              <label className="text-slate-400 font-semibold">Platform Portal Name</label>
              <input
                type="text"
                value={platformSettings.platformName}
                onChange={e => setPlatformSettings(prev => ({ ...prev, platformName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-slate-400 font-semibold">Maintenance State Mode</label>
              <select
                value={platformSettings.maintenanceMode}
                onChange={e => setPlatformSettings(prev => ({ ...prev, maintenanceMode: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-temple-brass"
              >
                <option value="false">Operational (Live Feed Active)</option>
                <option value="true">Under Maintenance (Read-Only Mode)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-temple-brass hover:bg-temple-brass/90 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 text-sm mt-4"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Configuration Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
