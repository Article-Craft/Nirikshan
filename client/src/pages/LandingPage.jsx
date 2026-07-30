import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Shield, FileText, Map, BarChart3, AlertTriangle, ArrowRight, 
  CheckCircle2, KeyRound, UserPlus, Landmark, Users, Mail, Phone, 
  MapPin, Globe, Search, Heart, Award, Sparkles, Building, AlertCircle
} from 'lucide-react';
import { authAPI, districtsAPI, constituenciesAPI, representativesAPI } from '../api';

export const PARTIES = {
  'NC': { name: 'Nepali Congress', short: 'NC', color: '#1E3A8A' },
  'CPN (UML)': { name: 'CPN (UML)', short: 'UML', color: '#DC2626' },
  'RSP': { name: 'Rastriya Swatantra Party', short: 'RSP', color: '#2563EB' },
  'CPN (Maoist Centre)': { name: 'CPN (Maoist Centre)', short: 'MC', color: '#991B1B' },
  'RPP': { name: 'Rastriya Prajatantra Party', short: 'RPP', color: '#D97706' },
  'Independent': { name: 'Independent', short: 'IND', color: '#4B5563' }
};

const normalizeName = (name) => {
  if (!name) return '';
  let n = name.toUpperCase().trim();
  if (n === 'KAVREPALANCHOWK') return 'KAVREPALANCHOK';
  if (n === 'DHANUSA') return 'DHANUSHA';
  if (n === 'TANAHU') return 'TANAHUN';
  if (n === 'PARASI') return 'NAWALPARASI';
  if (n === 'TEHRATHUM') return 'TERHATHUM';
  return n;
};

