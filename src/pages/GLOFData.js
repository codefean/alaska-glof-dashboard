import React from "react";
import FloodTable from "./FloodTable";
import "./GLOFData.css";

const GLOFData = () => {
  return (
    <div className="glof-data-container">
      <h2 className="flood-events-title">Glacier Lakes Dataset</h2>
      <h2 className="flood-events-subheading">
        Explore Lakes with Current Floods & Potential Future Floods
      </h2>
      <div className="about-floods-card">
        <p>
          Glacial lake data will be updated to incorporate the latest
          information and share potential downstream impacts. The current
          dataset focuses on lakes with documented flood hazards. Starting in
          2026, research efforts will expand to identify lakes that may pose
          future flood risks.
        </p>
      </div>

      <FloodTable type="current" />
      <FloodTable type="future" />

      {/* Data Sources Section */}
      <div className="data-sources">
        <h3>Data Sources</h3>
        <ul>
          <li>
            {" "}
            <a
              href="https://www.nature.com/articles/s41467-023-41794-6"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unchanged frequency and decreasing magnitude of outbursts from
            ice-dammed lakes in Alaska (Rick et al., 2023)
            </a>
          </li>
          
          <li>
            <a
              href="https://pubs.usgs.gov/publication/ha455"
              target="_blank"
              rel="noopener noreferrer"
            >
              Glacier dammed lakes and outburst floods in Alaska (Post &amp; Mayo,
            1971)
            </a>
          </li>
          <li>
            {" "}
            <a
              href="https://www.weather.gov/aprfc/gdlMain"
              target="_blank"
              rel="noopener noreferrer"
            >
              NWS Alaska Glacier Dammed Lakes Main Page
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GLOFData;
