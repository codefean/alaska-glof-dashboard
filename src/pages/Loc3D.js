import React, { useEffect, useState } from "react";
import "./loc.css";

export default function Loc3D({
  mapRef,
  className = "",
  position = { left: 12, bottom: 12 },
  showFeet = true,
  precision = 5,
}) {
  const [info, setInfo] = useState({ lng: null, lat: null, elevM: null });

  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const handleMouseMove = (e) => {
      if (!e?.lngLat) return;

      const { lng, lat } = e.lngLat;

      // Query elevation only if terrain & DEM tiles are ready
      let elevM = null;
      if (map.queryTerrainElevation && map.getTerrain()) {
        try {
          elevM = map.queryTerrainElevation(e.lngLat, { exaggerated: false });
          if (typeof elevM !== "number" || Number.isNaN(elevM)) {
            elevM = null;
          }
        } catch {
          elevM = null;
        }
      }

      setInfo({ lng, lat, elevM });
    };

    // Attach mouse move listener
    map.on("mousemove", handleMouseMove);

    // Cleanup on unmount
    return () => {
      map.off("mousemove", handleMouseMove);
    };
  }, [mapRef]);

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
}
