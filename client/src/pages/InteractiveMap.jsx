import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistrictData, PARTIES } from './mapMockData';
import { Search, MapPin, Phone, Mail, Award, ArrowRight, User, Vote, Landmark } from 'lucide-react';

export default function InteractiveMap() {
  const [mapMode, setMapMode] = useState('district'); // 'district' or 'constituency'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
  const [hoveredFeatureName, setHoveredFeatureName] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const geojsonLayerRef = useRef(null);

  // Fetch GeoJSON on mount
  useEffect(() => {
    fetch('/data/nepal-districts.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch map data');
        return res.json();
      })
      .then((data) => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading GeoJSON:', err);
        setLoading(false);
      });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || loading) return;

    // Create map instance
    leafletMapInstance.current = L.map(mapRef.current, {
      center: [28.3949, 84.1240], // Center of Nepal
      zoom: 7,
      minZoom: 6,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom map pane for pane ordering (so hovers always sit on top)
    const map = leafletMapInstance.current;
    
    // Add custom zoom controls in top-right
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
    if (!map || !geoJsonData) return;

    // Remove existing GeoJSON layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    // Dynamic style function
    const getStyle = (feature) => {
      const distName = feature.properties.DISTRICT;
      const distData = getDistrictData(distName);
      const isSelected = selectedDistrict.toUpperCase() === distName.toUpperCase();
      const province = feature.properties.PROVINCE;
      
      let fillColor = PROVINCE_COLORS[province] || '#E4DCC8';
      
      if (mapMode === 'constituency' && distData && distData.constituencies.length > 0) {
        // Color by the winning party of the first/primary constituency for visual representation
        const primaryParty = distData.constituencies[0].party;
        fillColor = PARTIES[primaryParty]?.color || '#6B7280';
      }

      return {
        fillColor: fillColor,
        weight: isSelected ? 3 : 1,
        opacity: 1,
        color: isSelected ? '#2E2418' : '#F3EFE4', // Deep Pagoda Wood outline on selected, Himalayan Mist otherwise
        fillOpacity: mapMode === 'constituency' ? (isSelected ? 0.95 : 0.75) : (isSelected ? 0.9 : 0.7),
        dashArray: isSelected ? '' : '3',
      };
    };

    // Feature interactions
    const onEachFeature = (feature, layer) => {
      const distName = feature.properties.DISTRICT;
      const province = feature.properties.PROVINCE;
      const distData = getDistrictData(distName);
      const formattedName = distName.charAt(0) + distName.slice(1).toLowerCase();

      // Bind rich premium tooltip
      let tooltipContent = `
        <div class="p-1 font-sans">
          <div class="font-bold text-xs border-b border-dust-beige/30 pb-0.5 mb-1 text-himalayan-mist">${formattedName}</div>
          <div class="text-[10px] text-himalayan-mist/80">Province ${province}</div>
      `;
      if (mapMode === 'constituency' && distData && distData.constituencies.length > 0) {
        const primary = distData.constituencies[0];
        const partyInfo = PARTIES[primary.party];
        tooltipContent += `
          <div class="mt-1 text-[10px] font-semibold text-temple-brass">
            Primary: ${primary.winner} (${partyInfo?.short})
          </div>
        `;
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
            weight: 3,
            color: '#9C7A3C', // Temple Brass hover outline
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
          
          // Fit map view slightly to clicked polygon bounds
          map.fitBounds(layer.getBounds(), {
            padding: [50, 50],
            maxZoom: 9,
            animate: true,
            duration: 0.6
          });
        },
      });
    };

    // Load GeoJSON Layer
    geojsonLayerRef.current = L.geoJSON(geoJsonData, {
      style: getStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);

    // Fit map bounds to show whole Nepal properly
    try {
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (e) {
      console.error('Error fitting bounds:', e);
    }
  }, [geoJsonData, mapMode, selectedDistrict]);

  // Join selected district details
  const selectedData = useMemo(() => {
    return getDistrictData(selectedDistrict);
  }, [selectedDistrict]);

  // List of all districts for search filtering
  const allDistrictsList = useMemo(() => {
    if (!geoJsonData) return [];
    return geoJsonData.features.map(f => {
      const name = f.properties.DISTRICT;
      return name.charAt(0) + name.slice(1).toLowerCase();
    }).sort();
  }, [geoJsonData]);

  // Filtered districts for search autocomplete/dropdown
  const filteredDistricts = useMemo(() => {
    if (!searchQuery) return [];
    return allDistrictsList.filter(d => 
      d.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, allDistrictsList]);

  // Handle selecting from search
  const handleSearchSelect = (districtName) => {
    setSelectedDistrict(districtName);
    setSearchQuery('');
    
    // Find matching Leaflet layer to fit bounds
    if (geojsonLayerRef.current && leafletMapInstance.current) {
      const map = leafletMapInstance.current;
      geojsonLayerRef.current.eachLayer((layer) => {
        if (layer.feature.properties.DISTRICT.toUpperCase() === districtName.toUpperCase()) {
          map.fitBounds(layer.getBounds(), {
            padding: [50, 50],
            maxZoom: 9,
            animate: true,
            duration: 0.6
          });
          layer.setStyle({
            weight: 3,
            color: '#9C7A3C'
          });
          layer.bringToFront();
        }
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredDistricts.length > 0) {
      handleSearchSelect(filteredDistricts[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Header & Search Bar Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-dust-beige/40 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-pagoda-wood tracking-tight">
            Interactive Constituency & District Map
          </h1>
          <p className="text-sm text-slate-basalt/70 font-serif">
            Electoral metrics and Chief District Officer (CDO) administrative dossier
          </p>
        </div>

        {/* Search Bar - Custom Himal & Pagoda Chrome */}
        <div className="w-full lg:w-80 relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search District..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-weather-stone border border-dust-beige text-slate-basalt py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass rounded-sm shadow-inner placeholder:text-slate-basalt/50"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-slate-basalt/60 hover:text-temple-brass"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {searchQuery && filteredDistricts.length > 0 && (
            <div className="absolute z-[1000] left-0 right-0 mt-1 bg-himalayan-mist border border-dust-beige shadow-lg rounded-sm overflow-hidden">
              {filteredDistricts.map((d) => (
                <button
                  key={d}
                  onClick={() => handleSearchSelect(d)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-basalt hover:bg-weather-stone transition-colors font-medium border-b border-dust-beige/20 last:border-0"
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Feature Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Map Column (Main Visual) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Map Chrome Toolbar (Toggles and Hover state) */}
          <div className="flex justify-between items-center bg-weather-stone/30 border border-dust-beige/50 p-3 rounded-sm text-xs font-semibold uppercase tracking-wider text-slate-basalt">
            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-basalt/80">Mode:</span>
              <div className="bg-pagoda-wood p-0.5 rounded-full flex relative shadow-inner">
                <button
                  onClick={() => setMapMode('district')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                    mapMode === 'district'
                      ? 'bg-temple-brass text-pagoda-wood shadow-md font-bold'
                      : 'text-himalayan-mist/70 hover:text-himalayan-mist'
                  }`}
                >
                  District CDO
                </button>
                <button
                  onClick={() => setMapMode('constituency')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                    mapMode === 'constituency'
                      ? 'bg-temple-brass text-pagoda-wood shadow-md font-bold'
                      : 'text-himalayan-mist/70 hover:text-himalayan-mist'
                  }`}
                >
                  Constituency Results
                </button>
              </div>
            </div>

            {/* Live Hover Info */}
            <div className="flex items-center gap-1.5 text-temple-brass">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hoveredFeatureName || selectedDistrict || 'Hover over map'}</span>
            </div>
          </div>

          {/* Leaflet Map Container */}
          {loading ? (
            <div className="h-[480px] w-full bg-weather-stone/20 border border-dashed border-dust-beige flex flex-col items-center justify-center text-slate-basalt/50 font-serif">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-temple-brass rounded-full mb-4"></div>
              <p>Loading Cartographic Outlines...</p>
            </div>
          ) : (
            <div className="relative h-[480px] w-full border border-dust-beige shadow-sm bg-[#F3EFE4] overflow-hidden rounded-sm">
              <div ref={mapRef} className="h-full w-full" />
              
              {/* Aged Parchment Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-50 via-amber-200 to-amber-950 z-[900]" />
              
              {/* Floating Map Legend */}
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
          )}
        </div>

        {/* Dossier Side Info Panel (Heritage Document Reveal) */}
        <div className="flex flex-col">
          <div className="flex-grow bg-himalayan-mist border-2 border-dust-beige p-6 relative rounded-sm shadow-md flex flex-col justify-between overflow-hidden">
            {/* Fine Corner Borders to match certificate feel */}
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-dust-beige/40 pointer-events-none" />
            <div className="absolute top-1 left-1 right-1 bottom-1 border border-dashed border-dust-beige/25 pointer-events-none" />

            <div className="relative z-10">
              {/* Dossier Header */}
              <div className="text-center border-b border-dust-beige/80 pb-4 mb-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-dust-beige/60 bg-weather-stone/40 mb-2">
                  <Landmark className="w-5 h-5 text-temple-brass" />
                </div>
                <span className="block text-[10px] uppercase tracking-widest text-slate-basalt/60 font-semibold mb-1">
                  OFFICIAL GOVERNMENT DOSSIER
                </span>
                <h2 className="text-2.5xl font-serif text-pagoda-wood leading-none font-bold">
                  {selectedDistrict} District
                </h2>
              </div>

              {/* dossier content conditional on mode */}
              {selectedData ? (
                mapMode === 'district' ? (
                  /* District Mode Details */
                  <div className="space-y-4 font-serif">
                    <div className="bg-weather-stone p-4 border border-dust-beige/50 rounded-sm flex items-center gap-4">
                      {selectedData.cdo.cdoPhoto ? (
                        <img 
                          src={selectedData.cdo.cdoPhoto} 
                          alt={selectedData.cdo.name} 
                          className="w-14 h-14 rounded-full object-cover border border-dust-beige/80" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-pagoda-wood/10 flex items-center justify-center border border-dust-beige/80">
                          <User className="w-6 h-6 text-slate-basalt" />
                        </div>
                      )}
                      <div>
                        <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/60">
                          Chief District Officer
                        </span>
                        <h3 className="text-base text-pagoda-wood font-bold">
                          {selectedData.cdo.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-basalt">
                      <div className="flex items-start gap-3 bg-weather-stone/30 p-2.5 border border-dust-beige/20 rounded-sm">
                        <Phone className="w-4 h-4 mt-0.5 text-temple-brass" />
                        <div>
                          <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">Office Hotline</span>
                          <span className="font-sans font-medium">{selectedData.cdo.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-weather-stone/30 p-2.5 border border-dust-beige/20 rounded-sm">
                        <Mail className="w-4 h-4 mt-0.5 text-temple-brass" />
                        <div className="truncate">
                          <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">Official Email</span>
                          <span className="font-sans font-medium truncate">{selectedData.cdo.email}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-weather-stone/30 p-2.5 border border-dust-beige/20 rounded-sm">
                        <MapPin className="w-4 h-4 mt-0.5 text-temple-brass" />
                        <div>
                          <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">HQ & Address</span>
                          <span className="text-xs leading-relaxed">{selectedData.cdo.office}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Constituency Mode Details */
                  <div className="space-y-4">
                    <span className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-slate-basalt/60 text-center mb-1">
                      Electoral Constituencies ({selectedData.constituencies.length})
                    </span>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {selectedData.constituencies.map((constObj) => {
                        const partyInfo = PARTIES[constObj.party];
                        return (
                          <div 
                            key={constObj.id} 
                            className="bg-weather-stone p-3.5 border border-dust-beige/50 rounded-sm space-y-2 font-serif shadow-sm hover:border-temple-brass/50 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-sans text-xs font-bold text-pagoda-wood uppercase tracking-wide">
                                {constObj.name}
                              </span>
                              <span 
                                className="px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold border border-black/10 uppercase"
                                style={{ backgroundColor: partyInfo?.color, color: partyInfo?.text }}
                              >
                                {partyInfo?.short}
                              </span>
                            </div>
                            
                            <div>
                              <span className="block text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-basalt/50">Elected Representative</span>
                              <h4 className="text-sm font-bold text-pagoda-wood flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-temple-brass" />
                                {constObj.winner}
                              </h4>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-dust-beige/30 text-[10px] text-slate-basalt/80 font-sans">
                              <div>
                                <span className="block text-[8px] font-semibold text-slate-basalt/50 uppercase">Promises Tracked</span>
                                <span className="font-bold text-sm text-pagoda-wood">{constObj.promisesCount} Promises</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-semibold text-slate-basalt/50 uppercase">Promise Progress</span>
                                <span className="font-bold text-sm text-terraced-pine">{constObj.progress}%</span>
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

            {/* Full dossier action button */}
            <div className="mt-8 relative z-10">
              <Link
                to={`/?constituency=${selectedDistrict}`}
                className="w-full bg-terraced-pine text-himalayan-mist py-3 px-4 font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm rounded-sm"
              >
                <Award className="w-4 h-4" />
                View Full Report Card
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
