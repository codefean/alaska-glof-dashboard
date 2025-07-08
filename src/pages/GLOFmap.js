import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import Sidebar from './sidebar';
import './GLOFmap.css';

const AlaskaMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [lakeData, setLakeData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const markersRef = useRef([]);
  const activePopupRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-144.5, 59.5],
      zoom: 4.2,
    });

    const fetchCSVData = async () => {
      try {
        const response = await fetch('https://flood-events.s3.us-east-2.amazonaws.com/AK_GL.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const cleanedData = result.data.map(row => ({
              LakeID: row.LakeID,
              km2: typeof row.km2 === 'number' ? row.km2 : parseFloat(row.km2) || 0,
              lat: typeof row.lat === 'number' ? row.lat : parseFloat(row.lat),
              lon: typeof row.lon === 'number' ? row.lon : parseFloat(row.lon),
              LakeName: (row.LakeName && row.LakeName !== 'NA') ? row.LakeName : null
            }));

            setLakeData(cleanedData);

            // Group lakes by region
            const grouped = {};
            cleanedData.forEach(lake => {
              const lon = lake.lon;
              let region = '';
              if (lon < -155) region = 'Western Alaska';
              else if (lon <= -145) region = 'Central Alaska';
              else region = 'Eastern Alaska';

              if (!grouped[region]) grouped[region] = [];
              grouped[region].push({ ...lake, Region: region });
            });
            setGroupedData(grouped);
          },
        });
      } catch (error) {
        console.error('Error fetching CSV data:', error);
      }
    };

    fetchCSVData();

    return () => {
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

      lakeData.forEach((lake) => {
        const { lat, lon, km2: area, LakeID, LakeName } = lake;
        if (!isNaN(lat) && !isNaN(lon)) {
          const radius = Math.sqrt(area) * 4 + 6;

          const el = document.createElement('div');
          el.className = 'marker pulse';
          el.style.width = `${radius}px`;
          el.style.height = `${radius}px`;
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.backgroundColor = 'blue';
          el.style.cursor = 'pointer';

          const marker = new mapboxgl.Marker(el, { anchor: 'center' })
            .setLngLat([lon, lat])
            .addTo(map);
          markersRef.current.push(marker);

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            flyToLake(lake);
          });
        }
      });

      map.on('click', () => {
        activePopupRef.current?.remove();
        activePopupRef.current = null;
      });
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once('load', addMarkers);
    }

  }, [lakeData]);

  const flyToLake = (lake) => {
    const { lon, lat, LakeID, LakeName, km2: area } = lake;
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lon, lat],
      zoom: 12.5,
      speed: 1.4
    });

    activePopupRef.current?.remove();
    const popup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat([lon, lat])
      .setHTML(`
        <h4>Lake ${LakeID}</h4>
        <p><strong>Name:</strong> ${LakeName || 'Unnamed'}<br/>
        <strong>Area:</strong> ${area} km²</p>
      `)
      .addTo(mapRef.current);

    activePopupRef.current = popup;
  };

  return (
    <>
      <Sidebar
        groupedData={groupedData}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLakeSelect={flyToLake}
      />
      <div
        ref={mapContainerRef}
        style={{ width: '100vw', height: '100vh' }}
      />
    </>
  );
};

export default AlaskaMap;
