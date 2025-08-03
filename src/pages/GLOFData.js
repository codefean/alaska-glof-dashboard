import React from "react";
import FloodTable from "./FloodTable";
import "./GLOFData.css";

const GLOFData = () => {
  return (
    <div className="glof-data-container">
      <h2 className="flood-events-title">Glacier Lakes Dataset</h2>
      <h2 className="flood-events-subheading">Explore Lakes with Current Floods & Potential Future Floods</h2>
            <div className="about-floods-card">
        <p>
        Glacial lake data will be updated to incorporate the latest information and share potential downstream impacts. 
        The current dataset focuses on lakes with documented flood hazards. Starting in 2026, research efforts will expand to identify lakes that may pose future flood risks.
        </p>
      </div>

<FloodTable type="current" />
<FloodTable type="future" />  
    </div>

  );
};

export default GLOFData;
