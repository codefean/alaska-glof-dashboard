// src/pages/glaciers.js
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './glaciers.css';

const glacierTileset = {
  url: 'mapbox://mapfean.btwf9o3p',
  sourceLayer: 'glaciers',
  sourceId: 'ak-glaciers',
  fillLayerId: 'glacier-fill-layer',
  lineLayerId: 'glacier-line-layer',
};

/**
 * Layers that should PREVENT the glacier popup when they are on top.
 * Replace these with your actual lake/marker/cluster layer IDs.
 * Tip: temporarily log top layers with queryRenderedFeatures to confirm (see debug at bottom).
 */
const BLOCK_LAYERS = [
  'glacial-lakes-layer',
  'glacial-lakes-hover',
  'lake-markers',
  'clusters',
];

export function useGlacierLayer({ mapRef }) {
  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const { url, sourceId, sourceLayer, fillLayerId, lineLayerId } = glacierTileset;

    let popup = null;
    let rafId = 0;
    const cleanupFns = [];

    const isOverNonGlacierPopup = (evt) => {
      const oe = evt && evt.originalEvent;
      const target = oe && oe.target;
      if (!target || typeof target.closest !== 'function') return false;
      const anyPopup = target.closest('.mapboxgl-popup');
      const isGlacierPopup = target.closest('.glacier-popup');
      return !!anyPopup && !isGlacierPopup;
    };

    const ensureLayers = () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: 'vector', url });
      }
      if (!map.getLayer(fillLayerId)) {
        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          'source-layer': sourceLayer,
          paint: { 'fill-color': '#2ba0ff', 'fill-opacity': 0.0005 },
        });
      }
      if (!map.getLayer(lineLayerId)) {
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          'source-layer': sourceLayer,
          paint: { 'line-color': '#fff', 'line-width': .000000000001 },
        });
      }
      map.setLayoutProperty(fillLayerId, 'visibility', 'visible');
      map.setLayoutProperty(lineLayerId, 'visibility', 'none');
    };

    const onLoad = () => {
      ensureLayers();

      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: 'glacier-popup',
      });

      // Single handler: decide using the top-most feature under the cursor
      const onAnyMove = (e) => {
        // If hovering a different popup, never show glacier popup
        if (isOverNonGlacierPopup(e)) {
          popup && popup.remove();
          return;
        }

        // Throttle DOM updates
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const stack = map.queryRenderedFeatures(e.point); // top -> bottom
          if (!stack.length) {
            popup && popup.remove();
            return;
          }

          const top = stack[0];
          const topId = top.layer && top.layer.id;

          // If top-most is not the glacier fill OR is an explicitly blocked layer → hide
          if (topId !== fillLayerId || BLOCK_LAYERS.includes(topId)) {
            popup && popup.remove();
            return;
          }

          // Top-most is glacier fill → fetch glacier feature explicitly and label it
          const features = map.queryRenderedFeatures(e.point, { layers: [fillLayerId] });
          if (!features.length) {
            popup && popup.remove();
            return;
          }

          const glacName =
            features[0].properties && (features[0].properties.glac_name || features[0].properties.name);

          if (glacName && String(glacName).trim() !== '') {
            popup
              .setLngLat(e.lngLat)
              .setHTML(`<div class="glacier-label">${glacName}</div>`)
              .addTo(map);
          } else {
            popup && popup.remove();
          }
        });
      };

      const onLeaveGlacier = () => {
        popup && popup.remove();
      };

      map.on('mousemove', onAnyMove);
      map.on('mouseleave', fillLayerId, onLeaveGlacier);

      cleanupFns.push(() => {
        if (rafId) cancelAnimationFrame(rafId);
        map.off('mousemove', onAnyMove);
        map.off('mouseleave', fillLayerId, onLeaveGlacier);
        popup && popup.remove();
        popup = null;
      });

      // --- Debug helper (optional): see which layer is on top under the cursor ---
      // const logTop = (e) => {
      //   const s = map.queryRenderedFeatures(e.point);
      //   if (s[0]) console.log('top layer:', s[0].layer && s[0].layer.id);
      // };
      // map.on('mousemove', logTop);
      // cleanupFns.push(() => map.off('mousemove', logTop));
    };

    if (map.isStyleLoaded()) {
      onLoad();
    } else {
      map.on('load', onLoad);
      cleanupFns.push(() => map.off('load', onLoad));
    }

    return () => {
      cleanupFns.forEach((fn) => fn && fn());
    };
  }, [mapRef]);
}
