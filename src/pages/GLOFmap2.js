import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import './GLOFmap2.css'; // ✅ Updated CSS import
import MapLegend from './MapLegend';
import Citation from './citation';
import PitchControl from "./PitchControl";
import { useGlacierLayer } from './glaciers';

const AlaskaMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const [lakeData, setLakeData] = useState([]);
  const [showGlaciers] = useState(false);
  const [glacierData, setGlacierData] = useState([]);

  const pitchRef = useRef(null);
  const [pitchBottom, setPitchBottom] = useState(100);

  const markersRef = useRef([]);

  // ✅ Layer toggle states
  const [showLakes] = useState(true);
  const [showImpacts] = useState(true);
  const [showPredicted] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 915);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // POPUPS:
  const hoverPopupRef = useRef(null);
  const lockedPopupRef = useRef(null);
  const isPopupLocked = useRef(false);

  const DEFAULT_PITCH = 20;
  const [pitch, setPitch] = useState(DEFAULT_PITCH);

  const resetZoom = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [-144.5, 59.5],
      zoom: 4.5,
      speed: 2.2,
      pitch: DEFAULT_PITCH
    });
    setPitch(DEFAULT_PITCH);
  };

  useEffect(() => {
    const updatePos = () => {
      if (pitchRef.current) {
        const rect = pitchRef.current.getBoundingClientRect();
        setPitchBottom(window.innerHeight - rect.bottom + 12);
      }
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    return () => window.removeEventListener('resize', updatePos);
  }, []);

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
        setTimeout(() => window.scrollTo(0, 0), 30);
      }
    };

    scrollToTop();
    window.addEventListener('hashchange', scrollToTop);
    return () => window.removeEventListener('hashchange', scrollToTop);
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-144.5, 59.9],
      zoom: 4.5,
      antialias: true,
    });
    mapRef.current = map;

    const handleKeydown = (e) => {
      if (e.key.toLowerCase() === 'r') {
        map.flyTo({ center: [-144.5, 59.5], zoom: 4, speed: 2.2, pitch: DEFAULT_PITCH });
        setPitch(DEFAULT_PITCH);
      }
    };

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
              LakeName: row.LakeName?.trim() || null,
              GlacierName: row.GlacierName?.trim() || null,
              isHazard: row.isHazard?.toString().toLowerCase() === 'true',
              futureHazard: row.futureHazard?.toString().toLowerCase() === 'true',
              futureHazardETA: row.futureHazardETA?.trim() || null,
              hazardURL: row.hazardURL?.trim() || null,
              waterFlow: row.waterFlow?.trim() || null,
              downstream: row.downstream?.trim() || null,
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
      el.className = isHazard
        ? 'marker2 square2'
        : futureHazard
        ? 'marker2 diamond2'
        : 'marker2 circle2';

      const popupContent = `
        <h4>${LakeName || `Lake ${LakeID}`}</h4>
        <p>
          <strong>Glacier:</strong> ${GlacierName || 'Unknown'}<br/>
          ${lake.waterFlow ? `<strong>Flow:</strong> ${lake.waterFlow}<br/>` : ''}
          ${lake.downstream ? `<strong>Downstream:</strong> ${lake.downstream}<br/>` : ''}
          ${futureHazard ? `<em>Potential future hazard${futureHazardETA ? ` (ETA: ${futureHazardETA})` : ''}</em><br/>` : ''}
        </p>
        <div class="glof-button-wrapper2">
          ${(isHazard || futureHazard) ? `
            <a 
              href="#/GLOF-data?lake=${encodeURIComponent(LakeID)}" 
              target="_blank"
              rel="noopener noreferrer"
              class="glof-button2"
              style="text-decoration: none;"
            >
              More Info
            </a>` 
          : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker(el, { anchor: 'center' })
        .setLngLat([lon, lat])
        .addTo(map);
      markersRef.current.push(marker);

      let hoverTimeout;

      el.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        hoverPopupRef.current?.remove();

        hoverPopupRef.current = new mapboxgl.Popup({ closeOnClick: false, closeButton: false })
          .setLngLat([lon, lat])
          .setHTML(popupContent)
          .addTo(map);

        hoverTimeout = setTimeout(() => {
          hoverPopupRef.current?.remove();
          hoverPopupRef.current = null;
        }, 2500);
      });

      el.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        hoverPopupRef.current?.remove();
        hoverPopupRef.current = null;
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(hoverTimeout);

        isPopupLocked.current = true;

        lockedPopupRef.current?.remove();
        hoverPopupRef.current?.remove();

        lockedPopupRef.current = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([lon, lat])
          .setHTML(popupContent)
          .addTo(map);

        map.flyTo({ center: [lon, lat], zoom: 12, speed: 2 });
        window.history.pushState({}, '', `#/GLOF-map?lake=${encodeURIComponent(LakeID)}`);
      });
    });
  }, [lakeData, showLakes, showImpacts, showPredicted]);

  useGlacierLayer({
    mapRef,
    showGlaciers,
    glacierData,
    hoverPopupRef,
    lockedPopupRef,
    isPopupLockedRef: isPopupLocked,
  });

  return (
    <div ref={wrapperRef} className="glofmap-page2">
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 1,
        }}
      />

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

      <Citation className="citation-readout2" stylePos={{ position: 'absolute', right: 12, bottom: 12, zIndex: 2 }} />
      <MapLegend />

      <PitchControl ref={pitchRef} mapRef={mapRef} value={pitch} onChange={p => setPitch(p)} />
    </div>
  );
};

export default AlaskaMap;
