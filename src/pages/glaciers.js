// src/pages/glaciers.js
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './glaciers.css';

const glacierTilesets = [
  {
    url: 'mapbox://mapfean.btwf9o3p',
    sourceLayer: 'glaciers',
    sourceId: 'ak-glaciers',
    fillLayerId: 'glacier-fill-layer',
    lineLayerId: 'glacier-line-layer',
  },
  {
    url: 'mapbox://mapfean3.azk3hose',
    sourceLayer: 'glaciers2',
    sourceId: 'ak-glaciers-2',
    fillLayerId: 'glacier-fill-layer-2',
    lineLayerId: 'glacier-line-layer-2',
  },
];

const GLACIER_NAME_OVERRIDES = {
  Unnamed_23: 'Snow Glacier',
};

const NULLISH_NAMES = new Set(['', 'none', 'null', 'undefined', 'n/a', 'na']);

export function useGlacierLayer({ mapRef }) {
  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    let popup = null;
    let rafId = 0;
    const cleanupFns = [];

    const fillLayerIds = glacierTilesets.map((t) => t.fillLayerId);

    const ensureLayers = () => {
      glacierTilesets.forEach(({ url, sourceId, sourceLayer, fillLayerId, lineLayerId }) => {
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
            paint: { 'line-color': '#fff', 'line-width': 0.000000000001 },
          });
        }
        map.setLayoutProperty(fillLayerId, 'visibility', 'visible');
        map.setLayoutProperty(lineLayerId, 'visibility', 'none');
      });
    };

    const onLoad = () => {
      ensureLayers();

      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: 'glacier-popup',
      });

      const onAnyMove = (e) => {
        const oe = e.originalEvent;
        const target = oe && oe.target;

        if (target && typeof target.closest === 'function') {
          if (target.closest('.marker')) {
            popup && popup.remove();
            return;
          }

          const anyPopup = target.closest('.mapboxgl-popup');
          const isGlacierPopup = target.closest('.glacier-popup');
          if (anyPopup && !isGlacierPopup) {
            popup && popup.remove();
            return;
          }
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const features = map.queryRenderedFeatures(e.point, { layers: fillLayerIds });

          if (!features.length) {
            popup && popup.remove();
            return;
          }

          const rawName =
            features[0].properties &&
            (features[0].properties.glac_name || features[0].properties.name);

          const normalized = rawName != null ? String(rawName).trim() : '';
          const glacName = GLACIER_NAME_OVERRIDES[normalized] || normalized;

          if (glacName && !NULLISH_NAMES.has(glacName.toLowerCase())) {
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
      fillLayerIds.forEach((id) => map.on('mouseleave', id, onLeaveGlacier));

      cleanupFns.push(() => {
        if (rafId) cancelAnimationFrame(rafId);
        map.off('mousemove', onAnyMove);
        fillLayerIds.forEach((id) => map.off('mouseleave', id, onLeaveGlacier));
        popup && popup.remove();
        popup = null;
      });
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
