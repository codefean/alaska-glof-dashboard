import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import './GLOFmap.css';
import MapLegend from './MapLegend';
import Citation from './citation';
import AboutMap from './AboutMap';
import PitchControl from "./PitchControl";
import "./loc";
import LayersToggle from "./LayersToggle";
import { useGlacierLayer } from './glaciers';
import { buildLakePopupHTML, createPopupController } from "./popups";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

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

  const hoverPopupRef = useRef(null);
  const lockedPopupRef = useRef(null);
  const isPopupLocked = useRef(false);

  const popupControllerRef = useRef(null);

  const [showLakes, setShowLakes] = useState(true);
  const [showImpacts, setShowImpacts] = useState(true);
  const [showPredicted, setShowPredicted] = useState(true);

  const DEFAULT_PITCH = 20;
  const [pitch, setPitch] = useState(DEFAULT_PITCH);

  const [cursorInfo, setCursorInfo] = useState({ lng: null, lat: null, elevM: null });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 915);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };

    scrollToTop();
    window.addEventListener('hashchange', scrollToTop);
    return () => window.removeEventListener('hashchange', scrollToTop);
  }, []);

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
    // ✅ Pass token directly to constructor too (most reliable)
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-144.5, 59.9],
      zoom: 4,
      antialias: true,
      accessToken: MAPBOX_TOKEN,
    });

    mapRef.current = map;

    popupControllerRef.current = createPopupController({
      map,
      hoverPopupRef,
      lockedPopupRef,
      isPopupLockedRef: isPopupLocked,
      hoverAutoCloseMs: 20000,
    });

    const handleKeydown = (e) => {
      if (e.key.toLowerCase() === 'r') {
        map.flyTo({ center: [-144.5, 59.5], zoom: 4, speed: 2.2, pitch: DEFAULT_PITCH });
        setPitch(DEFAULT_PITCH);
      }
    };
    window.addEventListener('keydown', handleKeydown);

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
        const response = await fetch('https://flood-events.s3.us-east-2.amazonaws.com/AK_GL_clean.csv');
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
              numberEvents: parseInt(row.numberEvents) || 0,
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
      popupControllerRef.current?.clearLocked();
    };
    map.on('click', clearLock);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      map.off('click', clearLock);

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      popupControllerRef.current?.clearHover();
      popupControllerRef.current?.clearLocked();
      popupControllerRef.current = null;

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
      const { lat, lon, LakeID, isHazard, futureHazard } = lake;
      if (isNaN(lat) || isNaN(lon)) return;

      if (!showLakes && !isHazard && !futureHazard) return;
      if (!showImpacts && isHazard) return;
      if (!showPredicted && futureHazard) return;

      const el = document.createElement('div');
      el.className = isHazard ? 'marker square' : futureHazard ? 'marker diamond' : 'marker circle';

      const marker = new mapboxgl.Marker(el, { anchor: 'center' })
        .setLngLat([lon, lat])
        .addTo(map);

      markersRef.current.push(marker);

      const popupHTML = buildLakePopupHTML(lake);

      popupControllerRef.current?.attachToMarkerEl({
        el,
        lon,
        lat,
        html: popupHTML,
        onLock: () => {
          map.flyTo({ center: [lon, lat], zoom: 13.5, speed: 2 });
          window.history.pushState({}, '', `#/GLOF-map?lake=${encodeURIComponent(LakeID)}`);
        },
      });
    });
  }, [lakeData, showLakes, showImpacts, showPredicted]);

  useEffect(() => {
    if (!window.location.hash.startsWith('#/GLOF-map')) return;

    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const lakeIdFromURL = params.get('lake');
    if (!lakeIdFromURL) return;

    const targetLake = lakeData.find(l => l.LakeID === lakeIdFromURL);
    if (!targetLake || !mapRef.current) return;

    const { lat, lon } = targetLake;
    if (isNaN(lat) || isNaN(lon)) return;

    const popupHTML = buildLakePopupHTML(targetLake);

    mapRef.current.flyTo({ center: [lon, lat], zoom: 13.5, speed: 2 });

    popupControllerRef.current?.showLocked({
      lngLat: [lon, lat],
      html: popupHTML,
    });

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, [lakeData]);

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
          height: 'calc(100vh - 70px)',
          overflow: 'hidden',
          zIndex: 1
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



    </>
  );
};

export default AlaskaMap;
