import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import './GLOFmap.css';
import MapLegend from './MapLegend';

const AlaskaMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [lakeData, setLakeData] = useState([]);
  const [glacierData, setGlacierData] = useState([]);
  const [showGlaciers, setShowGlaciers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const markersRef = useRef([]);
  const activePopupRef = useRef(null);
  const isPopupLocked = useRef(false);
  const [suggestions, setSuggestions] = useState([]);

  // NEW: live cursor info (lng/lat/elevation in meters)
  const [cursorInfo, setCursorInfo] = useState({ lng: null, lat: null, elevM: null });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-144.5, 59.9],
      zoom: 4,
    });

    const handleKeydown = (e) => {
      if (e.key.toLowerCase() === 'r') {
        mapRef.current.flyTo({ center: [-144.5, 59.5], zoom: 4, speed: 2.2 });
      }
    };
    window.addEventListener('keydown', handleKeydown);

    // NEW: Add DEM + enable terrain on load (for elevation queries)
    mapRef.current.on('load', () => {
      if (!mapRef.current.getSource('mapbox-dem')) {
        mapRef.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      mapRef.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 });
    });

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
          complete: (result) => {
            const parsed = result.data.map(row => ({
              name: row.name?.trim(),
              lat: parseFloat(row.latitude),
              lon: parseFloat(row.longitude),
            })).filter(gl => !isNaN(gl.lat) && !isNaN(gl.lon));
            setGlacierData(parsed);
          },
        });
      } catch (error) {
        console.error('Error fetching glacier data:', error);
      }
    };

    fetchLakeData();
    fetchGlacierData();

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      mapRef.current?.remove();
      markersRef.current.forEach(marker => marker.remove());
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || lakeData.length === 0) return;
    const map = mapRef.current;

    const addMarkers = () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (showGlaciers) {
        glacierData.forEach((glacier) => {
          const glacierEl = document.createElement('div');
          glacierEl.className = 'marker glacier';
          const glacierMarker = new mapboxgl.Marker(glacierEl).setLngLat([glacier.lon, glacier.lat]).addTo(map);
          markersRef.current.push(glacierMarker);

          // HOVER: show the same popup as click (no fly-to)
          glacierEl.addEventListener('mouseenter', () => {
            if (isPopupLocked.current) return;
            activePopupRef.current?.remove();
            activePopupRef.current = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat([glacier.lon, glacier.lat])
              .setHTML(`<h3>${glacier.name || 'Unnamed'}</h3>`)
              .addTo(map);
          });

          // LEAVE: hide if not locked
          glacierEl.addEventListener('mouseleave', () => {
            if (isPopupLocked.current) return;
            activePopupRef.current?.remove();
            activePopupRef.current = null;
          });

          // CLICK: lock popup and fly
          glacierEl.addEventListener('click', (e) => {
            e.stopPropagation();
            isPopupLocked.current = true;
            activePopupRef.current?.remove();
            activePopupRef.current = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat([glacier.lon, glacier.lat])
              .setHTML(`<h3>${glacier.name || 'Unnamed'}</h3>`)
              .addTo(map);
            map.flyTo({ center: [glacier.lon, glacier.lat], zoom: 10.5, speed: 2 });
          });
        });
      }

      lakeData.forEach((lake) => {
        const { lat, lon, LakeID, LakeName, GlacierName, isHazard, futureHazard, futureHazardETA } = lake;
        if (!isNaN(lat) && !isNaN(lon)) {
          let el = document.createElement('div');
          el.className = isHazard ? 'marker square' : futureHazard ? 'marker diamond' : 'marker circle';

          const marker = new mapboxgl.Marker(el, { anchor: 'center' }).setLngLat([lon, lat]).addTo(map);
          markersRef.current.push(marker);

          const popupContent = `
            <h4>${LakeName || `Lake ${LakeID}`}</h4>
            <p><strong>Glacier:</strong> ${GlacierName || 'Unknown'}<br/>
            ${lake.waterFlow ? `<strong>Flow:</strong> ${lake.waterFlow}<br/>` : ''}
            ${lake.downstream ? `<strong>Downstream:</strong> ${lake.downstream}<br/>` : ''}
            ${futureHazard ? `<em>Potential future hazard${futureHazardETA ? ` (ETA: ${futureHazardETA})` : ''}</em><br/>` : ''}
            ${(isHazard || futureHazard) ? `<a href="#/GLOF-data?lake=${encodeURIComponent(LakeID)}">See full hazard info</a>` : ''}</p>`;

          // HOVER: show same popup as click (no fly-to, no URL change)
          el.addEventListener('mouseenter', () => {
            if (isPopupLocked.current) return;
            activePopupRef.current?.remove();
            activePopupRef.current = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat([lon, lat])
              .setHTML(popupContent)
              .addTo(map);
          });

          // LEAVE: hide if not locked
          el.addEventListener('mouseleave', () => {
            if (isPopupLocked.current) return;
            activePopupRef.current?.remove();
            activePopupRef.current = null;
          });

          // CLICK: lock popup and fly + update URL (unchanged behavior)
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            isPopupLocked.current = true;
            activePopupRef.current?.remove();
            activePopupRef.current = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat([lon, lat])
              .setHTML(popupContent)
              .addTo(map);
            map.flyTo({ center: [lon, lat], zoom: 12, speed: 2 });

            // ✅ Update URL for sharing
            window.history.pushState({}, '', `#/GLOF-map?lake=${encodeURIComponent(LakeID)}`);
          });
        }
      });

      // Map click unlocks and clears any popup (kept)
      map.on('click', () => {
        isPopupLocked.current = false;
        activePopupRef.current?.remove();
        activePopupRef.current = null;
      });
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once('load', addMarkers);
    }
  }, [lakeData, glacierData, showGlaciers]);

  // ✅ Auto-zoom to lake from shared URL with full popup info
  useEffect(() => {
    if (!window.location.hash.startsWith('#/GLOF-map')) return;
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const lakeIdFromURL = params.get('lake');

    if (lakeIdFromURL) {
      const targetLake = lakeData.find(l => l.LakeID === lakeIdFromURL);
      if (targetLake) {
        const {
          lat,
          lon,
          LakeID,
          LakeName,
          GlacierName,
          isHazard,
          futureHazard,
          futureHazardETA,
          waterFlow,
          downstream
        } = targetLake;

        const popupContent = `
          <h4>${LakeName || `Lake ${LakeID}`}</h4>
          <p><strong>Glacier:</strong> ${GlacierName || 'Unknown'}<br/>
          ${waterFlow ? `<strong>Flow:</strong> ${waterFlow}<br/>` : ''}
          ${downstream ? `<strong>Downstream:</strong> ${downstream}<br/>` : ''}
          ${futureHazard ? `<em>Potential future hazard${futureHazardETA ? ` (ETA: ${futureHazardETA})` : ''}</em><br/>` : ''}
          ${(isHazard || futureHazard) ? `<a href="#/GLOF-data?lake=${encodeURIComponent(LakeID)}">See full hazard info</a>` : ''}</p>`;

        mapRef.current.flyTo({ center: [lon, lat], zoom: 12, speed: 2 });

        new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([lon, lat])
          .setHTML(popupContent)
          .addTo(mapRef.current);
      }
    }
  }, [lakeData]);

  // NEW: mousemove listener -> update cursorInfo with lng/lat/elevation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let rafId = null;

    const onMove = (e) => {
      if (rafId) return; // throttle via rAF
      rafId = requestAnimationFrame(() => {
        rafId = null;

        const { lng, lat } = e.lngLat;
        let elevM = null;
        try {
          // returns meters; may be null if DEM not loaded at point yet
          elevM = map.queryTerrainElevation(e.lngLat, { exaggerated: false });
        } catch {
          // ignore if terrain not ready
        }
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
      <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} />

      <button className="toggle-glaciers-button" onClick={() => setShowGlaciers(!showGlaciers)}>
        {showGlaciers ? 'Hide Glaciers' : 'Glacier Locations'}
      </button>

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

      <div className="hotkey-table">
        <table>
          <tbody>
            <tr><td><strong>R</strong></td><td>Reset Zoom</td></tr>
            <tr><td><strong>+</strong></td><td>Zoom in</td></tr>
            <tr><td><strong>-</strong></td><td>Zoom out</td></tr>
          </tbody>
        </table>
      </div>

      {/* NEW: Cursor readout box */}
      <div
        className="cursor-readout"
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          borderRadius: 8,
          fontSize: 12,
          lineHeight: 1.2,
          pointerEvents: 'none',
          zIndex: 2
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

      <MapLegend />
    </>
  );
};

export default AlaskaMap;
