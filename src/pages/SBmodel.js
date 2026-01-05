import React, { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "./SBmodel.css";


mapboxgl.accessToken = "pk.eyJ1IjoibWFwZmVhbjIiLCJhIjoiY21pcnRhMXBoMDNydDNmb212czFoN253ZyJ9.ieih9K8SJl2FbzPqamwGjA";

export default function Topographic3DTerrainMap() {
  const mapContainer = useRef(null);
  const animationRef = useRef(null);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null); // Store map instance

  const [paused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lakes = useMemo(
    () => [
      { name: "Lake B50", orbitCenter: [-146.87995, 61.6636] },
      { name: "Abyss Lake", orbitCenter: [-136.62418, 58.50103] },
      { name: "Snow Lake", orbitCenter: [-148.93307, 60.48361] },
      { name: "Suicide Basin", orbitCenter: [-134.49752, 58.45798] },
      { name: "Summit Lake", orbitCenter: [-130.06834, 56.1862] },
      { name: "Sklai Lake", orbitCenter: [-141.94131, 61.63694] },
      { name: "Lake B34", orbitCenter: [-132.55151, 57.1023] },
      { name: "Lake B99", orbitCenter: [-150.8763, 62.78959] },
      { name: "Lake B23", orbitCenter: [-140.45603, 60.81413] },
      { name: "Bear Lake", orbitCenter: [-149.6312, 60.0683] },
      { name: "B123", orbitCenter: [-152.49741, 60.71121] },
      { name: "B94", orbitCenter: [-150.69629, 62.85899] },
    ],
    [],
  );

  const [lakeIndex, setLakeIndex] = useState(0);
  const [intervalMs] = useState(20000);
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
          map.setZoom(13);
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

  function toggleFullscreen() {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen();
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen(); // Safari
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        mapRef.current?.resize();
      }, 300);
    };
    document.addEventListener("fullscreenchange", handleResize);
    return () => document.removeEventListener("fullscreenchange", handleResize);
  }, []);

  return (
    <div className="map-wrapper-2" ref={wrapperRef}>
      <div ref={mapContainer} className="map-container-2" />

      <div className="data-box">
        <p>{lakes[lakeIndex].name}</p>
      </div>

      <button className="fullscreen-btn" onClick={toggleFullscreen}>
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
    </div>
  );
}