export default function LandingPage({ setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passwordReadOnly, setPasswordReadOnly] = useState(true);

  // Map and Data states
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);
  const [constituenciesList, setConstituenciesList] = useState([]);
  const [representativesList, setRepresentativesList] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  // Selected district for detail modal/drawer
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showDistrictPortal, setShowDistrictPortal] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const geojsonLayerRef = useRef(null);

  // Fetch data
  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      fetch('/data/nepal-districts.json').then((res) => {
        if (!res.ok) throw new Error('Failed to fetch map data');
        return res.json();
      }),
      districtsAPI.getAll(),
      constituenciesAPI.getAll(),
      representativesAPI.getAll()
    ])
      .then(([geoJson, districts, constituencies, representatives]) => {
        setGeoJsonData(geoJson);
        setDistrictsList(districts);
        setConstituenciesList(constituencies);
        setRepresentativesList(representatives);
        setMapLoading(false);
      })
      .catch((err) => {
        console.error('Error loading map data on home:', err);
        setMapLoading(false);
      });
  }, []);

  // Initialize Map
  // Sets up the Leaflet Map instance on the designated DOM node reference
  useEffect(() => {
    if (!mapRef.current || mapLoading || !geoJsonData) return;

    leafletMapInstance.current = L.map(mapRef.current, {
      center: [28.3949, 84.1240], // Center of Nepal
      zoom: 6.5,
      minZoom: 6,
      maxZoom: 9,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    });

    const map = leafletMapInstance.current;

    const getStyle = (feature) => {
      return {
        fillColor: '#FFFFFF',
        weight: 1,
        opacity: 0.8,
        color: '#94A3B8', // slate-300
        fillOpacity: 0.9
      };
    };

    const onEachFeature = (feature, layer) => {
      const distName = feature.properties.DISTRICT || feature.properties.name || '';
      const formattedName = distName.charAt(0) + distName.slice(1).toLowerCase();
      
      // Match with database district record
      const normalizedFeatureName = normalizeName(distName);
      const matchedDistrict = districtsList.find(d => normalizeName(d.name) === normalizedFeatureName);

      // Tooltip HTML content
      let tooltipContent = `<div class="p-2.5 font-sans text-xs">`;
      tooltipContent += `<div class="font-bold text-pagoda-wood text-sm">${formattedName} District</div>`;
      tooltipContent += `<div class="text-slate-basalt/80 mt-1">Province: ${matchedDistrict?.province || 'Unavailable'}</div>`;
      tooltipContent += `<div class="text-slate-basalt/80">Population: ${matchedDistrict?.population || 'Unavailable'}</div>`;
      
      if (matchedDistrict?.cdoName) {
        tooltipContent += `<div class="mt-1.5 pt-1.5 border-t border-slate-200 text-slate-basalt"><span class="font-semibold text-nepal-red">CDO:</span> ${matchedDistrict.cdoName}</div>`;
      } else {
        tooltipContent += `<div class="mt-1.5 pt-1.5 border-t border-slate-200 text-amber-700 italic">CDO details pending official verification</div>`;
      }

      if (matchedDistrict?.mayorName) {
        tooltipContent += `<div class="text-slate-basalt"><span class="font-semibold text-temple-brass">Mayor:</span> ${matchedDistrict.mayorName}</div>`;
      }
      
      tooltipContent += `</div>`;

      layer.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'auto',
        className: 'leaflet-custom-tooltip'
      });

      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({
            weight: 2,
            color: '#DC2626', // Nepal Red
            fillColor: '#FEF2F2', // Soft Red Tint
            fillOpacity: 0.95
          });
          l.bringToFront();
        },
        mouseout: (e) => {
          geojsonLayerRef.current.resetStyle(e.target);
        },
        click: () => {
          if (matchedDistrict) {
            setSelectedDistrict(matchedDistrict);
            setShowDistrictPortal(true);
          } else {
            // For unverified districts, show basic details
            setSelectedDistrict({
              name: formattedName,
              province: matchedDistrict?.province || 'Unavailable',
              daoAddress: null,
              cdoName: null
            });
            setShowDistrictPortal(true);
          }
        }
      });
    };

    geojsonLayerRef.current = L.geoJSON(geoJsonData, {
      style: getStyle,
      onEachFeature: onEachFeature
    }).addTo(map);

    try {
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [10, 10] });
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [mapLoading, geoJsonData, districtsList]);

  // Handle Quick Login
  const handleQuickFill = (role) => {
    setActiveTab('login');
    setEmail(`demo_${role}@nirikshan.gov.np`);
    setPassword('password123');
    // Scroll to login card
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Submit Login/Signup Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (activeTab === 'login') {
        response = await authAPI.login({ email: trimmedEmail, password: trimmedPassword });
      } else if (activeTab === 'signup') {
        response = await authAPI.register({ name: name.trim(), email: trimmedEmail, password: trimmedPassword, role: 'citizen' });
      }

      localStorage.setItem('nirikshan_token', response.token);
      localStorage.setItem('nirikshan_user', JSON.stringify(response.user));
      setUser(response.user);
      navigate('/promises');
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Unable to connect to the backend server. Please verify the backend is running.');
      } else {
        setError(err.response?.data?.error || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Global Search logic
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase().trim();

    const matchedDistricts = districtsList
      .filter(d => d.name.toLowerCase().includes(query))
      .map(d => ({
        type: 'district',
        name: d.name,
        label: `${d.name} (District)`,
        data: d
      }));

    const matchedReps = representativesList
      .filter(r => r.name.toLowerCase().includes(query))
      .map(r => ({
        type: 'representative',
        name: r.name,
        label: `${r.name} (${PARTIES[r.party]?.short || 'MP'})`,
        data: r
      }));

    return [...matchedDistricts, ...matchedReps].slice(0, 6);
  }, [searchQuery, districtsList, representativesList]);

  // Click Suggestion
  const handleSelectSuggestion = (s) => {
    setSearchQuery('');
    setShowSuggestions(false);
    if (s.type === 'district') {
      setSelectedDistrict(s.data);
      setShowDistrictPortal(true);
    } else if (s.type === 'representative') {
      navigate(`/representative/${s.data.id}`);
    }
  };

  // Find representative matching clicked district
  const matchedRepsForDistrict = useMemo(() => {
    if (!selectedDistrict) return [];
    // Get constituencies in selected district
    const cIds = constituenciesList
      .filter(c => c.districtId === selectedDistrict.id)
      .map(c => c.id);
    return representativesList.filter(r => cIds.includes(r.constituencyId));
  }, [selectedDistrict, constituenciesList, representativesList]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-basalt selection:bg-nepal-red selection:text-white font-sans">
      
      {/* Editorial Hero Layout */}
      <div className="relative border-b border-slate-200 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Vision & Brand */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-sm">
                <Landmark className="w-3.5 h-3.5 text-nepal-red" />
                NEPAL CIVIC INTEGRITY PORTAL
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-pagoda-wood leading-tight tracking-tight">
                Nepal's Civic Accountability Platform.
              </h1>
              
              <p className="text-lg text-slate-basalt/80 font-normal leading-relaxed max-w-xl">
                Track leaders. Monitor promises. Report local issues. Follow public progress. Nirikshan is a dedicated, data-first civic portal ensuring total transparency in municipal budgets, constituency development, and administrative accountability.
              </p>

              {/* Powerful Search Bar */}
              <div className="relative max-w-lg">
                <div className="flex items-center border-2 border-pagoda-wood rounded bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-nepal-red/20 focus-within:border-nepal-red">
                  <div className="pl-3">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search district, representative, or promises..."
                    className="w-full py-3.5 px-3 text-sm font-medium focus:outline-none bg-transparent"
                  />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 overflow-hidden">
                    {filteredSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs font-semibold flex justify-between items-center border-b border-slate-100 last:border-0"
                      >
                        <span className="text-pagoda-wood">{s.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Grid */}
              <div className="space-y-3 pt-2">
                <div className="text-xs uppercase tracking-widest font-bold text-slate-400">Quick Actions</div>
                <div className="flex flex-wrap gap-2.5">
                  <Link to="/directory" className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-xs font-semibold rounded text-slate-700 transition-colors">
                    View Election Results
                  </Link>
                  <Link to="/map" className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-xs font-semibold rounded text-slate-700 transition-colors">
                    Explore Nepal Map
                  </Link>
                  <Link to="/promises" className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-xs font-semibold rounded text-slate-700 transition-colors">
                    Track Promises
                  </Link>
                  <Link to="/rti" className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-xs font-semibold rounded text-slate-700 transition-colors">
                    Report an Issue
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column: Centerpiece Map */}
            <div className="lg:col-span-6 w-full flex flex-col justify-center items-center">
              <div className="w-full bg-[#FFFFFF] border border-slate-200 rounded p-4 shadow-sm relative">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">REAL-TIME INTERACTIVE MAP</span>
                  <span className="text-[10px] bg-red-50 text-nepal-red px-2 py-0.5 rounded font-bold uppercase border border-red-100">FPTP Districts</span>
                </div>
                
                {mapLoading ? (
                  <div className="h-[400px] w-full flex items-center justify-center bg-slate-50 rounded border border-dashed border-slate-200">
                    <div className="flex flex-col items-center space-y-2">
                      <span className="w-8 h-8 border-2 border-nepal-red border-t-transparent rounded-full animate-spin"></span>
                      <span className="text-xs text-slate-400 font-semibold">Loading national GIS data...</span>
                    </div>
                  </div>
                ) : (
                  <div ref={mapRef} className="h-[400px] w-full z-10 rounded border border-slate-100"></div>
                )}
                <div className="text-[11px] text-slate-400 mt-2.5 text-center leading-relaxed font-medium">
                  Hover to preview. Click any district to open the official mini-portal.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* District Mini-Portal Sidebar / Drawer */}
      {showDistrictPortal && selectedDistrict && (
        <div className="fixed inset-0 bg-pagoda-wood/40 backdrop-blur-sm z-[9999] flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200 text-left">
            
            {/* Portal Header */}
            <div className="p-6 border-b border-slate-100 bg-[#FAF9F6] flex justify-between items-center sticky top-0 z-10">
              <div>
                <span className="text-[10px] bg-nepal-red/10 text-nepal-red font-bold px-2 py-0.5 rounded uppercase">{selectedDistrict.province}</span>
                <h2 className="text-2xl font-serif font-extrabold text-pagoda-wood mt-1">{selectedDistrict.name} District</h2>
              </div>
              <button 
                onClick={() => setShowDistrictPortal(false)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm border border-slate-200"
              >
                Close Portal
              </button>
            </div>

            {/* Portal Body */}
            <div className="p-6 space-y-8 flex-grow">
              
              {/* Geographical Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Headquarters</div>
                  <div className="text-sm font-bold text-pagoda-wood mt-0.5">{selectedDistrict.headquarters || 'Unavailable'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Area Size</div>
                  <div className="text-sm font-bold text-pagoda-wood mt-0.5">{selectedDistrict.areaSqKm || 'Unavailable'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Population</div>
                  <div className="text-sm font-bold text-pagoda-wood mt-0.5">{selectedDistrict.population || 'Unavailable'}</div>
                </div>
              </div>

              {/* Administrative Officers */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Administrative Secretariat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  
                  {/* CDO Profile */}
                  <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
                    <div className="text-[10px] font-bold text-nepal-red uppercase">Chief District Officer (CDO)</div>
                    {selectedDistrict.cdoName ? (
                      <div className="mt-2 space-y-1.5">
                        <div className="text-sm font-extrabold text-pagoda-wood">{selectedDistrict.cdoName}</div>
                        <div className="text-xs text-slate-basalt flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedDistrict.daoContact || 'N/A'}</div>
                        <div className="text-xs text-slate-basalt flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedDistrict.daoEmail || 'N/A'}</div>
                        <div className="text-xs text-slate-basalt flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> {selectedDistrict.daoAddress || 'N/A'}</div>
                        {selectedDistrict.daoWebsite && (
                          <a href={selectedDistrict.daoWebsite} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold"><Globe className="w-3.5 h-3.5" /> Visit Official DAO</a>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 italic mt-3 bg-amber-50 p-2 border border-amber-100 rounded flex gap-1.5 items-center">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> CDO details pending verification
                      </div>
                    )}
                  </div>

                  {/* Assistant CDO & Local Govt */}
                  <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
                    <div className="text-[10px] font-bold text-temple-brass uppercase">Assistant CDO & Municipalities</div>
                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">Assistant CDO</div>
                        <div className="text-xs font-bold text-pagoda-wood">{selectedDistrict.assistantCdo || 'Unavailable'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Municipalities</div>
                          <div className="text-xs font-bold text-pagoda-wood">{selectedDistrict.municipalitiesCount ?? 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Rural Mun.</div>
                          <div className="text-xs font-bold text-pagoda-wood">{selectedDistrict.ruralMunicipalitiesCount ?? 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Mayor & Municipal Leadership */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Headquarters Municipality Mayor</h3>
                <div className="bg-slate-50 p-4 border border-slate-100 rounded">
                  {selectedDistrict.mayorName ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Mayor, Headquarters Municipality</div>
                        <div className="text-base font-extrabold text-pagoda-wood mt-0.5">{selectedDistrict.mayorName}</div>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded">Elected Executive</span>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 italic bg-amber-50 p-2.5 rounded border border-amber-100 flex gap-1.5 items-center">
                      <AlertCircle className="w-4 h-4" /> Mayor records pending integration
                    </div>
                  )}
                </div>
              </div>

              {/* Representatives (MPs) */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Elected Members of Parliament (MPs)</h3>
                {matchedRepsForDistrict.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchedRepsForDistrict.map((rep) => (
                      <Link 
                        key={rep.id} 
                        to={`/representative/${rep.id}`}
                        className="bg-white p-3.5 border border-slate-200 hover:border-nepal-red rounded shadow-sm hover:shadow transition-all group flex items-center gap-3"
                      >
                        <img 
                          src={rep.photoUrl || '/avatar.png'} 
                          alt={rep.name} 
                          className="w-10 h-10 object-cover rounded-full bg-slate-100 border border-slate-200" 
                        />
                        <div className="text-left">
                          <div className="text-xs font-bold text-pagoda-wood group-hover:text-nepal-red transition-colors">{rep.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{rep.party}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No representatives mapped for this district yet.</div>
                )}
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">District Emergency Contacts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded border border-slate-100 flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-nepal-red flex-shrink-0" />
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Police Headquarters</div>
                      <div className="text-xs font-extrabold text-pagoda-wood">{selectedDistrict.policeContact || 'Unavailable'}</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100 flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Emergency Operations</div>
                      <div className="text-xs font-extrabold text-pagoda-wood">{selectedDistrict.emergencyContact || 'Unavailable'}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Portal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10 text-center">
              <Link 
                to="/map" 
                className="w-full inline-flex justify-center items-center gap-1.5 py-3 bg-pagoda-wood hover:bg-nepal-red text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                Go to Dedicated GIS Map Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Platform Features Grid */}
      <section className="py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-nepal-red">THE CORES OF Accountability</h2>
            <p className="text-3xl sm:text-4xl font-serif font-extrabold text-pagoda-wood tracking-tight">
              Providing Nepalese citizens with a decentralized government accountability audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 border border-slate-200 rounded hover:shadow-md transition-all group flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 bg-red-50 text-nepal-red flex items-center justify-center rounded mb-5 group-hover:bg-nepal-red/10 transition-colors">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-pagoda-wood mb-2">GIS Election Boundaries</h3>
                <p className="text-xs text-slate-basalt/80 leading-relaxed text-left">
                  Deep mapping of Nepal's 165 FPTP constituencies linked to geographic databases. Track and query local representatives directly on the map coordinates.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 border border-slate-200 rounded hover:shadow-md transition-all group flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 bg-amber-50 text-amber-700 flex items-center justify-center rounded mb-5 group-hover:bg-amber-100 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-pagoda-wood mb-2">Budget & Progress Visualizer</h3>
                <p className="text-xs text-slate-basalt/80 leading-relaxed text-left">
                  Cross-references development budget allocation files with project completion percentages. Identifies allocation anomalies and progress delays.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 border border-slate-200 rounded hover:shadow-md transition-all group flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 bg-red-50 text-nepal-red flex items-center justify-center rounded mb-5 group-hover:bg-nepal-red/10 transition-colors">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-pagoda-wood mb-2">Grievance Heatmap</h3>
                <p className="text-xs text-slate-basalt/80 leading-relaxed text-left">
                  Allows anonymous reporting of service breakages or infrastructure failure (water, roads, pollution). Pinpoints reports to visual maps to detect high-frequency municipal issue clusters.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 border border-slate-200 rounded hover:shadow-md transition-all group flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 bg-slate-100 text-slate-700 flex items-center justify-center rounded mb-5 group-hover:bg-slate-200 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-pagoda-wood mb-2">RTI Request Builder</h3>
                <p className="text-xs text-slate-basalt/80 leading-relaxed text-left">
                  Assists citizens in compiling official Right to Information request PDFs formatted per the Right to Information Act of Nepal, simplifying municipal queries.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Access Portal Section */}
      <section id="auth-section" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Info Panel */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h2 className="text-xs uppercase tracking-widest font-extrabold text-nepal-red">JOIN THE CITIZEN WATCHDOG NETWORK</h2>
              <p className="text-3xl sm:text-4xl font-serif font-extrabold text-pagoda-wood tracking-tight">
                Participate in reporting, promise validation, and public moderation.
              </p>
              <p className="text-sm text-slate-basalt/80 leading-relaxed">
                As a registered citizen, you can upload evidence files for promises, report local service delivery failures, and monitor audit feedback from district secretariats.
              </p>
            </div>

            {/* Auth Card */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white border border-slate-200 rounded shadow-md overflow-hidden">
                <div className="h-1.5 bg-nepal-red"></div>
                <div className="p-6 sm:p-8">
                  <div className="mb-6 text-left">
                    <h3 className="text-xl font-bold text-pagoda-wood">Platform Access Portal</h3>
                    <p className="text-xs text-slate-400 mt-1">Submit updates or report grievances with secure authentication</p>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded mb-6 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setError(''); setEmail(''); setPassword(''); setEmailReadOnly(true); setPasswordReadOnly(true); }}
                      className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold transition-all rounded ${activeTab === 'login' ? 'bg-white text-pagoda-wood shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signup'); setError(''); setEmail(''); setPassword(''); setEmailReadOnly(true); setPasswordReadOnly(true); }}
                      className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold transition-all rounded ${activeTab === 'signup' ? 'bg-white text-pagoda-wood shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Register
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-nepal-red px-4 py-2.5 text-xs font-bold rounded">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {activeTab === 'signup' && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder=""
                          className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs font-semibold rounded focus:outline-none focus:ring-1 focus:ring-nepal-red focus:border-nepal-red"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                        autoComplete="off"
                        readOnly={emailReadOnly}
                        onFocus={() => setEmailReadOnly(false)}
                        className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs font-semibold rounded focus:outline-none focus:ring-1 focus:ring-nepal-red focus:border-nepal-red"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=""
                        autoComplete="new-password"
                        readOnly={passwordReadOnly}
                        onFocus={() => setPasswordReadOnly(false)}
                        className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs font-semibold rounded focus:outline-none focus:ring-1 focus:ring-nepal-red focus:border-nepal-red"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-pagoda-wood hover:bg-nepal-red text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                    >
                      {loading ? 'Authenticating...' : activeTab === 'login' ? 'Sign In' : 'Register Account'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
