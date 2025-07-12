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
          complete: (result) => {
            const rawData = result.data.map(row => ({
              LakeID: row.LakeID?.trim(),
              km2: typeof row.km2 === 'number' ? row.km2 : parseFloat(row.km2) || 0,
              lat: typeof row.lat === 'number' ? row.lat : parseFloat(row.lat),
              lon: typeof row.lon === 'number' ? row.lon : parseFloat(row.lon),
              LakeName: (row.LakeName && row.LakeName.trim() !== 'NA') ? row.LakeName.trim() : null,
              GlacierName: (row.GlacierName && row.GlacierName.trim() !== 'NA') ? row.GlacierName.trim() : null,
              isHazard: row.isHazard?.toString().toLowerCase() === 'true',
              futureHazard: row.futureHazard?.toString().toLowerCase() === 'true',
              futureHazardETA: row.futureHazardETA?.trim() || null,
              hazardURL: row.hazardURL?.trim() || null,
            }));
            setLakeData(rawData);
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
    const { lat, lon, km2: area, LakeID, LakeName, GlacierName, isHazard, futureHazard, futureHazardETA, hazardURL } = lake;
    if (!isNaN(lat) && !isNaN(lon)) {
      let el;
      if (isHazard) {
        el = document.createElement('div');
        el.className = 'marker square';
      } else if (futureHazard) {
        el = document.createElement('div');
        el.className = 'marker diamond';
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

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        activePopupRef.current?.remove();

        const popup = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([lon, lat])
          .setHTML(`
            <h4>${LakeName || `Lake ${LakeID}`}</h4>
            <p>
              <strong>Name:</strong> ${LakeName || 'Unnamed'}<br/>
              <strong>Area:</strong> ${area} km²<br/>
              <strong>Glacier:</strong> ${GlacierName || 'Unknown'}<br/>
              ${isHazard && hazardURL ? `<a href="${hazardURL}" target="_blank">Hazard details</a><br/>` : ''}
              ${futureHazard ? `<em>Potential future hazard${futureHazardETA ? ` (ETA: ${futureHazardETA})` : ''}</em>` : ''}
            </p>
          `)
          .addTo(map);

        activePopupRef.current = popup;
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

      <div className="map-legend">
        <div className="map-legend-item">
          <div className="map-legend-circle"></div>
          Stable Lakes
        </div>
        <div className="map-legend-item">
          <div className="map-legend-square"></div>
          Lake Causing GLOF
        </div>
        <div className="map-legend-item">
          <div className="map-legend-diamond"></div>
          Potential Future GLOF
        </div>
      </div>
    </>
  );
};

export default AlaskaMap;
