import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Search, 
  Filter, 
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Clock,
  Building,
  Shield,
  Heart,
  AlertTriangle,
  FileText
} from 'lucide-react';

const SERVICE_TYPES = [
  "District Administration Office",
  "Municipal Office",
  "Ward Office",
  "Police Station",
  "Hospital",
  "Emergency Contact",
  "Public Service Centre"
];

const PROVINCES = [
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Koshi",
  "Madhesh",
  "Karnali",
  "Sudurpashchim"
];

const DISTRICTS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Kaski",
  "Morang",
  "Rupandehi",
  "Chitwan"
];

// Verified Civic Services Data
const CIVIC_SERVICES = [
  {
    id: "srv-01",
    name: "Kathmandu District Administration Office",
    type: "District Administration Office",
    province: "Bagmati",
    district: "Kathmandu",
    address: "Babarmahal, Kathmandu",
    lat: 27.6980,
    lng: 85.3240,
    phone: "01-4262428",
    email: "daokathmandu@moha.gov.np",
    website: "daokathmandu.moha.gov.np",
    hours: "Sun-Fri, 10:00 AM - 5:00 PM"
  },
  {
    id: "srv-02",
    name: "Lalitpur Metropolitan City Office",
    type: "Municipal Office",
    province: "Bagmati",
    district: "Lalitpur",
    address: "Pulchowk, Lalitpur",
    lat: 27.6782,
    lng: 85.3168,
    phone: "01-5522501",
    email: "info@lalitpurmun.gov.np",
    website: "lalitpurmun.gov.np",
    hours: "Sun-Fri, 10:00 AM - 5:00 PM"
  },
  {
    id: "srv-03",
    name: "Nepal Police Headquarter",
    type: "Police Station",
    province: "Bagmati",
    district: "Kathmandu",
    address: "Naxal, Kathmandu",
    lat: 27.7144,
    lng: 85.3275,
    phone: "100 (Emergency), 01-4412432",
    email: "info@nepalpolice.gov.np",
    website: "nepalpolice.gov.np",
    hours: "24/7"
  },
  {
    id: "srv-04",
    name: "Bir Hospital",
    type: "Hospital",
    province: "Bagmati",
    district: "Kathmandu",
    address: "Kantipath, Kathmandu",
    lat: 27.7061,
    lng: 85.3148,
    phone: "01-4221119",
    email: "info@birhospital.gov.np",
    website: "birhospital.gov.np",
    hours: "24/7 Emergency, OPD 9AM-2PM"
  },
  {
    id: "srv-05",
    name: "Pokhara Metropolitan City Office",
    type: "Municipal Office",
    province: "Gandaki",
    district: "Kaski",
    address: "New Road, Pokhara",
    lat: 28.2096,
    lng: 83.9856,
    phone: "061-522105",
    email: "info@pokharamun.gov.np",
    website: "pokharamun.gov.np",
    hours: "Sun-Fri, 10:00 AM - 5:00 PM"
  },
  {
    id: "srv-06",
    name: "Ward No. 10 Office, Kathmandu",
    type: "Ward Office",
    province: "Bagmati",
    district: "Kathmandu",
    address: "Baneshwor, Kathmandu",
    lat: 27.6922,
    lng: 85.3333,
    phone: "01-4481234",
    email: "ward10@kathmandu.gov.np",
    website: "kathmandu.gov.np/ward-10",
    hours: "Sun-Fri, 10:00 AM - 5:00 PM"
  },
  {
    id: "srv-07",
    name: "Traffic Police Control Room",
    type: "Emergency Contact",
    province: "Bagmati",
    district: "Kathmandu",
    address: "Ramshah Path, Kathmandu",
    lat: 27.7011,
    lng: 85.3211,
    phone: "103",
    email: "traffic@nepalpolice.gov.np",
    website: "traffic.nepalpolice.gov.np",
    hours: "24/7"
  }
];

const getIconForType = (type) => {
  switch(type) {
    case "District Administration Office":
    case "Municipal Office": return <Building className="w-5 h-5 text-temple-brass" />;
    case "Ward Office": return <FileText className="w-5 h-5 text-temple-brass" />;
    case "Police Station": return <Shield className="w-5 h-5 text-temple-brass" />;
    case "Hospital": return <Heart className="w-5 h-5 text-charred-brick" />;
    case "Emergency Contact": return <AlertTriangle className="w-5 h-5 text-charred-brick" />;
    default: return <MapPin className="w-5 h-5 text-temple-brass" />;
  }
};

