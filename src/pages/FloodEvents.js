import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import FloodGraph from "./FloodGraph";
import FloodTable from "./FloodTable";
import "./FloodEvents.css";

const S3_CSV_URL = "https://flood-events.s3.us-east-2.amazonaws.com/FloodEvents.csv";

const COLUMN_NAME_MAPPING = {
  "Release Stage D.S. Gage (ft)": "Release Start Stage at Mendenhall Lake (ft)",
  "D.S. Gage Release Flow (cfs)": "Release Flow Rate at Mendenhall Lake (cfs)",
  "Crest Date": "Peak Water Level Date",
  "Crest Stage D.S. Gage (ft)": "Peak Water Level at Mendenhall Lake (ft)",
  "D.S. Gage Crest Flow (cfs)": "Peak Water Level Flow Rate (cfs)",
  "Impacts": "NWS Impacts",
};

const EXCLUDED_COLUMNS = ["Remarks", "Lake Peak Stage (ft)", "Release Volume (ac-ft)"];

const FloodEvents = () => {
  const [data, setData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestFloodEvent, setLatestFloodEvent] = useState(null);
  const [largestFloodEvent, setLargestFloodEvent] = useState(null);

  useEffect(() => {
    fetch(S3_CSV_URL)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setLoading(false);
            const filteredHeaders = result.meta.fields
              .filter(header => !EXCLUDED_COLUMNS.includes(header))
              .map(header => COLUMN_NAME_MAPPING[header] || header);
            setHeaders(filteredHeaders);

            const filteredData = result.data.map((row) => {
              const filteredRow = {};
              Object.keys(row).forEach((key) => {
                if (!EXCLUDED_COLUMNS.includes(key)) {
                  const newKey = COLUMN_NAME_MAPPING[key] || key;
                  filteredRow[newKey] = row[key] === "-" ? "" : row[key];
                }
              });
              return filteredRow;
            });
            setData(filteredData);

            if (filteredData.length > 0) {
              setLatestFloodEvent(filteredData[0]); // Most recent flood event
              setLargestFloodEvent(
                filteredData.reduce((max, row) =>
                  parseFloat(row["Peak Water Level at Mendenhall Lake (ft)"]) >
                  parseFloat(max["Peak Water Level at Mendenhall Lake (ft)"])
                    ? row
                    : max
                )
              ); // Event with the highest peak water level
            }

            const scatterPoints = filteredData
              .filter(row => row["Peak Water Level Date"] && row["Peak Water Level at Mendenhall Lake (ft)"])
              .map(row => ({
                x: row["Peak Water Level Date"],
                y: parseFloat(row["Peak Water Level at Mendenhall Lake (ft)"]),
              }));
            setScatterData(scatterPoints);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading CSV from S3:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flood-events-container">
      <h3 className="flood-subheading">Explore Historical Outburst Flood Data</h3>
      <div className="flood-cards-container">
      {latestFloodEvent && (
        <div className="floodcard last-glof">
          <h2>Most Recent Flood Event</h2>
          <p><strong>Peak Water Level:</strong> {latestFloodEvent["Peak Water Level at Mendenhall Lake (ft)"]} ft</p>
          <p><strong>Duration:</strong> {latestFloodEvent["Release Start Date"]} -- {latestFloodEvent["Peak Water Level Date"]}</p>
        </div>
      )}

      {largestFloodEvent && (
        <div className="floodcard largest-glof">
          <h2>Largest Flood Event</h2>
          <p><strong>Peak Water Level:</strong> {largestFloodEvent["Peak Water Level at Mendenhall Lake (ft)"]} ft</p>
          <p><strong>Duration:</strong> {largestFloodEvent["Release Start Date"]} -- {largestFloodEvent["Peak Water Level Date"]}</p>
        </div>
      )}
    </div>

      <div className="visuals-container">
        <FloodGraph scatterData={scatterData} />
      </div>
      <FloodTable headers={headers} data={data} loading={loading} />
    </div>
  );
};

export default FloodEvents;
