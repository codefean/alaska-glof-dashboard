import { useEffect } from "react";
import "./loc.css";

/**
 * Custom hook to track mouse position on the map and get elevation.
 * @param {Object} mapRef - React ref pointing to the map instance.
 * @param {Function} setCursorInfo - Setter function to update cursor info state.
 */
export function useCursorLocation(mapRef, setCursorInfo) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let rafId = null;

    const onMove = (e) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const { lng, lat } = e.lngLat;
        let elevM = null;

        try {
          elevM = map.queryTerrainElevation(e.lngLat, { exaggerated: false });
        } catch {
          // ignore errors if terrain is unavailable
        }

        if (typeof elevM !== "number" || Number.isNaN(elevM)) {
          elevM = null;
        }

        setCursorInfo({ lng, lat, elevM });
      });
    };

    map.on("mousemove", onMove);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      map.off("mousemove", onMove);
    };
  }, [mapRef, setCursorInfo]);
}
