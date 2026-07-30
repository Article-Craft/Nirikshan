import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { districtsAPI, constituenciesAPI, representativesAPI } from '../api';
import { Search, MapPin, Phone, Mail, Award, ArrowRight, User, Vote, Landmark } from 'lucide-react';

export const PARTIES = {
  'NC': { name: 'Nepali Congress', short: 'NC', color: '#4F6B45', text: 'white' }, // Rhododendron Leaf Green
  'UML': { name: 'CPN (Unified Marxist–Leninist)', short: 'CPN-UML', color: '#6E4438', text: 'white' }, // Charred Brick Red
  'MC': { name: 'CPN (Maoist Centre)', short: 'CPN-MC', color: '#8C6A32', text: 'white' }, // Turmeric Clay Orange/Red
  'RSP': { name: 'Rastriya Swatantra Party', short: 'RSP', color: '#1E40AF', text: 'white' }, // Bell Blue
  'RPP': { name: 'Rastriya Prajatantra Party', short: 'RPP', color: '#D97706', text: 'black' }, // Golden Yellow
  'IND': { name: 'Independent / Others', short: 'IND', color: '#6B7280', text: 'white' } // Slate Grey
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

export default function InteractiveMap() {
  const [mapMode, setMapMode] = useState('district'); // 'district' or 'constituency'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
  const [selectedConstituencyId, setSelectedConstituencyId] = useState(null);
  const [hoveredFeatureName, setHoveredFeatureName] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);
  const [constituenciesList, setConstituenciesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real data state
  const [districtsList, setDistrictsList] = useState([]);
  const [constituenciesList, setConstituenciesList] = useState([]);
  const [representativesList, setRepresentativesList] = useState([]);

  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const geojsonLayerRef = useRef(null);

  // Fetch GeoJSON and API data on mount
  useEffect(() => {
    setLoading(true);
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
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading map data:', err);
        setLoading(false);
      });
  }, []);

  // Map representation data
  const districtDataMap = useMemo(() => {
    const map = new Map();
    districtsList.forEach((district) => {
      const matched = constituenciesList.filter(
        (c) => c.mapIdentifier === district.name.toUpperCase()
      );

      map.set(district.name.toUpperCase(), {
        id: district.id,
        name: district.name,
        province: district.province,
        cdo: {
          name: district.cdoName || 'Pending Appointment',
          phone: district.daoContact || 'N/A',
          email: `cdo.${district.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@moha.gov.np`,
          office: district.daoAddress || 'HQ & Address Pending',
          cdoPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60'
        },
        constituencies: matched.map((c) => ({
          id: c.id,
          name: c.name,
          winner: c.winnerRepresentative?.name || 'Vacant',
          party: c.winnerRepresentative?.party || 'Independent',
          votes: c.voteCount || 'pending_verification',
          margin: c.victoryMargin || 'pending_verification',
          promisesCount: 0,
          progress: 0
        }))
      });
    });
    return map;
  }, [districtsList, constituenciesList]);

  const getDistrictDataLocal = (districtName) => {
    if (!districtName) return null;
    return districtDataMap.get(districtName.toUpperCase().trim());
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || loading) return;

    leafletMapInstance.current = L.map(mapRef.current, {
      center: [28.3949, 84.1240], // Center of Nepal
      zoom: 7,
      minZoom: 6,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    const map = leafletMapInstance.current;
    L.control.zoom({ position: 'topright' }).addTo(map);

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [loading]);

  const PROVINCE_COLORS = {
    1: '#8A9A86', // Koshi - Soft sage green
    2: '#A88074', // Madhesh - Warm terracotta clay
    3: '#7CA3A1', // Bagmati - Muted slate teal
    4: '#C5A376', // Gandaki - Golden wheat ochre
    5: '#6E8A9A', // Lumbini - Soft steel blue
    6: '#967E91', // Karnali - Muted amethyst plum
    7: '#B29B72'  // Sudurpashchim - Light brass/olive
  };

  // Handle GeoJSON styling and interaction
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map || !geoJsonData || districtsList.length === 0) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const getStyle = (feature) => {
      const distName = feature.properties.DISTRICT;
      const normalizedGeoName = normalizeName(distName);
      const distRecord = districtsList.find(d => normalizeName(d.name) === normalizedGeoName);
      const isSelected = selectedDistrict.toUpperCase() === distName.toUpperCase();
      const province = feature.properties.PROVINCE;
      
      let fillColor = PROVINCE_COLORS[province] || '#E4DCC8';
      
      if (mapMode === 'constituency' && distRecord) {
        const districtConstituencies = constituenciesList.filter(c => c.districtId === distRecord.id);
        if (districtConstituencies.length > 0) {
          const primaryConstituency = districtConstituencies[0];
          const winner = representativesList.find(r => r.constituencyId === primaryConstituency.id);
          const party = winner?.party || 'IND';
          fillColor = PARTIES[party]?.color || '#6B7280';
        }
      }

      return {
        fillColor: fillColor,
        weight: isSelected ? 2.5 : 1,
        opacity: 1,
        color: isSelected ? '#9C7A3C' : '#F3EFE4',
        fillOpacity: mapMode === 'constituency' ? (isSelected ? 0.95 : 0.75) : (isSelected ? 0.9 : 0.7),
        dashArray: isSelected ? '' : '3',
      };
    };

    const onEachFeature = (feature, layer) => {
      const distName = feature.properties.DISTRICT;
      const province = feature.properties.PROVINCE;
      const normalizedGeoName = normalizeName(distName);
      const distRecord = districtsList.find(d => normalizeName(d.name) === normalizedGeoName);
      const formattedName = distRecord ? distRecord.name : (distName.charAt(0) + distName.slice(1).toLowerCase());

      let tooltipContent = `
        <div class="p-1 font-sans">
          <div class="font-bold text-xs border-b border-dust-beige/30 pb-0.5 mb-1 text-himalayan-mist">${formattedName}</div>
          <div class="text-[10px] text-himalayan-mist/80">Province ${province}</div>
      `;

      if (mapMode === 'constituency' && distRecord) {
        const districtConstituencies = constituenciesList.filter(c => c.districtId === distRecord.id);
        if (districtConstituencies.length > 0) {
          const primary = districtConstituencies[0];
          const winner = representativesList.find(r => r.constituencyId === primary.id);
          const partyInfo = PARTIES[winner?.party || 'IND'];
          tooltipContent += `
            <div class="mt-1 text-[10px] font-semibold text-temple-brass">
              Primary: ${winner ? winner.name : 'Unknown'} (${partyInfo?.short || winner?.party || 'IND'})
            </div>
          `;
        }
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
            weight: 2.5,
            color: '#9C7A3C',
            fillOpacity: mapMode === 'constituency' ? 0.95 : 0.85,
          });
          l.bringToFront();
          setHoveredFeatureName(formattedName);
        },
        mouseout: (e) => {
          geojsonLayerRef.current.resetStyle(e.target);
          setHoveredFeatureName(null);
        },
        click: () => {
          setSelectedDistrict(formattedName);
          setSelectedConstituencyId(null);
          
          map.fitBounds(layer.getBounds(), {
            padding: [50, 50],
            maxZoom: 9,
            animate: true,
            duration: 0.6
          });
        },
      });
    };

    geojsonLayerRef.current = L.geoJSON(geoJsonData, {
      style: getStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);

    try {
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (e) {
      console.error('Error fitting bounds:', e);
    }
  }, [geoJsonData, mapMode, selectedDistrict, districtsList, constituenciesList, representativesList]);

  // Selected district details
  const selectedDistrictRecord = useMemo(() => {
    if (districtsList.length === 0) return null;
    const normalizedSel = normalizeName(selectedDistrict);
    return districtsList.find(d => normalizeName(d.name) === normalizedSel);
  }, [selectedDistrict, districtsList]);

  const districtConstituencies = useMemo(() => {
    if (!selectedDistrictRecord) return [];
    return constituenciesList.filter(c => c.districtId === selectedDistrictRecord.id);
  }, [selectedDistrictRecord, constituenciesList]);

  const activeRep = useMemo(() => {
    if (mapMode !== 'constituency') return null;
    let targetConst = null;
    if (selectedConstituencyId) {
      targetConst = districtConstituencies.find(c => c.id === selectedConstituencyId);
    }
    if (!targetConst && districtConstituencies.length > 0) {
      targetConst = districtConstituencies[0];
    }
    if (targetConst) {
      return representativesList.find(r => r.constituencyId === targetConst.id);
    }
    return null;
  }, [mapMode, selectedConstituencyId, districtConstituencies, representativesList]);

  // Combined typeahead suggestions (districts and constituencies)
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase().trim();
    
    // Matched Districts
    const matchedDistricts = districtsList
      .filter(d => d.name.toLowerCase().includes(query))
      .map(d => ({
        id: `dist-${d.id}`,
        name: d.name,
        type: 'district',
        label: `${d.name} (District)`,
        data: d
      }));
      
    // Matched Constituencies
    const matchedConstituencies = constituenciesList
      .filter(c => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query))
      .map(c => {
        const dist = districtsList.find(d => d.id === c.districtId);
        return {
          id: `const-${c.id}`,
          name: c.name,
          type: 'constituency',
          label: `${c.name} (${dist ? dist.name : ''})`,
          data: c
        };
      });
      
    return [...matchedDistricts, ...matchedConstituencies].slice(0, 8);
  }, [searchQuery, districtsList, constituenciesList]);

  const handleSearchSelect = (item) => {
    setSearchQuery('');
    
    if (item.type === 'district') {
      const distName = item.name;
      setSelectedDistrict(distName);
      setSelectedConstituencyId(null);
      
      if (geojsonLayerRef.current && leafletMapInstance.current) {
        const map = leafletMapInstance.current;
        geojsonLayerRef.current.eachLayer((layer) => {
          if (layer.feature.properties.DISTRICT.toUpperCase() === distName.toUpperCase()) {
            map.fitBounds(layer.getBounds(), {
              padding: [50, 50],
              maxZoom: 9,
              animate: true,
              duration: 0.6
            });
          }
        });
      }
    } else if (item.type === 'constituency') {
      const constituency = item.data;
      const district = districtsList.find(d => d.id === constituency.districtId);
      if (district) {
        setSelectedDistrict(district.name);
        setSelectedConstituencyId(constituency.id);
        setMapMode('constituency'); // Automatically switch to constituency view
        
        if (geojsonLayerRef.current && leafletMapInstance.current) {
          const map = leafletMapInstance.current;
          geojsonLayerRef.current.eachLayer((layer) => {
            if (layer.feature.properties.DISTRICT.toUpperCase() === district.name.toUpperCase()) {
              map.fitBounds(layer.getBounds(), {
                padding: [50, 50],
                maxZoom: 9,
                animate: true,
                duration: 0.6
              });
            }
          });
        }
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredSuggestions.length > 0) {
      handleSearchSelect(filteredSuggestions[0]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-dust-beige/40 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-80 bg-weather-stone rounded-sm animate-shimmer"></div>
            <div className="h-4 w-96 bg-weather-stone/60 rounded-sm animate-shimmer"></div>
          </div>
          <div className="h-10 w-80 bg-weather-stone rounded-sm animate-shimmer"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-12 w-full bg-weather-stone/50 rounded-sm animate-shimmer"></div>
            <div className="h-[480px] w-full bg-weather-stone/20 border border-dashed border-dust-beige rounded-sm flex flex-col items-center justify-center text-slate-basalt/50 font-serif">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-temple-brass rounded-full mb-4"></div>
              <p>Loading Cartographic Outlines...</p>
            </div>
          </div>

          {/* Sidebar Dossier Skeleton */}
          <div className="bg-himalayan-mist border-2 border-dust-beige p-6 relative rounded-sm shadow-md flex flex-col justify-between h-[544px] overflow-hidden">
            <div className="space-y-6">
              <div className="flex flex-col items-center border-b border-dust-beige/80 pb-4 mb-5 space-y-2">
                <div className="w-10 h-10 rounded-full bg-weather-stone animate-shimmer"></div>
                <div className="h-3 w-40 bg-weather-stone animate-shimmer"></div>
                <div className="h-6 w-32 bg-weather-stone animate-shimmer"></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-weather-stone p-4 border border-dust-beige/50 rounded-sm">
                  <div className="w-12 h-12 rounded-full bg-weather-stone/80 animate-shimmer"></div>
                  <div className="flex-grow space-y-2">
                    <div className="h-3 w-20 bg-weather-stone/80 animate-shimmer"></div>
                    <div className="h-4 w-40 bg-weather-stone/80 animate-shimmer"></div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="h-12 w-full bg-weather-stone/30 border border-dust-beige/20 rounded-sm animate-shimmer"></div>
                  <div className="h-12 w-full bg-weather-stone/30 border border-dust-beige/20 rounded-sm animate-shimmer"></div>
                  <div className="h-12 w-full bg-weather-stone/30 border border-dust-beige/20 rounded-sm animate-shimmer"></div>
                </div>
              </div>
            </div>

            <div className="h-12 w-full bg-weather-stone rounded-sm animate-shimmer mt-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-dust-beige/40 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-pagoda-wood tracking-tight">
            Interactive Constituency & District Map
          </h1>
          <p className="text-sm text-slate-basalt/70 font-serif">
            Electoral metrics and Chief District Officer (CDO) administrative dossier
          </p>
        </div>

        {/* Search Bar with autocomplete typeahead */}
        <div className="w-full lg:w-80 relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search District or Constituency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-weather-stone border border-dust-beige text-slate-basalt py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass rounded-sm shadow-inner placeholder:text-slate-basalt/50"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-slate-basalt/60 hover:text-temple-brass transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {searchQuery && filteredSuggestions.length > 0 && (
            <div className="absolute z-[1000] left-0 right-0 mt-1 bg-himalayan-mist border border-dust-beige shadow-lg rounded-sm overflow-hidden">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSearchSelect(suggestion)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-basalt hover:bg-weather-stone transition-colors font-medium border-b border-dust-beige/20 last:border-0 flex justify-between items-center"
                >
                  <span className="font-semibold text-pagoda-wood">{suggestion.name}</span>
                  <span className="text-[10px] text-slate-basalt/60 bg-weather-stone/50 px-2 py-0.5 rounded-sm capitalize">
                    {suggestion.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-weather-stone/30 border border-dust-beige/50 p-3 rounded-sm text-xs font-semibold uppercase tracking-wider text-slate-basalt">
            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-basalt/80">Mode:</span>
              <div className="bg-pagoda-wood p-0.5 rounded-full flex relative shadow-inner">
                <button
                  onClick={() => setMapMode('district')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                    mapMode === 'district'
                      ? 'bg-temple-brass text-pagoda-wood shadow-[0_0_12px_rgba(156,122,60,0.6)] font-bold'
                      : 'text-himalayan-mist/70 hover:text-himalayan-mist'
                  }`}
                >
                  District CDO
                </button>
                <button
                  onClick={() => setMapMode('constituency')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                    mapMode === 'constituency'
                      ? 'bg-temple-brass text-pagoda-wood shadow-[0_0_12px_rgba(156,122,60,0.6)] font-bold'
                      : 'text-himalayan-mist/70 hover:text-himalayan-mist'
                  }`}
                >
                  Constituency Results
                </button>
              </div>
              <span className="text-[9px] text-temple-brass bg-temple-brass/10 border border-temple-brass/30 px-2 py-1.5 rounded-sm font-sans tracking-wide">
                Results as of March 2026 General Election
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-temple-brass hover:text-temple-brass/90 transition-colors">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hoveredFeatureName || selectedDistrict || 'Hover over map'}</span>
            </div>
          </div>

          <div className="relative h-[480px] w-full border border-dust-beige shadow-sm bg-[#F3EFE4] overflow-hidden rounded-sm">
            <div ref={mapRef} className="h-full w-full" />
            <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-50 via-amber-200 to-amber-950 z-[900]" />
            
            {mapMode === 'constituency' && (
              <div className="absolute bottom-4 left-4 z-[999] bg-himalayan-mist/95 backdrop-blur-sm border border-dust-beige/80 p-3 rounded-sm shadow-md text-[10px] font-sans text-slate-basalt">
                <h4 className="font-bold border-b border-dust-beige pb-1 mb-2 uppercase tracking-wide">Winning Party</h4>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {Object.values(PARTIES).map(p => (
                    <div key={p.short} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 block border border-black/10 rounded-sm" style={{ backgroundColor: p.color }} />
                      <span className="font-semibold">{p.short}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel Details */}
        <div className="flex flex-col">
          <div className="flex-grow bg-himalayan-mist border-2 border-dust-beige p-6 relative rounded-sm shadow-md flex flex-col justify-between overflow-hidden">
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-dust-beige/40 pointer-events-none" />
            <div className="absolute top-1 left-1 right-1 bottom-1 border border-dashed border-dust-beige/25 pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center border-b border-dust-beige/80 pb-4 mb-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-dust-beige/60 bg-weather-stone/40 mb-2">
                  <Landmark className="w-5 h-5 text-temple-brass animate-pulse" />
                </div>
                <span className="block text-[10px] uppercase tracking-widest text-slate-basalt/60 font-semibold mb-1">
                  OFFICIAL GOVERNMENT DOSSIER
                </span>
                <h2 className="text-2.5xl font-serif text-pagoda-wood leading-none font-bold">
                  {selectedDistrict} District
                </h2>
              </div>

              {selectedDistrictRecord ? (
                mapMode === 'district' ? (
                  <div className="space-y-4 font-serif animate-fade-in">
                    <div className="bg-weather-stone p-4 border border-dust-beige/50 rounded-sm flex items-center gap-4 shadow-inner">
                      <div className="w-14 h-14 rounded-full bg-pagoda-wood/10 flex items-center justify-center border border-dust-beige/80">
                        <User className="w-6 h-6 text-slate-basalt" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/60">
                          Chief District Officer
                        </span>
                        <h3 className="text-base text-pagoda-wood font-bold">
                          {selectedDistrictRecord.cdoName || 'VACANT'}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-basalt">
                      <div className="flex items-start gap-3 bg-weather-stone/30 p-2.5 border border-dust-beige/20 rounded-sm hover:border-dust-beige/50 transition-colors">
                        <Phone className="w-4 h-4 mt-0.5 text-temple-brass" />
                        <div>
                          <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">Office Hotline</span>
                          <span className="font-sans font-medium">{selectedDistrictRecord.daoContact || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-weather-stone/30 p-2.5 border border-dust-beige/20 rounded-sm hover:border-dust-beige/50 transition-colors">
                        <Mail className="w-4 h-4 mt-0.5 text-temple-brass" />
                        <div className="truncate">
                          <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">Office Hours</span>
                          <span className="font-sans font-medium truncate">{selectedDistrictRecord.daoOfficeHours || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-weather-stone/30 p-2.5 border border-dust-beige/20 rounded-sm hover:border-dust-beige/50 transition-colors">
                        <MapPin className="w-4 h-4 mt-0.5 text-temple-brass" />
                        <div>
                          <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">HQ & Address</span>
                          <span className="text-xs leading-relaxed">{selectedDistrictRecord.daoAddress || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <span className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-slate-basalt/60 text-center mb-1">
                      Electoral Constituencies ({districtConstituencies.length})
                    </span>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {districtConstituencies.map((constObj) => {
                        const rep = representativesList.find(r => r.constituencyId === constObj.id);
                        const partyInfo = PARTIES[rep?.party || 'IND'];
                        const isActive = selectedConstituencyId === constObj.id || (!selectedConstituencyId && districtConstituencies[0]?.id === constObj.id);
                        return (
                          <div 
                            key={constObj.id} 
                            onClick={() => setSelectedConstituencyId(constObj.id)}
                            className={`p-3.5 border rounded-sm space-y-2 font-serif shadow-sm transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-weather-stone border-temple-brass ring-1 ring-temple-brass shadow-[0_0_10px_rgba(156,122,60,0.2)]' 
                                : 'bg-weather-stone/60 border-dust-beige/50 hover:border-temple-brass/50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-sans text-xs font-bold text-pagoda-wood uppercase tracking-wide">
                                {constObj.name}
                              </span>
                              <span 
                                className="px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold border border-black/10 uppercase"
                                style={{ backgroundColor: partyInfo?.color, color: partyInfo?.text }}
                              >
                                {partyInfo?.short || rep?.party || 'IND'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {rep?.photoUrl ? (
                                <img 
                                  src={rep.photoUrl} 
                                  alt={rep.name} 
                                  className="w-10 h-10 rounded-full object-cover border border-dust-beige/80" 
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-pagoda-wood/10 flex items-center justify-center border border-dust-beige/80">
                                  <User className="w-4 h-4 text-slate-basalt" />
                                </div>
                              )}
                              <div>
                                <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">Elected Representative</span>
                                <h4 className="text-sm font-bold text-pagoda-wood flex items-center gap-1">
                                  {rep ? rep.name : 'Unknown Representative'}
                                </h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-dust-beige/30 text-[10px] text-slate-basalt/80 font-sans">
                              <div>
                                <span className="block text-[8px] font-semibold text-slate-basalt/50 uppercase">Attendance</span>
                                <span className="font-bold text-sm text-pagoda-wood">{rep?.attendancePercent ? `${rep.attendancePercent}%` : 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-semibold text-slate-basalt/50 uppercase">Bills Sponsored</span>
                                <span className="font-bold text-sm text-terraced-pine">{rep?.billsSponsored ?? 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                <div className="py-10 text-center text-slate-basalt/60 font-serif">
                  No data loaded. Select a district.
                </div>
              )}
            </div>

            {/* View Full Report Card Link */}
            {mapMode === 'constituency' && activeRep ? (
              <div className="mt-8 relative z-10">
                <Link
                  to={`/representative/${activeRep.id}`}
                  className="w-full bg-terraced-pine text-himalayan-mist py-3 px-4 font-semibold hover:bg-temple-brass hover:text-pagoda-wood hover:shadow-[0_0_12px_rgba(156,122,60,0.4)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm rounded-sm"
                >
                  <Award className="w-4 h-4" />
                  View Full Report Card
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="mt-8 relative z-10">
                <div className="w-full bg-slate-basalt/10 text-slate-basalt/60 py-3 px-4 font-semibold flex items-center justify-center gap-2 text-xs uppercase tracking-widest rounded-sm cursor-not-allowed">
                  <Landmark className="w-4 h-4" />
                  District Dossier Active
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
