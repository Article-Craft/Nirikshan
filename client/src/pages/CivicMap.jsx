import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Search, 
  Filter, 
  CheckCircle, 
  HelpCircle, 
  Calendar, 
  User, 
  Clock, 
  Plus, 
  AlertCircle,
  X,
  FileText,
  ShieldAlert
} from 'lucide-react';

const CATEGORIES = [
  "Public Audit",
  "Public Hearing",
  "Watchdog Inspection",
  "Community Forum",
  "Infrastructure Monitoring"
];

// Initial mock civic events in Nepal
const INITIAL_EVENTS = [
  {
    id: "evt-01",
    title: "Ring Road Phase 2 Environmental Compliance Audit",
    category: "Public Audit",
    description: "Citizen inspection of tree restoration and dust suppression measures along the Kalanki-Maharajgunj segment. Local compliance officers will review contractor records.",
    locationName: "Gongabu, Kathmandu",
    lat: 27.7314,
    lng: 85.3110,
    date: "2026-07-15",
    time: "11:00 AM",
    reporter: "Madan Bhandari Trust",
    verified: true,
    evidenceFile: "compliance_report_v2.pdf"
  },
  {
    id: "evt-02",
    title: "Bakhundole Stormwater Drainage Auditing & Public Forum",
    category: "Public Hearing",
    description: "Community review regarding the quality of sewer drainage concrete pipes laid out recently. Citizen complaint filed over thin rebars used in construction.",
    locationName: "Bakhundole, Lalitpur",
    lat: 27.6792,
    lng: 85.3142,
    date: "2026-07-18",
    time: "2:00 PM",
    reporter: "S. Shrestha (Local Coordinator)",
    verified: false,
    evidenceFile: null
  },
  {
    id: "evt-03",
    title: "Lakeside Solid Waste Treatment & Drainage Quality Inspection",
    category: "Watchdog Inspection",
    description: "Monitoring of waste-water discharge channels from lakeside hotels directly entering Phewa Lake. Water sampling kits will be distributed to volunteer watchdogs.",
    locationName: "Lakeside, Pokhara",
    lat: 28.2120,
    lng: 83.9575,
    date: "2026-07-22",
    time: "9:00 AM",
    reporter: "Pokhara Citizen Forum",
    verified: true,
    evidenceFile: "water_quality_phewa.pdf"
  },
  {
    id: "evt-04",
    title: "Nyatapola Heritage Zone Restoration Budget Forum",
    category: "Community Forum",
    description: "Discussion on municipal budgets utilized for the wooden beam restorations of historical monuments. Detailed accounts review with master carpenters.",
    locationName: "Taumadhi Square, Bhaktapur",
    lat: 27.6715,
    lng: 85.4283,
    date: "2026-07-20",
    time: "4:00 PM",
    reporter: "Heritage Watch Bhaktapur",
    verified: true,
    evidenceFile: "nyatapola_accounts_restoration.xlsx"
  },
  {
    id: "evt-05",
    title: "Biratnagar Industrial Corridor Emission Level Audit",
    category: "Infrastructure Monitoring",
    description: "Monitoring particulate matter levels in residential areas adjacent to steel mills. Installing low-cost air quality sensors with public coordinates.",
    locationName: "Industrial Zone, Biratnagar",
    lat: 26.4835,
    lng: 87.2831,
    date: "2026-07-26",
    time: "10:00 AM",
    reporter: "Air Quality Coalition Nepal",
    verified: false,
    evidenceFile: null
  }
];

