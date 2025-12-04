import React, { useEffect, useRef, useState, useMemo  } from "react";
import mapboxgl from "mapbox-gl";
import "./Model.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

export default function Topographic3DTerrainMap() {
  const mapContainer = useRef(null);
  const animationRef = useRef(null);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null); 

  const [paused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

const lakes = useMemo(
  () => [
    { name: "Snow Lake", orbitCenter: [-148.93307, 60.48361] }
  ],
  []
);

  const [lakeIndex, setLakeIndex] = useState(0);
  const [intervalMs] = useState(200000);
  const [location, setLocation] = useState({
    orbitCenter: lakes[0].orbitCenter,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLakeIndex((prev) => {
        let nextIndex = prev;
        while (nextIndex === prev) {
          nextIndex = Math.floor(Math.random() * lakes.length);
        }
        setLocation({ orbitCenter: lakes[nextIndex].orbitCenter });
        return nextIndex;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [lakes, intervalMs]);

  useEffect(() => {
    const { orbitCenter } = location;
    const initialZoom = window.innerWidth < 915 ? 12.2 : 12.7;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: orbitCenter,
      zoom: initialZoom,
      pitch: 60,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 12,
      });

      map.setTerrain({ source: "mapbox-dem", exaggeration: 0.9 });

      map.setLight({
        anchor: "map",
        color: "white",
        intensity: 0.4,
      });

      map.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.3,
        range: [0.5, 15],
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.15,
      });

      let angle = 0;
      const speedFactor = 10000;

      function animateCamera(timestamp) {
        if (!paused) {
          angle = timestamp / speedFactor;
          const radius = 0.01;
          const lng = orbitCenter[0] + radius * Math.cos(angle);
          const lat = orbitCenter[1] + radius * Math.sin(angle);

          map.setCenter([lng, lat]);
          map.setBearing((angle * 180) / Math.PI);
          map.setZoom(12);
        }
        animationRef.current = requestAnimationFrame(animateCamera);
      }

      animationRef.current = requestAnimationFrame(animateCamera);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (map) map.remove();
    };
  }, [paused, location]);


  return (
    <div className="map-wrapper-3" ref={wrapperRef}>
      <div ref={mapContainer} className="map-container-3" />

      <div className="data-box2">
        <p>{lakes[lakeIndex].name}</p>
      </div>

    </div>
  );
}
