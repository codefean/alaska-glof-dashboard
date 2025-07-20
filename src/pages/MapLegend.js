// MapLegend.js
import React, { useEffect, useRef, useState } from 'react';
import './MapLegend.css';

const MapLegend = () => {
  const [expanded, setExpanded] = useState(false);
  const legendRef = useRef(null);

  // Collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (legendRef.current && !legendRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`map-legend ${expanded ? 'expanded' : ''}`}
      ref={legendRef}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="map-legend-item">
        <div className="map-legend-circle"></div>
        Glacier Dammed Lake
        {expanded && <span className="legend-description">Lake blocked by a glacier, posing flood risk.</span>}
      </div>
      <div className="map-legend-item">
        <div className="map-legend-square"></div>
        Lake With Known Impacts
        {expanded && <span className="legend-description">A lake with confirmed flooding and historical impact.</span>}
      </div>
      <div className="map-legend-item">
        <div className="map-legend-diamond"></div>
        Predicted Glacier Dammed Lake
        {expanded && <span className="legend-description">Forecasted to become a glacier dammed lake in the future.</span>}
      </div>
      <div className="map-legend-item">
        <div className="map-legend-glacier"></div>
      Glacier
        {expanded && <span className="legend-description">Slow-moving mass of ice formed from compacted snow that accumulates over time and flows under its own weight.</span>}
      </div>
    </div>
  );
};

export default MapLegend;
