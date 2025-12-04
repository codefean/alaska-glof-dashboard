// src/mapSetup.js
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "./constants";

mapboxgl.accessToken = MAPBOX_TOKEN;

export const setupMap = (mapContainer, refs) => {
  const map = new mapboxgl.Map({
    container: mapContainer,
    style: "mapbox://styles/mapbox/satellite-v9",
    center: [-134.49923, 58.45039],
    zoom: 13,
    pitch: 40,
    bearing: -10,
    antialias: true,
  });

  // Save map reference
  refs.mapRef.current = map;

  // Force crosshair cursor globally
  const setCrosshair = () => {
    map.getCanvas().style.setProperty("cursor", "crosshair", "important");
  };
  ["mouseenter", "mousemove", "mousedown", "mouseup", "mouseleave"].forEach((evt) =>
    map.on(evt, setCrosshair)
  );

  // Configure terrain, sky, and controls when map loads
  map.on("load", () => {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });

    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });

    // Add default controls
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
  });

  return map;
};