export default function CivicMap() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('nirikshan_civic_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterVerified, setFilterVerified] = useState('all'); // 'all', 'verified', 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Report Form State
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    title: "",
    category: "Public Audit",
    description: "",
    locationName: "",
    lat: "",
    lng: "",
    date: "",
    time: "",
    reporter: "Pritam Rai"
  });

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('nirikshan_civic_events', JSON.stringify(events));
  }, [events]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map centered on Nepal
    const map = L.map(mapContainerRef.current, {
      center: [28.0, 84.8], // Centralized to show Kathmandu & Pokhara clearly
      zoom: 7,
      minZoom: 6,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    leafletMapRef.current = map;

    // Aged/Heritage Cartographic Tile Style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Group for markers
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Map click handler to report a new activity
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setReportData(prev => ({
        ...prev,
        lat: lat.toFixed(5),
        lng: lng.toFixed(5)
      }));
      setShowReportForm(true);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.locationName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchVerification = filterVerified === 'all' || 
                               (filterVerified === 'verified' && evt.verified) || 
                               (filterVerified === 'pending' && !evt.verified);
      
      return matchSearch && matchVerification;
    });
  }, [events, searchQuery, filterVerified]);

  // Refresh Markers on Map when events or filters change
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear existing markers
    markersGroup.clearLayers();

    filteredEvents.forEach(evt => {
      // Custom DivIcons to avoid image asset loading failures and ensure custom palette is respected
      // Temple Brass for verified events, Dust Beige outline for pending verification
      const iconHtml = evt.verified
        ? `<div class="w-6 h-6 rounded-full bg-temple-brass border-2 border-himalayan-mist shadow-md flex items-center justify-center"><div class="w-1.5 h-1.5 rounded-full bg-himalayan-mist"></div></div>`
        : `<div class="w-6 h-6 rounded-full border-2 border-dust-beige bg-himalayan-mist shadow-md flex items-center justify-center"><div class="w-1.5 h-1.5 rounded-full bg-dust-beige"></div></div>`;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([evt.lat, evt.lng], { icon: customIcon });

      // Click to select event
      marker.on('click', () => {
        setSelectedEvent(evt);
        map.setView([evt.lat, evt.lng], Math.max(map.getZoom(), 9), { animate: true });
      });

      marker.addTo(markersGroup);
    });
  }, [filteredEvents]);

  // Handle Event selection from sidebar
  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    const map = leafletMapRef.current;
    if (map) {
      map.setView([evt.lat, evt.lng], 10, { animate: true });
    }
  };

  // Handle Report Form Submit
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportData.title || !reportData.lat || !reportData.lng) {
      alert("Please fill out the title and ensure coordinates are selected on the map.");
      return;
    }

    const newEvent = {
      id: "evt-" + Math.floor(100 + Math.random() * 900),
      title: reportData.title,
      category: reportData.category,
      description: reportData.description,
      locationName: reportData.locationName || "Selected Coordinates",
      lat: parseFloat(reportData.lat),
      lng: parseFloat(reportData.lng),
      date: reportData.date || new Date().toISOString().split('T')[0],
      time: reportData.time || "12:00 PM",
      reporter: reportData.reporter,
      verified: false, // Default is pending verification
      evidenceFile: null
    };

    setEvents([newEvent, ...events]);
    setSelectedEvent(newEvent);
    setShowReportForm(false);
    setReportData({
      title: "",
      category: "Public Audit",
      description: "",
      locationName: "",
      lat: "",
      lng: "",
      date: "",
      time: "",
      reporter: "Pritam Rai"
    });

    alert("Thank you! Your civic watchdog activity has been reported as pending verification.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Header Row */}
      <div className="border-b border-dust-beige/60 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-pagoda-wood tracking-tight">
            Civic Activity & Watchdog Map
          </h1>
          <p className="text-slate-basalt/70 font-serif max-w-2xl mt-2 leading-relaxed">
            Collaborative community watchdog monitoring. Click anywhere on the map to log new audits, hearings, 
            or infrastructure delays for verification.
          </p>
        </div>

        {/* Legend Panel */}
        <div className="bg-weather-stone/30 border border-dust-beige p-3 text-xs flex gap-4 rounded-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-temple-brass border border-himalayan-mist block shadow-sm" />
            <span className="font-semibold text-slate-basalt">Verified Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border border-dust-beige bg-himalayan-mist block shadow-sm" />
            <span className="font-semibold text-slate-basalt/80">Pending Verification</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Controls & List */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Filters & Search */}
          <div className="bg-weather-stone/20 border border-dust-beige p-4 space-y-3 rounded-sm shadow-inner">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events/locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-himalayan-mist border border-dust-beige text-xs py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-temple-brass rounded-sm placeholder:text-slate-basalt/50"
              />
              <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-basalt/50" />
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-basalt/80">
              <span className="flex items-center gap-1"><Filter className="w-3 h-3 text-temple-brass" /> Verification Status:</span>
              <div className="bg-pagoda-wood/5 p-0.5 rounded-sm border border-dust-beige/50 flex">
                <button
                  onClick={() => setFilterVerified('all')}
                  className={`px-2 py-1 rounded-sm text-[9px] font-semibold transition-all ${
                    filterVerified === 'all' ? 'bg-pagoda-wood text-himalayan-mist font-bold' : 'text-slate-basalt/60 hover:text-slate-basalt'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterVerified('verified')}
                  className={`px-2 py-1 rounded-sm text-[9px] font-semibold transition-all ${
                    filterVerified === 'verified' ? 'bg-pagoda-wood text-himalayan-mist font-bold' : 'text-slate-basalt/60 hover:text-slate-basalt'
                  }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setFilterVerified('pending')}
                  className={`px-2 py-1 rounded-sm text-[9px] font-semibold transition-all ${
                    filterVerified === 'pending' ? 'bg-pagoda-wood text-himalayan-mist font-bold' : 'text-slate-basalt/60 hover:text-slate-basalt'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>

          {/* Event Listing List */}
          <div className="flex-grow bg-weather-stone/5 border border-dust-beige rounded-sm h-[400px] lg:h-[480px] overflow-y-auto p-2 space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-10 font-serif text-slate-basalt/50 text-xs">
                No events match the selected filters. Click map to log a new watchdog activity.
              </div>
            ) : (
              filteredEvents.map(evt => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt)}
                    className={`p-3.5 border transition-all duration-200 cursor-pointer rounded-sm ${
                      isSelected 
                        ? 'bg-weather-stone border-temple-brass shadow-sm ring-1 ring-temple-brass/25' 
                        : 'bg-weather-stone/20 border-dust-beige/40 hover:bg-weather-stone/40'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-sans font-bold bg-pagoda-wood/10 text-pagoda-wood border border-pagoda-wood/25 px-2 py-0.5 uppercase rounded-sm">
                        {evt.category}
                      </span>
                      <span className="text-[9px] font-sans text-slate-basalt/50 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" /> {evt.date}
                      </span>
                    </div>

                    <h4 className="text-xs font-serif font-bold text-pagoda-wood leading-tight mb-1">
                      {evt.title}
                    </h4>

                    <div className="flex justify-between items-center text-[10px] text-slate-basalt/60 font-sans mt-2.5 pt-2 border-t border-dust-beige/25">
                      <span className="truncate max-w-[150px]">{evt.locationName}</span>
                      <span className={`font-semibold text-[9px] uppercase px-1.5 py-0.5 rounded-sm border ${
                        evt.verified 
                          ? 'bg-rhododendron-green/10 border-rhododendron-green/30 text-rhododendron-green' 
                          : 'bg-dust-beige/20 border-dust-beige/50 text-slate-basalt/70'
                      }`}>
                        {evt.verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center/Right Map Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Map Container */}
          <div className="relative h-[480px] w-full border border-dust-beige shadow-inner bg-[#F5EFE1] overflow-hidden rounded-sm">
            <div ref={mapContainerRef} className="h-full w-full z-10" />
            
            {/* Aged Parchment Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.12] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-50 via-amber-200 to-amber-950 z-20" />

            {/* Quick Helper Floating Tip */}
            <div className="absolute bottom-4 right-4 z-30 bg-pagoda-wood/90 backdrop-blur-sm border border-dust-beige/40 p-2.5 text-[9px] font-sans text-himalayan-mist uppercase tracking-widest max-w-[280px]">
              <span className="font-bold text-temple-brass block mb-0.5">💡 Watchdog Tip:</span>
              Click anywhere directly on the map coordinates to report an audit/inspection form.
            </div>
          </div>

          {/* Event Detail Panel or Report Form */}
          {showReportForm ? (
            /* REPORT FORM PANEL */
            <div className="bg-weather-stone/30 border-2 border-dust-beige p-6 rounded-sm shadow-md animate-fadeIn">
              <div className="flex justify-between items-center border-b border-dust-beige/60 pb-3 mb-4">
                <h3 className="text-lg font-serif text-pagoda-wood flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-temple-brass" /> Log Civic Watchdog Event
                </h3>
                <button 
                  onClick={() => setShowReportForm(false)} 
                  className="text-slate-basalt/60 hover:text-slate-basalt p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Ring Road Waste Collection Compliance Check"
                      value={reportData.title}
                      onChange={handleFormChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 focus:outline-none focus:border-temple-brass text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Category</label>
                    <select
                      name="category"
                      value={reportData.category}
                      onChange={handleFormChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 focus:outline-none focus:border-temple-brass text-xs"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Description (What needs monitoring/what was audited?)</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Provide details about the inspection, who attended, findings, or the nature of infrastructure failure."
                    value={reportData.description}
                    onChange={handleFormChange}
                    className="w-full bg-himalayan-mist border border-dust-beige p-2.5 focus:outline-none focus:border-temple-brass text-xs font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Location Name / Ward</label>
                    <input
                      type="text"
                      name="locationName"
                      placeholder="e.g. Kalanki Ward 14, Kathmandu"
                      value={reportData.locationName}
                      onChange={handleFormChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 focus:outline-none focus:border-temple-brass text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Latitude</label>
                    <input
                      type="text"
                      name="lat"
                      required
                      readOnly
                      placeholder="Click on map"
                      value={reportData.lat}
                      className="w-full bg-weather-stone/50 border border-dust-beige p-2.5 focus:outline-none text-xs cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Longitude</label>
                    <input
                      type="text"
                      name="lng"
                      required
                      readOnly
                      placeholder="Click on map"
                      value={reportData.lng}
                      className="w-full bg-weather-stone/50 border border-dust-beige p-2.5 focus:outline-none text-xs cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Scheduled Date</label>
                    <input
                      type="date"
                      name="date"
                      value={reportData.date}
                      onChange={handleFormChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 focus:outline-none focus:border-temple-brass text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Time</label>
                    <input
                      type="text"
                      name="time"
                      placeholder="e.g. 11:30 AM"
                      value={reportData.time}
                      onChange={handleFormChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 focus:outline-none focus:border-temple-brass text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-basalt/80 mb-1.5">Reporter Identity</label>
                    <input
                      type="text"
                      name="reporter"
                      value={reportData.reporter}
                      onChange={handleFormChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 focus:outline-none focus:border-temple-brass text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-4 py-2 border border-dust-beige text-xs uppercase tracking-wider font-semibold hover:bg-weather-stone text-slate-basalt transition-all rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-pagoda-wood text-himalayan-mist px-6 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all duration-300 shadow-md rounded-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          ) : selectedEvent ? (
            /* SELECTED EVENT DETAIL CARD */
            <div className="bg-weather-stone border-2 border-dust-beige p-6 rounded-sm shadow-md space-y-4 animate-fadeIn relative">
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-dust-beige/50 pointer-events-none" />
              
              {/* Event Meta Row */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-dust-beige/70 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-bold bg-pagoda-wood text-himalayan-mist px-2.5 py-0.5 uppercase rounded-sm">
                    {selectedEvent.category}
                  </span>
                  <span className="text-xs text-slate-basalt/70 font-mono font-bold">ID: {selectedEvent.id}</span>
                </div>
                
                {/* Verification Badge in Rhododendron Green or Neutral Outline */}
                {selectedEvent.verified ? (
                  <div className="bg-rhododendron-green/10 border border-rhododendron-green/30 text-rhododendron-green px-3 py-1 text-[10px] font-sans font-bold uppercase rounded-sm flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-rhododendron-green" />
                    Verified Watchdog Activity
                  </div>
                ) : (
                  <div className="bg-dust-beige/10 border border-dust-beige/40 text-slate-basalt/75 px-3 py-1 text-[10px] font-sans font-bold uppercase rounded-sm flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-basalt/60 animate-pulse" />
                    Pending Verification
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-serif text-pagoda-wood font-bold leading-tight">
                  {selectedEvent.title}
                </h3>

                <p className="text-xs text-slate-basalt leading-relaxed font-serif bg-himalayan-mist/55 p-3.5 border border-dust-beige/40">
                  {selectedEvent.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-basalt/90 pt-1">
                  <div className="bg-himalayan-mist/20 p-2.5 border border-dust-beige/25 rounded-sm flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 mt-0.5 text-temple-brass" />
                    <div>
                      <span className="block text-[8px] font-bold text-slate-basalt/50 uppercase">Location Coordinate</span>
                      <span className="font-semibold block">{selectedEvent.locationName}</span>
                      <span className="text-[10px] text-slate-basalt/50 font-mono">Lat: {selectedEvent.lat}, Lng: {selectedEvent.lng}</span>
                    </div>
                  </div>

                  <div className="bg-himalayan-mist/20 p-2.5 border border-dust-beige/25 rounded-sm flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 mt-0.5 text-temple-brass" />
                    <div>
                      <span className="block text-[8px] font-bold text-slate-basalt/50 uppercase">Schedule Detail</span>
                      <span className="font-semibold block">{selectedEvent.date}</span>
                      <span className="text-[10px] text-slate-basalt/50">{selectedEvent.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-dust-beige/40">
                  <div className="text-[10px] font-sans text-slate-basalt/60">
                    <span className="block text-[8px] font-bold text-slate-basalt/40 uppercase">Reported By</span>
                    <span className="font-semibold text-slate-basalt">{selectedEvent.reporter}</span>
                  </div>

                  {selectedEvent.verified && selectedEvent.evidenceFile && (
                    <div className="bg-pagoda-wood text-himalayan-mist text-[10px] font-sans font-bold uppercase tracking-wider py-2 px-3 rounded-sm border border-dust-beige/25 flex items-center gap-1.5 cursor-pointer hover:bg-temple-brass hover:text-pagoda-wood transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      View Audit Evidence ({selectedEvent.evidenceFile})
                    </div>
                  )}

                  {!selectedEvent.verified && (
                    <div className="bg-dust-beige/10 text-slate-basalt/70 text-[9px] font-serif leading-relaxed max-w-sm flex items-start gap-1.5 p-2 border border-dust-beige/30">
                      <ShieldAlert className="w-4 h-4 text-temple-brass mt-0.5 flex-shrink-0" />
                      This citizen report is pending review by Nirikshan moderators. Community evidence uploading is enabled.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY DETAIL STATE */
            <div className="bg-weather-stone/10 border border-dashed border-dust-beige/70 p-10 text-center rounded-sm flex flex-col items-center justify-center h-48">
              <MapPin className="w-8 h-8 text-dust-beige mb-2" />
              <p className="font-serif text-xs text-slate-basalt/50">
                Select an activity pin on the map or list to view verified audit details, or click on the map to log a new activity coordinate.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
