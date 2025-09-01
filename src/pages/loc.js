import React, { useEffect, useState, useRef } from "react";
import "./loc.css";

const Loc = ({
  mapRef,
  className = "",
  position = { left: 12, bottom: 12 },
  showFeet = true,
  precision = 5,
}) => {
  const [info, setInfo] = useState({ lng: null, lat: null, elevM: null });
  const rafId = useRef(null);
  const prevInfo = useRef({ lng: null, lat: null, elevM: null });

  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const onMove = (e) => {
      if (!e?.lngLat) return;
      if (rafId.current) return;

      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const { lng, lat } = e.lngLat;

        let elevM = null;
        try {
          // ✅ Only query elevation when DEM & terrain are ready
          if (map.queryTerrainElevation && map.getTerrain()) {
            elevM = map.queryTerrainElevation(e.lngLat, { exaggerated: false });
          }
        } catch {
          elevM = null;
        }

        // Fallback elevation from map projection if terrain is missing
        if (typeof elevM !== "number" || Number.isNaN(elevM)) {
          elevM = null;
        }

        // ✅ Prevent unnecessary re-renders
        const prev = prevInfo.current;
        if (
          prev.lng !== lng ||
          prev.lat !== lat ||
          prev.elevM !== elevM
        ) {
          prevInfo.current = { lng, lat, elevM };
          setInfo(prevInfo.current);
        }
      });
    };

    map.on("mousemove", onMove);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      map.off("mousemove", onMove);
    };
  }, [mapRef, precision, showFeet]);

  const stylePos = {
    ...(position.left != null ? { left: position.left } : {}),
    ...(position.right != null ? { right: position.right } : {}),
    ...(position.top != null ? { top: position.top } : {}),
    ...(position.bottom != null ? { bottom: position.bottom } : {}),
  };

  const feet = info.elevM != null ? Math.round(info.elevM * 3.28084) : null;

  return (
    <div className={`loc-readout ${className}`} style={stylePos}>
      {info.lat != null && info.lng != null ? (
        <>
          <div>
            <strong>Lat:</strong> {info.lat.toFixed(precision)}&nbsp;
            <strong>Lng:</strong> {info.lng.toFixed(precision)}
          </div>
          <div>
            <strong>Elev:</strong>{" "}
            {info.elevM == null
              ? mapRef?.current?.getTerrain()
                ? "Loading…"
                : "—"
              : `${Math.round(info.elevM)} m${showFeet ? ` (${feet} ft)` : ""}`}
          </div>
        </>
      ) : (
        <div>Move cursor over map…</div>
      )}
    </div>
  );
};

export default Loc;
