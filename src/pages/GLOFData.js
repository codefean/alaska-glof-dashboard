import React, { useEffect, useState } from "react";
import FloodTable from "./FloodTable";
import "./GLOFData.css";
import Papa from "papaparse";

const GLOFData = () => {
  const [references, setReferences] = useState([]);

  useEffect(() => {
    fetch("/references.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        setReferences(parsed.data);
      })
      .catch((error) => {
        console.error("Error loading references.csv:", error);
      });
  }, []);

  return (
    <div className="glof-data-container">
      <h2 className="flood-events-title">Glacier Lakes Dataset</h2>
      <h2 className="flood-events-subheading">
        Explore Lakes Impacts
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

      <div className="data-sources">
        <h3>Data Sources</h3>
        <ul>
          {references.map((ref, index) => (
            <li key={index}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ref.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GLOFData;
