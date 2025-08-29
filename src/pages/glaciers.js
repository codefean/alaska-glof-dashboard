import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './glaciers.css';

const glacierTileset = {
  url: 'mapbox://mapfean.btwf9o3p', // Your Mapbox tileset URL/id
  sourceLayer: 'glaciers',          // EXACT layer name from Studio
  sourceId: 'ak-glaciers',          // Internal source id (polygons)
  fillLayerId: 'glacier-fill-layer',
  lineLayerId: 'glacier-line-layer',
};

export function useGlacierLayer({ mapRef }) {
  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const { url, sourceId, sourceLayer, fillLayerId, lineLayerId } = glacierTileset;

    const onLoad = () => {
      // Add glacier source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: 'vector', url });
      }

      // Add fill layer
      if (!map.getLayer(fillLayerId)) {
        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          'source-layer': sourceLayer,
          paint: {
            'fill-color': '#2b9fff',
            'fill-opacity': 0.25,
          },
        });
      }

      // Add outline layer
      if (!map.getLayer(lineLayerId)) {
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          'source-layer': sourceLayer,
          paint: {
            'line-color': '#000000ff',
            'line-width': 20,
          },
        });
      }

      // Always make layers visible
      map.setLayoutProperty(fillLayerId, 'visibility', 'visible');
      map.setLayoutProperty(lineLayerId, 'visibility', 'visible');

      // Create a popup for glacier names
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: 'glacier-popup'
      });

      // Mouse move over glaciers only
      map.on('mousemove', (e) => {
        // Query **only the glacier fill layer**
        const features = map.queryRenderedFeatures(e.point, { layers: [fillLayerId] });

        // If hovering on anything that's NOT a glacier, remove popup
        if (!features.length) {
          popup.remove();
          return;
        }

        const glacName = features[0].properties?.glac_name;

        // If glacier has a name, show it — otherwise hide the popup
        if (glacName && glacName.trim() !== '') {
          popup
            .setLngLat(e.lngLat)
            .setHTML(`<div class="glacier-label">${glacName}</div>`)
            .addTo(map);
        } else {
          popup.remove();
        }
      });

      // Remove popup when leaving glacier area
      map.on('mouseleave', fillLayerId, () => {
        popup.remove();
      });
    };

    if (map.isStyleLoaded()) {
      onLoad();
    } else {
      map.on('load', onLoad);
    }

    return () => {
      map.off('load', onLoad);
    };
  }, [mapRef]);
}
