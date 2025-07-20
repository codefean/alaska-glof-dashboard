import React from "react";
import FloodTable from "./FloodTable"; // adjust path as needed
import "./GLOFData.css";

const GLOFData = () => {
  return (
    <div className="glof-data-container">
      <h2 className="flood-events-title">Alaska Glacier Lakes Dataset</h2>
      <h2 className="flood-events-subheading">Explore Lake Area, Location & Names</h2>

      <div className="about-floods-card">
        <p>
          This page provides an overview of glacier lakes in Alaska. You can explore their areas, locations, and IDs. Click the column headers to sort the data.
        </p>
      </div>

      <FloodTable />
    </div>
  );
};

export default GLOFData;
