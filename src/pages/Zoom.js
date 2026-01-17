import React from "react";
import "./zoom.css";

const ZoomControls = ({ mapRef, isMobile, pitchBottom }) => {
  if (isMobile) return null;

  const zoomIn = () => {
    const map = mapRef.current;
    if (!map) return;
    map.stop();
    map.zoomIn({ duration: 200 });
  };

  const zoomOut = () => {
    const map = mapRef.current;
    if (!map) return;
    map.stop();
    map.zoomOut({ duration: 200 });
  };

  return (
    <div
      className="zoom-controls"
      style={{
        right: 10,
        bottom: (pitchBottom || 1) - 90,
      }}
    >
      <button className="zoom-button" onClick={zoomIn} title="Zoom in">
        +
      </button>

      <button className="zoom-button" onClick={zoomOut} title="Zoom out">
        −
      </button>
    </div>
  );
};

export default ZoomControls;
