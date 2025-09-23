// src/LayersToggle.js
import React from "react";
import "./LayersToggle.css";

const LayersToggle = ({
  showLakes,
  setShowLakes,
  showImpacts,
  setShowImpacts,
  showPredicted,
  setShowPredicted,
}) => {
  return (
<div className="layer-toggle-panel">
  <h4>Active Layers</h4>

  <div className="layer-icons">
    <div
      className={`layer-circle toggle-icon ${showLakes ? "active" : ""}`}
      onClick={() => setShowLakes(!showLakes)}
    />
    <div
      className={`layer-square toggle-icon ${showImpacts ? "active" : ""}`}
      onClick={() => setShowImpacts(!showImpacts)}
    />
    <div
      className={`layer-diamond toggle-icon ${showPredicted ? "active" : ""}`}
      onClick={() => setShowPredicted(!showPredicted)}
    />
  </div>
</div>

  );
};

export default LayersToggle;
