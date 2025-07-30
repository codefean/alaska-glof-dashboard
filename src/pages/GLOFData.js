import React from "react";
import FloodTable from "./FloodTable";
import "./GLOFData.css";

const GLOFData = () => {
  return (
    <div className="glof-data-container">
      <h2 className="flood-events-title">Glacier Lakes Dataset</h2>
      <h2 className="flood-events-subheading">Explore Lakes with Current Floods and Potential Future Floods</h2>

      <div className="about-floods-card">
        <p>
          This page provides an overview of glacier lakes in Alaska. You can explore their areas, locations, and IDs. Click the column headers to sort the data.
        </p>
      </div>

<FloodTable type="current" />
<FloodTable type="future" />  
    </div>

  );
};

export default GLOFData;
