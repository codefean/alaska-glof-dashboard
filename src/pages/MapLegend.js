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
        <div className="map-legend-circle" />
        <div className="map-legend-label">
          <strong>Glacier Dammed Lake</strong>
          {expanded && (
            <div className="legend-description">
              Lake blocked by a glacier, posing flood risk.
            </div>
          )}
        </div>
      </div>

      <div className="map-legend-item">
        <div className="map-legend-square" />
        <div className="map-legend-label">
          <strong>Lake With Known Impacts</strong>
          {expanded && (
            <div className="legend-description">
              An icedamned glacial lake with confirmed flooding and historical impact.
            </div>
          )}
        </div>
      </div>

      <div className="map-legend-item">
        <div className="map-legend-diamond" />
        <div className="map-legend-label">
          <strong>Predicted Glacier Dammed Lake</strong>
          {expanded && (
            <div className="legend-description">
              Forecasted to become an iced dammed glacial lake in the future.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MapLegend;
