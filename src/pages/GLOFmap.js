import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import './GLOFmap.css';

const AlaskaMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [lakeData, setLakeData] = useState([]);
  const markersRef = useRef([]);
  const activePopupRef = useRef(null);
  const placeMarkerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-144.5, 59.5],
      zoom: 4.2,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const fetchCSVData = async () => {
      try {
        const response = await fetch('https://flood-events.s3.us-east-2.amazonaws.com/AK_GL.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: async (result) => {
            const rawData = result.data.map(row => ({
              LakeID: row.LakeID?.trim(),
              km2: typeof row.km2 === 'number' ? row.km2 : parseFloat(row.km2) || 0,
              lat: typeof row.lat === 'number' ? row.lat : parseFloat(row.lat),
              lon: typeof row.lon === 'number' ? row.lon : parseFloat(row.lon),
              LakeName: (row.LakeName && row.LakeName.trim() !== 'NA') ? row.LakeName.trim() : null,
              GlacierName: (row.GlacierName && row.GlacierName.trim() !== 'NA') ? row.GlacierName.trim() : null
            }));

            const enrichLake = async (lake) => {
              let place = null, placeCoords = null;
              const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lake.lon},${lake.lat}.json?limit=1&access_token=${mapboxgl.accessToken}`;
              try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.features?.length) {
                  place = data.features[0].place_name;
                  placeCoords = data.features[0].geometry.coordinates;
                }
              } catch {}
              return { ...lake, place, placeCoords };
            };

            const enrichedData = await Promise.all(rawData.map(enrichLake));
            setLakeData(enrichedData);
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
    const handleKeyDown = (e) => {
      if (!mapRef.current) return;
      switch (e.key) {
        case '+':
        case '=':
          mapRef.current.zoomIn();
          break;
        case '-':
          mapRef.current.zoomOut();
          break;
        case 'r':
        case 'R':
          mapRef.current.flyTo({ center: [-144.5, 59.5], zoom: 4.2, speed: 1.2 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!mapRef.current || lakeData.length === 0) return;

    const map = mapRef.current;

    const addMarkers = () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      lakeData.forEach((lake) => {
        const { lat, lon, km2: area, LakeID, LakeName, GlacierName } = lake;
        if (!isNaN(lat) && !isNaN(lon)) {
          const isFlooding = ['B115', 'B117', 'B86', 'B2'].includes(LakeID);

          let el;
          if (isFlooding) {
            el = document.createElement('div');
            el.className = 'marker triangle';
          } else {
            const radius = Math.sqrt(area) * 4 + 6;
            el = document.createElement('div');
            el.className = 'marker pulse';
            el.style.width = `${radius}px`;
            el.style.height = `${radius}px`;
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.backgroundColor = 'blue';
          }

          const marker = new mapboxgl.Marker(el, { anchor: 'center' })
            .setLngLat([lon, lat])
            .addTo(map);
          markersRef.current.push(marker);

          el.addEventListener('mouseenter', () => {
            activePopupRef.current?.remove();
            const popup = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat([lon, lat])
              .setHTML(`
                <h4>${LakeName || `Lake ${LakeID}`}</h4>
                <p><strong>Name:</strong> ${LakeName || 'Unnamed'}<br/>
                <strong>Area:</strong> ${area} km²<br/>
                <strong>Glacier:</strong> ${GlacierName || 'Unknown'}<br/>
                <strong>Closest place:</strong> ${lake.place || 'Unknown'}</p>
              `)
              .addTo(map);
            activePopupRef.current = popup;
          });

          el.addEventListener('mouseleave', () => {
            activePopupRef.current?.remove();
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            map.flyTo({ center: [lon, lat], zoom: 12.5, speed: 1.4 });
          });
        }
      });

      map.on('click', () => {
        activePopupRef.current?.remove();
      });
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once('load', addMarkers);
    }

  }, [lakeData]);

  return (
    <>
      <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} />
      <div className="map-legend">
        <div className="map-legend-item">
          <div className="map-legend-circle"></div>
          Stable Lakes
        </div>
        <div className="map-legend-item">
          <div className="map-legend-triangle"></div>
          Lakes Causing GLOFs
        </div>
        <div className="hotkey-table">
  <h4>Controls</h4>
  <table>
    <tbody>
      <tr><td><strong>R</strong></td><td>Reset Zoom</td></tr>
      <tr><td><strong>+</strong></td><td>Zoom in</td></tr>
      <tr><td><strong>-</strong></td><td>Zoom out</td></tr>
    </tbody>
  </table>
</div>
      </div>
    </>
  );
};

export default AlaskaMap;