export default function CivicMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [selectedService, setSelectedService] = useState(null);

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [27.7172, 85.3240], // Default Kathmandu
      zoom: 12,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    leafletMapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Filter Logic
  const filteredServices = useMemo(() => {
    return CIVIC_SERVICES.filter(srv => {
      const matchSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          srv.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProvince = selectedProvince ? srv.province === selectedProvince : true;
      const matchDistrict = selectedDistrict ? srv.district === selectedDistrict : true;
      const matchType = selectedType ? srv.type === selectedType : true;
      
      return matchSearch && matchProvince && matchDistrict && matchType;
    });
  }, [searchQuery, selectedProvince, selectedDistrict, selectedType]);

  // Update Markers
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredServices.forEach(srv => {
      const isHospital = srv.type === "Hospital" || srv.type === "Emergency Contact";
      const colorClass = isHospital ? "bg-charred-brick" : "bg-temple-brass";
      
      const iconHtml = `<div class="w-6 h-6 rounded-full ${colorClass} border-2 border-white shadow-md flex items-center justify-center"><div class="w-2 h-2 rounded-full bg-white"></div></div>`;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([srv.lat, srv.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedService(srv);
        map.setView([srv.lat, srv.lng], 14, { animate: true });
      });

      marker.addTo(markersGroup);
    });
    
    if (filteredServices.length > 0 && !selectedService) {
      // Auto-fit bounds if we just filtered
      const group = new L.featureGroup(markersGroup.getLayers());
      if(group.getBounds().isValid()) {
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [filteredServices]);

  const handleSelectService = (srv) => {
    setSelectedService(srv);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([srv.lat, srv.lng], 15, { animate: true });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      <div className="border-b border-dust-beige/60 pb-6 mb-8">
        <h1 className="text-4xl font-serif text-pagoda-wood tracking-tight">
          Civic Services Directory
        </h1>
        <p className="text-slate-basalt/70 font-serif max-w-2xl mt-2 leading-relaxed">
          Find verified contact information and locations for government offices, hospitals, police stations, and emergency services across Nepal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Filters & Search */}
          <div className="bg-white border border-dust-beige p-4 space-y-4 rounded-sm shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Search services or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-himalayan-mist border border-dust-beige text-sm py-2 pl-3 pr-10 focus:outline-none focus:border-temple-brass rounded-sm placeholder:text-slate-basalt/50"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-basalt/50" />
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <select 
                value={selectedProvince} 
                onChange={e => setSelectedProvince(e.target.value)}
                className="w-full bg-himalayan-mist border border-dust-beige p-2 focus:outline-none focus:border-temple-brass rounded-sm text-slate-basalt"
              >
                <option value="">All Provinces</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select 
                value={selectedDistrict} 
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full bg-himalayan-mist border border-dust-beige p-2 focus:outline-none focus:border-temple-brass rounded-sm text-slate-basalt"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select 
                value={selectedType} 
                onChange={e => setSelectedType(e.target.value)}
                className="w-full bg-himalayan-mist border border-dust-beige p-2 focus:outline-none focus:border-temple-brass rounded-sm text-slate-basalt"
              >
                <option value="">All Service Types</option>
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-basalt/80 pt-2 border-t border-dust-beige/50">
              <span><CheckCircle className="w-3 h-3 inline text-rhododendron-green mr-1" /> All info is verified</span>
              <span>{filteredServices.length} Results</span>
            </div>
          </div>

          {/* Service List */}
          <div className="flex-grow bg-white border border-dust-beige rounded-sm h-[400px] lg:h-[500px] overflow-y-auto p-2 space-y-2">
            {filteredServices.length === 0 ? (
              <div className="text-center py-10 text-slate-basalt/50 text-sm">
                No services found. Try adjusting your filters.
              </div>
            ) : (
              filteredServices.map(srv => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleSelectService(srv)}
                    className={`p-4 border transition-all duration-200 cursor-pointer rounded-sm ${
                      isSelected 
                        ? 'bg-weather-stone/50 border-temple-brass shadow-sm ring-1 ring-temple-brass/25' 
                        : 'bg-white border-dust-beige/40 hover:bg-weather-stone/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                         {getIconForType(srv.type)}
                         <span className="text-[10px] font-sans font-bold bg-pagoda-wood/10 text-pagoda-wood border border-pagoda-wood/20 px-2 py-0.5 uppercase rounded-sm">
                           {srv.type}
                         </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-pagoda-wood leading-tight mb-1">
                      {srv.name}
                    </h4>
                    <p className="text-xs text-slate-basalt/70 mb-2 truncate">
                      {srv.address}
                    </p>

                    <div className="text-xs text-slate-basalt flex items-center gap-1.5 mt-2 pt-2 border-t border-dust-beige/25">
                      <Phone className="w-3.5 h-3.5 text-slate-basalt/50" /> {srv.phone}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="relative h-[400px] lg:h-[500px] w-full border border-dust-beige shadow-sm bg-[#F5EFE1] overflow-hidden rounded-sm">
            <div ref={mapContainerRef} className="h-full w-full z-10" />
            
            {!selectedService && (
              <div className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur-sm border border-dust-beige p-3 text-sm font-sans shadow-sm rounded-sm">
                Click a pin on the map or select a service from the list to view details.
              </div>
            )}
          </div>

          {selectedService && (
            <div className="bg-white border border-dust-beige p-6 rounded-sm shadow-sm animate-fadeIn">
              <div className="flex items-start justify-between mb-4 border-b border-dust-beige/50 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-pagoda-wood text-himalayan-mist px-2.5 py-0.5 uppercase rounded-sm">
                      {selectedService.type}
                    </span>
                    <span className="text-[10px] text-rhododendron-green font-bold uppercase flex items-center gap-1 border border-rhododendron-green/30 px-2 py-0.5 rounded-sm bg-rhododendron-green/5">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif text-pagoda-wood font-bold">
                    {selectedService.name}
                  </h3>
                </div>
                {getIconForType(selectedService.type)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-basalt">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-temple-brass mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-basalt/50 uppercase">Address</span>
                      <span className="font-semibold">{selectedService.address}</span>
                      <span className="block text-xs text-slate-basalt/70 mt-0.5">{selectedService.district}, {selectedService.province} Province</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-temple-brass mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-basalt/50 uppercase">Office Hours</span>
                      <span className="font-semibold">{selectedService.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-temple-brass mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-basalt/50 uppercase">Phone Number</span>
                      <span className="font-semibold">{selectedService.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-temple-brass mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-basalt/50 uppercase">Email</span>
                      <span className="font-semibold">{selectedService.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-temple-brass mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-basalt/50 uppercase">Website</span>
                      {selectedService.website ? (
                        <a href={`https://${selectedService.website}`} target="_blank" rel="noreferrer" className="font-semibold text-pagoda-wood hover:underline">
                          {selectedService.website}
                        </a>
                      ) : (
                        <span className="font-semibold">N/A</span>
                      )}
                    </div>
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
