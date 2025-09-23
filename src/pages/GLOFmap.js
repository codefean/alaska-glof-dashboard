// GLOFmap.js
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import './GLOFmap.css';
import MapLegend from './MapLegend';
import Citation from './citation';
import PitchControl from "./PitchControl";
import { useCursorLocation } from "./loc";

// NEW: glacier layer hook + toggle button
import { useGlacierLayer } from './glaciers';



const AlaskaMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const [lakeData, setLakeData] = useState([]);
  const [showGlaciers] = useState(false);
  const [glacierData, setGlacierData] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const pitchRef = useRef(null);
  const [pitchBottom, setPitchBottom] = useState(100);

  const markersRef = useRef([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 915);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // POPUPS:
  const hoverPopupRef = useRef(null);   // ephemeral, for hover previews
  const lockedPopupRef = useRef(null);  // persistent, selected lake
  const isPopupLocked = useRef(false);

  const DEFAULT_PITCH = 20;
  const [pitch, setPitch] = useState(DEFAULT_PITCH);

  // live cursor info (lng/lat/elevation in meters)
  const [cursorInfo, setCursorInfo] = useState({ lng: null, lat: null, elevM: null });

  const resetZoom = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [-144.5, 59.5],
      zoom: 4,
      speed: 2.2,
      pitch: DEFAULT_PITCH
    });
    setPitch(DEFAULT_PITCH);
  };

  useEffect(() => {
  const updatePos = () => {
    if (pitchRef.current) {
      const rect = pitchRef.current.getBoundingClientRect();
      // distance from bottom of viewport, plus some padding
      setPitchBottom(window.innerHeight - rect.bottom + 12);
    }
  };
  updatePos();
  window.addEventListener('resize', updatePos);
  return () => window.removeEventListener('resize', updatePos);
}, []);

    // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const sync = () => setPitch(map.getPitch());
    map.on('pitch', sync);
    map.on('pitchend', sync);
    return () => {
      map.off('pitch', sync);
      map.off('pitchend', sync);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      if (window.location.hash.startsWith('#/GLOF-map')) {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 30);
      }
    };

    scrollToTop(); // Run once on mount

    window.addEventListener('hashchange', scrollToTop);
    return () => window.removeEventListener('hashchange', scrollToTop);
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-144.5, 59.9],
      zoom: 4,
      antialias: true, // Improves 3D rendering quality
    });
    mapRef.current = map;

    const handleKeydown = (e) => {
      if (e.key.toLowerCase() === 'r') {
        const map = mapRef.current;
        if (!map) return;
        map.flyTo({ center: [-144.5, 59.5], zoom: 4, speed: 2.2, pitch: DEFAULT_PITCH });
        // keep the UI slider in sync immediately:
        setPitch(DEFAULT_PITCH);
      }
    };

    // DEM + terrain for elevation
    map.on('load', () => {
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 });

      map.getStyle().layers.forEach((layer) => {
        if (
          layer.type === 'symbol' &&
          layer.layout?.['text-field'] &&
          /\bglacier\b/i.test(layer.layout['text-field'])
        ) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    });

    // Fetch lake data
    const fetchLakeData = async () => {
      try {
        const response = await fetch('https://flood-events.s3.us-east-2.amazonaws.com/AK_GL.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim().replace(/^\uFEFF/, ''),
          complete: (result) => {
            const parsed = result.data.map(row => ({
              LakeID: row.LakeID?.trim(),
              km2: parseFloat(row.km2) || 0,
              lat: parseFloat(row.lat),
              lon: parseFloat(row.lon),
              LakeName: (row.LakeName && row.LakeName.trim() !== 'NA') ? row.LakeName.trim() : null,
              GlacierName: (row.GlacierName && row.GlacierName.trim() !== 'NA') ? row.GlacierName.trim() : null,
              isHazard: row.isHazard?.toString().toLowerCase() === 'true',
              futureHazard: row.futureHazard?.toString().toLowerCase() === 'true',
              futureHazardETA: row.futureHazardETA?.trim() || null,
              hazardURL: row.hazardURL?.trim() || null,
              waterFlow: (row.waterFlow && row.waterFlow.trim() !== 'NA') ? row.waterFlow.trim() : null,
              downstream: (row.downstream && row.downstream.trim() !== 'NA') ? row.downstream.trim() : null,
            })).filter(row => row.LakeID && !isNaN(row.lat) && !isNaN(row.lon));
            setLakeData(parsed);
          },
        });
      } catch (error) {
        console.error('Error fetching lake data:', error);
      }
    };

    const fetchGlacierData = async () => {
      try {
        const response = await fetch('https://flood-events.s3.us-east-2.amazonaws.com/alaska_glaciers.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim().replace(/^\uFEFF/, ''),
          complete: (result) => {
            const parsed = result.data
              .map(row => ({
                name: row.name?.trim(),
                lat: parseFloat(row.latitude),
                lon: parseFloat(row.longitude),
              }))
              .filter(gl => !isNaN(gl.lat) && !isNaN(gl.lon));
            setGlacierData(parsed);
          },
        });
      } catch (error) {
        console.error('Error fetching glacier data:', error);
      }
    };

    fetchLakeData();
    fetchGlacierData();

      const resetZoom = () => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({
        center: [-144.5, 59.5],  // Default center
        zoom: 4,                 // Default zoom
        speed: 2.2,
        pitch: DEFAULT_PITCH     // Reset pitch
      });
      setPitch(DEFAULT_PITCH);
    };


    // Global map click: unlock and clear any locked popup
    const clearLock = () => {
      isPopupLocked.current = false;
      lockedPopupRef.current?.remove();
      lockedPopupRef.current = null;
    };
    map.on('click', clearLock);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      map.off('click', clearLock);
      markersRef.current.forEach(m => m.remove());
      hoverPopupRef.current?.remove();
      lockedPopupRef.current?.remove();
      map.remove();
    };
  }, []);

    useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key.toLowerCase() === 'r') resetZoom();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || lakeData.length === 0) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    lakeData.forEach((lake) => {
      const { lat, lon, LakeID, LakeName, GlacierName, isHazard, futureHazard, futureHazardETA } = lake;
      if (isNaN(lat) || isNaN(lon)) return;

      const el = document.createElement('div');
      el.className = isHazard ? 'marker square' : futureHazard ? 'marker diamond' : 'marker circle';

      const marker = new mapboxgl.Marker(el, { anchor: 'center' })
        .setLngLat([lon, lat])
        .addTo(map);
      markersRef.current.push(marker);

const popupContent = `
  <h4>${LakeName || `Lake ${LakeID}`}</h4>
  <p>
    <strong>Glacier:</strong> ${GlacierName || 'Unknown'}<br/>
    ${lake.waterFlow ? `<strong>Flow:</strong> ${lake.waterFlow}<br/>` : ''}
    ${lake.downstream ? `<strong>Downstream:</strong> ${lake.downstream}<br/>` : ''}
    ${futureHazard ? `<em>Potential future hazard${futureHazardETA ? ` (ETA: ${futureHazardETA})` : ''}</em><br/>` : ''}
  </p>
  <div class="glof-button-wrapper">
    ${(isHazard || futureHazard) ? `
      <a 
        href="#/GLOF-data?lake=${encodeURIComponent(LakeID)}" 
        target="_blank"
        rel="noopener noreferrer"
        class="glof-button"
        style="text-decoration: none;"

      >
        More Info
      </a>` 
    : ''}
  </div>
`;

      let hoverTimeout;

      // HOVER — show a temporary popup even if a locked one exists
      el.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        hoverPopupRef.current?.remove();

        hoverPopupRef.current = new mapboxgl.Popup({ closeOnClick: false, closeButton: false })
          .setLngLat([lon, lat])
          .setHTML(popupContent)
          .addTo(map);

        // auto-close after 2.5 seconds
        hoverTimeout = setTimeout(() => {
          if (hoverPopupRef.current) {
            hoverPopupRef.current.remove();
            hoverPopupRef.current = null;
          }
        }, 2500);
      });

      // LEAVE — hide only the hover popup
      el.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        hoverPopupRef.current?.remove();
        hoverPopupRef.current = null;
      });

      // CLICK — set/replace the locked popup, clear any hover popup
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(hoverTimeout);

        isPopupLocked.current = true;

        // Remove any prior locked popup
        lockedPopupRef.current?.remove();

        // Remove current hover popup so only the locked one stays
        hoverPopupRef.current?.remove();
        hoverPopupRef.current = null;

        lockedPopupRef.current = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([lon, lat])
          .setHTML(popupContent)
          .addTo(map);

        map.flyTo({ center: [lon, lat], zoom: 12, speed: 2 });
        window.history.pushState({}, '', `#/GLOF-map?lake=${encodeURIComponent(LakeID)}`);
      });
    });
  }, [lakeData]);

  // Auto-zoom to lake from shared URL with full (locked) popup
  useEffect(() => {
    if (!window.location.hash.startsWith('#/GLOF-map')) return;
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const lakeIdFromURL = params.get('lake');

    if (!lakeIdFromURL) return;
    const targetLake = lakeData.find(l => l.LakeID === lakeIdFromURL);
    if (!targetLake || !mapRef.current) return;

    const {
      lat, lon, LakeID, LakeName, GlacierName,
      isHazard, futureHazard, futureHazardETA, waterFlow, downstream
    } = targetLake;

    const popupContent = `
      <h4>${LakeName || `Lake ${LakeID}`}</h4>
      <p><strong>Glacier:</strong> ${GlacierName || 'Unknown'}<br/>
      ${waterFlow ? `<strong>Flow:</strong> ${waterFlow}<br/>` : ''}
      ${downstream ? `<strong>Downstream:</strong> ${downstream}<br/>` : ''}
      ${futureHazard ? `<em>Potential future hazard${futureHazardETA ? ` (ETA: ${futureHazardETA})` : ''}</em><br/>` : ''}
      ${(isHazard || futureHazard) ? `<a href="#/GLOF-data?lake=${encodeURIComponent(LakeID)}">See full hazard info</a>` : ''}</p>`;

    mapRef.current.flyTo({ center: [lon, lat], zoom: 12, speed: 2 });

    isPopupLocked.current = true;
    lockedPopupRef.current?.remove();
    lockedPopupRef.current = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat([lon, lat])
      .setHTML(popupContent)
      .addTo(mapRef.current);

    // ✅ Force scroll to top when loading a lake directly
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, [lakeData]);

  // mousemove -> update cursorInfo
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let rafId = null;
    const onMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const { lng, lat } = e.lngLat;
        let elevM = null;
        try {
          elevM = map.queryTerrainElevation(e.lngLat, { exaggerated: false });
        } catch { }
        if (typeof elevM !== 'number' || Number.isNaN(elevM)) elevM = null;
        setCursorInfo({ lng, lat, elevM });
      });
    };

    map.on('mousemove', onMove);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      map.off('mousemove', onMove);
    };
  }, []);

  // Hook: add glacier vector layer + interactions; reacts to showGlaciers
  useGlacierLayer({
    mapRef,
    showGlaciers,
    glacierData,
    hoverPopupRef,
    lockedPopupRef,
    isPopupLockedRef: isPopupLocked,
  });

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    const foundLake = lakeData.find(lake =>
      (lake.LakeName && lake.LakeName.toLowerCase() === query) ||
      (lake.LakeID && lake.LakeID.toLowerCase() === query)
    );

    if (foundLake && mapRef.current) {
      mapRef.current.flyTo({ center: [foundLake.lon, foundLake.lat], zoom: 12, speed: 2 });
    } else {
      alert('Lake not found');
    }
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: 'calc(100vh - 70px)', // adjust for header height
          overflow: 'hidden',
          zIndex: 1
        }}
      />
      <Citation className="citation-readout" stylePos={{ position: 'absolute', right: 12, bottom: 12, zIndex: 2 }} />

      <div className="search-bar-container" style={{ position: 'absolute' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search for lakes by Name or LakeID..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              if (value.trim()) {
                setSuggestions(lakeData.filter(lake =>
                  (lake.LakeName && lake.LakeName.toLowerCase().includes(value.toLowerCase())) ||
                  (lake.LakeID && lake.LakeID.toLowerCase().includes(value.toLowerCase()))
                ).slice(0, 4));
              } else {
                setSuggestions([]);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {suggestions.length > 0 && (
            <ul className="dropdown-suggestions">
              {suggestions.map((lake, index) => (
                <li key={index} onClick={() => {
                  setSearchQuery(lake.LakeName || lake.LakeID);
                  setSuggestions([]);
                  mapRef.current?.flyTo({ center: [lake.lon, lake.lat], zoom: 12, speed: 2 });
                }}>
                  {lake.LakeName || `Lake ${lake.LakeID}`}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={handleSearch}>Search</button>
      </div>

{isMobile && (
  <button
    onClick={resetZoom}
    style={{
      position: 'absolute',
      bottom: `${pitchBottom / 1.26}px`, 
      right: '12px',
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.6)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      zIndex: 5,
      fontWeight: 'bold',
    }}
  >
    R
  </button>
)}


      {/* ✅ Your hotkey table uses resetZoom too */}
      <div className="hotkey-table">
        <table>
          <tbody>
            <tr>
              <td><strong>R</strong></td>
              <td>
                <button
                  onClick={resetZoom}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'white' }}
                >
                  Reset Zoom
                </button>
              </td>
            </tr>
            <tr><td><strong>+</strong></td><td>Zoom in</td></tr>
            <tr><td><strong>-</strong></td><td>Zoom out</td></tr>
          </tbody>
        </table>
      </div>



      {/* Cursor readout */}
      <div
        className="cursor-readout"
        style={{
          position: 'absolute',

        }}
      >
        {cursorInfo.lat !== null && cursorInfo.lng !== null ? (
          <>
            <div>
              <strong>Lat:</strong> {cursorInfo.lat.toFixed(5)} &nbsp;
              <strong>Lng:</strong> {cursorInfo.lng.toFixed(5)}
            </div>
            <div>
              <strong>Elev:</strong>{' '}
              {cursorInfo.elevM === null
                ? '—'
                : `${Math.round(cursorInfo.elevM)} m (${Math.round(cursorInfo.elevM * 3.28084)} ft)`}
            </div>
          </>
        ) : (
          <div>Move cursor over map…</div>
        )}
      </div>
      <PitchControl
        ref={pitchRef}
        mapRef={mapRef}
        value={pitch}
        onChange={(p) => setPitch(p)}
      />
      <MapLegend />
    </>
    
  );
};

export default AlaskaMap;
