import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./SBmodel.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

export default function Topographic3DTerrainMap() {
  const mapContainer = useRef(null);
  const animationRef = useRef(null);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null); // store map instance

  const [paused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lakes = [
    { name: "Lake B50", orbitCenter: [-146.87995, 61.6636] },
    { name: "Abyss Lake", orbitCenter: [-136.62418, 58.50103] },
    { name: "Snow Lake", orbitCenter: [-148.93307, 60.48361] },
    { name: "Suicide Basin", orbitCenter: [-134.49752, 58.45798] },
    { name: "Summit Lake", orbitCenter: [-130.06834, 56.1862] },
    { name: "Sklai Lake", orbitCenter: [-141.94131, 61.63694] },
    { name: "Lake B34", orbitCenter: [-132.55151, 57.1023] },
  ];

  const [lakeIndex, setLakeIndex] = useState(0);
  const [location, setLocation] = useState({
    orbitCenter: lakes[0].orbitCenter,
  });

  // Cycle lakes every 20s
  useEffect(() => {
    const interval = setInterval(() => {
      setLakeIndex((prev) => {
        const nextIndex = (prev + 1) % lakes.length;
        setLocation({ orbitCenter: lakes[nextIndex].orbitCenter });
        return nextIndex;
      });
    }, 20000);
    return () => clearInterval(interval);
  }, );

  // Initialize map
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

    mapRef.current = map; // store map for later resize

    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 12,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 0.9 });

      map.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.3,
        range: [0.5, 15],
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.15,
      });

      map.setLights([{ id: "sunlight", type: "directional" }]);

      let angle = 0;
      const speedFactor = 9300;

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
      animateCamera(0);
    });

    return () => {
      cancelAnimationFrame(animationRef.current);
      map.remove();
    };
  }, [paused, location]);

  // Fullscreen toggle function
  function toggleFullscreen() {
    const wrapper = wrapperRef.current;

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
        document.webkitExitFullscreen(); // Safari
      }
      setIsFullscreen(false);
    }
  }

  // Handle fullscreen resize for mapbox
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

      {/* Overlay Data Box */}
      <div className="data-box">
        <p>{lakes[lakeIndex].name}</p>
      </div>

      {/* Fullscreen Button */}
      <button className="fullscreen-btn" onClick={toggleFullscreen}>
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
    </div>
  );
}
