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


useEffect(() => {
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  return () => {
    document.body.style.overflow = originalOverflow; 
  };
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
      if (e.key === 'r' || e.key === 'R') {
        mapRef.current.flyTo({ center: [-144.5, 59.5], zoom: 4, speed: 2.2 });
      }
    };
    window.addEventListener('keydown', handleKeydown);

    

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
        const parsed = result.data
          .map(row => ({
            LakeID: row.LakeID?.trim(),
            km2: typeof row.km2 === 'number' ? row.km2 : parseFloat(row.km2) || 0,
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

          }))
          .filter(row => row.LakeID && !isNaN(row.lat) && !isNaN(row.lon));

        console.log('Parsed lake data:', parsed);
        setLakeData(parsed);
      },
    });
  } catch (error) {
    console.error('Error fetching lake data:', error);
  }
};


    // Fetch glaciers CSV
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

    const glacierMarker = new mapboxgl.Marker(glacierEl)
      .setLngLat([glacier.lon, glacier.lat])
      .addTo(map);
    markersRef.current.push(glacierMarker);

    const popupContent = `<h3>${glacier.name || 'Unnamed'}</h3>`;

    const showPopup = () => {
      activePopupRef.current?.remove();
      const popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat([glacier.lon, glacier.lat])
        .setHTML(popupContent)
        .addTo(map);
      activePopupRef.current = popup;
    };

    glacierEl.addEventListener('click', (e) => {
      e.stopPropagation();
      isPopupLocked.current = true;
      showPopup();
      map.flyTo({ center: [glacier.lon, glacier.lat], zoom: 10.5, speed: 2});
    });
    glacierEl.addEventListener('mouseenter', () => {
      if (!isPopupLocked.current) showPopup();
    });
    glacierEl.addEventListener('mouseleave', () => {
      if (!isPopupLocked.current) activePopupRef.current?.remove();
    });
  });
}

      // --- Add lake markers
      lakeData.forEach((lake) => {
        const { lat, lon, LakeID, LakeName, GlacierName, isHazard, futureHazard, futureHazardETA} = lake;
        if (!isNaN(lat) && !isNaN(lon)) {
          let el;
          if (isHazard) {
            el = document.createElement('div');
            el.className = 'marker square';
          } else if (futureHazard) {
            el = document.createElement('div');
            el.className = 'marker diamond';
          } else {
            el = document.createElement('div');
            el.className = 'marker circle';
          }

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
    ${(isHazard || futureHazard) ? `
      <a href="https://codefean.github.io/alaska-glof-dashboard/#/GLOF-data?lake=${encodeURIComponent(LakeID)}" target="_blank">
        See full hazard info
      </a>` : ''}
  </p>
`;

          const showPopup = () => {
            activePopupRef.current?.remove();
            const popup = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat([lon, lat])
              .setHTML(popupContent)
              .addTo(map);
            activePopupRef.current = popup;
          };

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            isPopupLocked.current = true;
            showPopup();
            map.flyTo({ center: [lon, lat], zoom: 12, speed: 2 });
          });
          el.addEventListener('mouseenter', () => {
            if (!isPopupLocked.current) showPopup();
          });
          el.addEventListener('mouseleave', () => {
            if (!isPopupLocked.current) activePopupRef.current?.remove();
          });
        }
      });


      map.on('click', () => {
        isPopupLocked.current = false;
        activePopupRef.current?.remove();
      });
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once('load', addMarkers);
    }

  }, [lakeData, glacierData, showGlaciers]);

  // Handle search and zoom to lake
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

  <button
    className="toggle-glaciers-button"
    onClick={() => setShowGlaciers(!showGlaciers)}>
    {showGlaciers ? 'Hide Glaciers' : 'Show Glaciers'}
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
          const matches = lakeData.filter(lake =>
            (lake.LakeName && lake.LakeName.toLowerCase().includes(value.toLowerCase())) ||
            (lake.LakeID && lake.LakeID.toLowerCase().includes(value.toLowerCase()))
          ).slice(0, 4);
          setSuggestions(matches);
        } else {
          setSuggestions([]);
        }
      }}
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
    />
    {suggestions.length > 0 && (
      <ul className="dropdown-suggestions">
        {suggestions.map((lake, index) => (
          <li
            key={index}
            onClick={() => {
              setSearchQuery(lake.LakeName || lake.LakeID);
              setSuggestions([]);
              mapRef.current?.flyTo({
                center: [lake.lon, lake.lat],
                zoom: 12,
                speed: 2,
              });
            }}
          >
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

<MapLegend />

    </>
  );
};

export default AlaskaMap;