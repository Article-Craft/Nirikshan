import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { districtsAPI, constituenciesAPI, representativesAPI } from '../api';
import { Search, MapPin, Phone, Mail, Award, ArrowRight, User, Landmark, Building, Globe, AlertCircle } from 'lucide-react';

export const PARTIES = {
  'NC': { name: 'Nepali Congress', short: 'NC', color: '#1E3A8A', text: 'white' },
  'CPN (UML)': { name: 'CPN (UML)', short: 'UML', color: '#DC2626', text: 'white' },
  'RSP': { name: 'Rastriya Swatantra Party', short: 'RSP', color: '#2563EB', text: 'white' },
  'CPN (Maoist Centre)': { name: 'CPN (Maoist Centre)', short: 'MC', color: '#991B1B', text: 'white' },
  'RPP': { name: 'Rastriya Prajatantra Party', short: 'RPP', color: '#D97706', text: 'white' },
  'Independent': { name: 'Independent', short: 'IND', color: '#4B5563', text: 'white' }
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
        headquarters: district.headquarters,
        areaSqKm: district.areaSqKm,
        population: district.population,
        cdo: {
          name: district.cdoName,
          assistant: district.assistantCdo,
          phone: district.daoContact,
          email: district.daoEmail,
          website: district.daoWebsite,
          office: district.daoAddress || 'HQ & Address Pending',
          hours: district.daoOfficeHours || '10:00 AM - 5:00 PM'
        },
        municipalitiesCount: district.municipalitiesCount,
        ruralMunicipalitiesCount: district.ruralMunicipalitiesCount,
        policeContact: district.policeContact,
        emergencyContact: district.emergencyContact,
        mayorName: district.mayorName,
        constituencies: matched.map((c) => ({
          id: c.id,
          name: c.name,
          winner: c.winnerRepresentative?.name || 'Vacant',
          party: c.winnerRepresentative?.party || 'Independent',
          votes: c.voteCount || 'pending_verification',
          margin: c.victoryMargin || 'pending_verification',
          promisesCount: c.winnerRepresentative?.promisesCompleted ?? 0,
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
    'Koshi Province': '#8A9A86',
    'Madhesh Province': '#A88074',
    'Bagmati Province': '#7CA3A1',
    'Gandaki Province': '#C5A376',
    'Lumbini Province': '#6E8A9A',
    'Karnali Province': '#967E91',
    'Sudurpashchim Province': '#B29B72'
  };

  // Handle GeoJSON styling and interaction
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map || !geoJsonData || districtsList.length === 0) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const getStyle = (feature) => {
      const distName = feature.properties.DISTRICT || feature.properties.name || '';
      const norm = normalizeName(distName);
      const isSelected = norm === normalizeName(selectedDistrict);
      
      const matchedDistrict = districtsList.find(d => normalizeName(d.name) === norm);
      const province = matchedDistrict?.province || 'Bagmati Province';
      const baseColor = PROVINCE_COLORS[province] || '#CBD5E1';

      if (mapMode === 'constituency') {
        const constituencies = constituenciesList.filter(c => c.mapIdentifier === norm);
        if (constituencies.length > 0) {
          const mainWinner = constituencies[0]?.winnerRepresentative;
          const partyColor = PARTIES[mainWinner?.party]?.color || '#4B5563';
          return {
            fillColor: partyColor,
            weight: isSelected ? 3.5 : 1,
            opacity: 0.9,
            color: isSelected ? '#DC2626' : '#FAF9F6',
            fillOpacity: isSelected ? 0.95 : 0.8
          };
        }
      }

      return {
        fillColor: isSelected ? '#FEF2F2' : '#FFFFFF',
        weight: isSelected ? 3 : 1,
        opacity: 0.9,
        color: isSelected ? '#DC2626' : '#94A3B8',
        fillOpacity: isSelected ? 0.95 : 0.85
      };
    };

    const onEachFeature = (feature, layer) => {
      const distName = feature.properties.DISTRICT || feature.properties.name || '';
      const formattedName = distName.charAt(0) + distName.slice(1).toLowerCase();
      const norm = normalizeName(distName);
      const matchedRecord = getDistrictDataLocal(formattedName);

      let tooltipContent = `<div class="p-2 font-sans text-xs">`;
      tooltipContent += `<div class="font-extrabold text-pagoda-wood text-sm">${formattedName} District</div>`;
      tooltipContent += `<div class="text-slate-basalt mt-1">Province: ${matchedRecord?.province || 'Unavailable'}</div>`;
      
      if (mapMode === 'district') {
        if (matchedRecord?.cdo?.name) {
          tooltipContent += `<div class="mt-1 border-t border-slate-200 pt-1 text-slate-basalt"><span class="font-semibold text-nepal-red">CDO:</span> ${matchedRecord.cdo.name}</div>`;
        } else {
          tooltipContent += `<div class="mt-1 border-t border-slate-200 pt-1 text-amber-700 italic">CDO verification pending</div>`;
        }
      } else {
        const matched = constituenciesList.filter(c => c.mapIdentifier === norm);
        if (matched.length > 0) {
          const winner = matched[0]?.winnerRepresentative;
          tooltipContent += `
            <div class="mt-1 border-t border-slate-200 pt-1 text-slate-basalt">
              Representative: ${winner ? winner.name : 'Vacant'} (${winner?.party || 'IND'})
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
            color: '#DC2626',
            fillOpacity: 0.95,
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

  // Combined suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase().trim();
    
    const matchedDistricts = districtsList
      .filter(d => d.name.toLowerCase().includes(query))
      .map(d => ({
        id: `dist-${d.id}`,
        name: d.name,
        type: 'district',
        label: `${d.name} (District)`,
        data: d
      }));

    const matchedConstituencies = constituenciesList
      .filter(c => c.name.toLowerCase().includes(query))
      .map(c => ({
        id: `const-${c.id}`,
        name: c.name,
        type: 'constituency',
        label: `${c.name} (Constituency)`,
        data: c
      }));

    return [...matchedDistricts, ...matchedConstituencies].slice(0, 6);
  }, [searchQuery, districtsList, constituenciesList]);

  const handleSearchSelect = (suggestion) => {
    setSearchQuery('');
    if (suggestion.type === 'district') {
      setSelectedDistrict(suggestion.name);
      setSelectedConstituencyId(null);
      if (geojsonLayerRef.current && leafletMapInstance.current) {
        const map = leafletMapInstance.current;
        geojsonLayerRef.current.eachLayer((layer) => {
          const dName = layer.feature.properties.DISTRICT || layer.feature.properties.name || '';
          if (dName.toUpperCase() === suggestion.name.toUpperCase()) {
            map.fitBounds(layer.getBounds(), {
              padding: [50, 50],
              maxZoom: 9,
              animate: true,
              duration: 0.6
            });
          }
        });
      }
    } else if (suggestion.type === 'constituency') {
      const dist = districtsList.find(d => d.id === suggestion.data.districtId);
      if (dist) {
        setSelectedDistrict(dist.name);
        setSelectedConstituencyId(suggestion.data.id);
        setMapMode('constituency');
        if (geojsonLayerRef.current && leafletMapInstance.current) {
          const map = leafletMapInstance.current;
          geojsonLayerRef.current.eachLayer((layer) => {
            const dName = layer.feature.properties.DISTRICT || layer.feature.properties.name || '';
            if (dName.toUpperCase() === dist.name.toUpperCase()) {
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-80 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-[480px] w-full bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-400">
              <span className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded flex flex-col justify-between h-[480px]">
            <div className="space-y-4">
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
              <div className="h-8 w-40 bg-slate-200 rounded"></div>
              <div className="h-24 w-full bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-pagoda-wood font-extrabold tracking-tight">
            Interactive Constituency & District Map
          </h1>
          <p className="text-sm text-slate-basalt/70 leading-relaxed mt-1">
            Explore local representatives, emergency operations, and verified Chief District Officer (CDO) rosters.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-80 relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search District or Constituency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-basalt py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-nepal-red rounded shadow-sm font-medium"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-slate-400 hover:text-nepal-red transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {searchQuery && filteredSuggestions.length > 0 && (
            <div className="absolute z-[1000] left-0 right-0 mt-1 bg-white border border-slate-200 shadow-lg rounded overflow-hidden">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSearchSelect(suggestion)}
                  className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 flex justify-between items-center"
                >
                  <span className="text-pagoda-wood">{suggestion.name}</span>
                  <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {suggestion.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Map View */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded text-xs font-bold uppercase tracking-wider text-slate-600">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400">Map Filter:</span>
              <div className="bg-slate-200 p-0.5 rounded flex relative shadow-inner">
                <button
                  onClick={() => setMapMode('district')}
                  className={`px-3 py-1.5 rounded transition-all text-[10px] font-bold ${
                    mapMode === 'district'
                      ? 'bg-pagoda-wood text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  District Dossier
                </button>
                <button
                  onClick={() => setMapMode('constituency')}
                  className={`px-3 py-1.5 rounded transition-all text-[10px] font-bold ${
                    mapMode === 'constituency'
                      ? 'bg-pagoda-wood text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Constituency Results
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-nepal-red font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hoveredFeatureName || selectedDistrict || 'Hover over map'}</span>
            </div>
          </div>

          <div className="relative h-[480px] w-full border border-slate-200 bg-[#FFFFFF] overflow-hidden rounded">
            <div ref={mapRef} className="h-full w-full z-10" />
            
            {mapMode === 'constituency' && (
              <div className="absolute bottom-4 left-4 z-[999] bg-white border border-slate-200 p-3.5 rounded shadow text-[10px] font-bold text-slate-500 text-left">
                <h4 className="border-b border-slate-100 pb-1 mb-2 uppercase tracking-wider">Party Colors</h4>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {Object.values(PARTIES).map(p => (
                    <div key={p.short} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 block rounded-sm" style={{ backgroundColor: p.color }} />
                      <span className="font-bold">{p.short}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel District Mini-Portal Dashboard */}
        <div className="flex flex-col">
          <div className="flex-grow bg-[#FFFFFF] border border-slate-200 p-6 relative rounded shadow-sm flex flex-col justify-between overflow-y-auto max-h-[544px] text-left">
            <div className="relative z-10 space-y-6">
              
              <div className="text-center border-b border-slate-100 pb-4 mb-4">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 border border-slate-200 mb-2">
                  <Landmark className="w-4 h-4 text-nepal-red" />
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">
                  OFFICIAL GOVERNMENT DOSSIER
                </span>
                <h2 className="text-2xl font-serif text-pagoda-wood font-extrabold mt-1">
                  {selectedDistrict} District
                </h2>
              </div>

              {selectedDistrictRecord ? (
                mapMode === 'district' ? (
                  <div className="space-y-5 animate-fade-in text-left">
                    
                    {/* CDO Profile Card */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border border-slate-200">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Chief District Officer
                        </span>
                        <h3 className="text-sm text-pagoda-wood font-extrabold">
                          {selectedDistrictRecord.cdoName || 'CDO details pending verification'}
                        </h3>
                        {selectedDistrictRecord.assistantCdo && (
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Asst: {selectedDistrictRecord.assistantCdo}</span>
                        )}
                      </div>
                    </div>

                    {/* Detailed info lists */}
                    <div className="space-y-3 text-xs text-slate-700">
                      
                      {selectedDistrictRecord.headquarters && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Headquarters</span>
                          <span className="font-bold text-pagoda-wood">{selectedDistrictRecord.headquarters}</span>
                        </div>
                      )}

                      {selectedDistrictRecord.areaSqKm && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Area sq km</span>
                          <span className="font-bold text-pagoda-wood">{selectedDistrictRecord.areaSqKm}</span>
                        </div>
                      )}

                      {selectedDistrictRecord.population && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Population</span>
                          <span className="font-bold text-pagoda-wood">{selectedDistrictRecord.population}</span>
                        </div>
                      )}

                      {selectedDistrictRecord.mayorName && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">HQ Mayor</span>
                          <span className="font-bold text-nepal-red">{selectedDistrictRecord.mayorName}</span>
                        </div>
                      )}

                      {selectedDistrictRecord.daoAddress && (
                        <div className="py-2">
                          <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">DAO Office Address</span>
                          <span className="font-medium text-slate-800">{selectedDistrictRecord.daoAddress}</span>
                        </div>
                      )}

                      {selectedDistrictRecord.daoContact && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">DAO Contact</span>
                          <span className="font-bold text-pagoda-wood">{selectedDistrictRecord.daoContact}</span>
                        </div>
                      )}

                      {selectedDistrictRecord.daoEmail && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">DAO Email</span>
                          <span className="font-bold text-blue-600 hover:underline"><a href={`mailto:${selectedDistrictRecord.daoEmail}`}>{selectedDistrictRecord.daoEmail}</a></span>
                        </div>
                      )}

                      {selectedDistrictRecord.daoWebsite && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">DAO Website</span>
                          <a href={selectedDistrictRecord.daoWebsite} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline flex items-center gap-1">
                            Link <Globe className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Emergency contacts block */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {selectedDistrictRecord.policeContact && (
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                            <span className="block text-[8px] font-bold uppercase text-slate-400">Police Hotline</span>
                            <span className="font-extrabold text-slate-700">{selectedDistrictRecord.policeContact}</span>
                          </div>
                        )}
                        {selectedDistrictRecord.emergencyContact && (
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                            <span className="block text-[8px] font-bold uppercase text-slate-400">Emergency Ops</span>
                            <span className="font-extrabold text-slate-700">{selectedDistrictRecord.emergencyContact}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1">
                      Electoral Constituencies ({districtConstituencies.length})
                    </span>
                    
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {districtConstituencies.map((constObj) => {
                        const rep = representativesList.find(r => r.constituencyId === constObj.id);
                        const partyInfo = PARTIES[rep?.party];
                        const isActive = selectedConstituencyId === constObj.id || (!selectedConstituencyId && districtConstituencies[0]?.id === constObj.id);
                        return (
                          <div 
                            key={constObj.id} 
                            onClick={() => setSelectedConstituencyId(constObj.id)}
                            className={`p-3.5 border rounded space-y-2.5 transition-colors cursor-pointer text-left ${
                              isActive
                                ? 'bg-slate-50 border-nepal-red ring-1 ring-nepal-red/10' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-pagoda-wood uppercase tracking-wide">
                                {constObj.name}
                              </span>
                              <span 
                                className="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                                style={{ backgroundColor: partyInfo?.color || '#4B5563', color: 'white' }}
                              >
                                {partyInfo?.short || rep?.party || 'IND'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={rep?.photoUrl || '/avatar.png'} 
                                alt={rep?.name} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                              />
                              <div>
                                <span className="block text-[8px] font-bold uppercase text-slate-400">Elected Representative</span>
                                <h4 className="text-xs font-bold text-pagoda-wood">
                                  {rep ? rep.name : 'Unknown Representative'}
                                </h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600 font-bold uppercase">
                              <div>
                                <span className="block text-[7px] text-slate-400">Attendance</span>
                                <span className="font-extrabold text-sm text-pagoda-wood">{rep?.attendancePercent ? `${rep.attendancePercent}%` : 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[7px] text-slate-400">Promises Tracked</span>
                                <span className="font-extrabold text-sm text-nepal-red">{rep?.promisesCompleted ?? 0}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                <div className="py-10 text-center text-slate-400 font-serif">
                  Select a district to view details.
                </div>
              )}
            </div>

            {/* View Full Report Card Link */}
            {mapMode === 'constituency' && activeRep ? (
              <div className="mt-6 relative z-10">
                <Link
                  to={`/representative/${activeRep.id}`}
                  className="w-full bg-pagoda-wood hover:bg-nepal-red text-white py-3 px-4 font-bold transition-all duration-200 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider rounded shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  View Full Politician Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="mt-6 relative z-10">
                <div className="w-full bg-slate-100 text-slate-400 py-3 px-4 font-bold flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider rounded border border-slate-200">
                  <Landmark className="w-4 h-4" />
                  Audit Dossier Active
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
