import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodTable.css";

const LOCAL_CSV_URL = process.env.PUBLIC_URL + "/AK_GL.csv";

const COLUMN_NAME_MAPPING = {
  "LakeID": "Lake ID",
  "LakeName": "Lake Name",
  "km2": "Lake Area (km²)",
  "lat": "Latitude",
  "lon": "Longitude",
  "isHazard": "Current Hazard",
  "futureHazard": "Future Hazard",
  "hazardURL": "Hazard Website",
};

const FloodTable = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expanded, setExpanded] = useState(false);

  const visibleCount = 10;

  useEffect(() => {
    fetch(LOCAL_CSV_URL)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rawData = result.data;

            const processedData = rawData.map((row) => {
              const newRow = {};
              Object.keys(row).forEach((key) => {
                const newKey = COLUMN_NAME_MAPPING[key] || key;
                newRow[newKey] = row[key];
              });
              return newRow;
            });

            // Filter: only keep rows with hazard
            const filteredData = processedData.filter(row =>
              row["Current Hazard"]?.toLowerCase() === "true" ||
              row["Future Hazard"]?.toLowerCase() === "true"
            );

            // Columns to remove (after mapping)
            const columnsToExclude = [
              "Lake ID",
              "Lake Area (km²)",
              "Latitude",
              "Longitude"
            ];

            const allHeaders = Object.keys(filteredData[0] || {});
            const filteredHeaders = allHeaders.filter(h => !columnsToExclude.includes(h));

            // Move "Lake Name" to first
            const orderedHeaders = ["Lake Name", ...filteredHeaders.filter(h => h !== "Lake Name")];

            setData(filteredData);
            setSortedData(filteredData);
            setHeaders(orderedHeaders);
            setLoading(false);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
        setLoading(false);
      });
  }, []);

  const handleSort = (column) => {
    const direction = sortConfig.key === column && sortConfig.direction === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) => {
      const aValue = parseFloat(a[column]);
      const bValue = parseFloat(b[column]);
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return direction === "asc"
        ? String(a[column]).localeCompare(String(b[column]))
        : String(b[column]).localeCompare(String(a[column]));
    });
    setSortedData(sorted);
    setSortConfig({ key: column, direction });
  };

  return (
    <div className="flood-table-container">
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <h3 className="flood-table-title">Alaska Glacier Lakes Table</h3>
          <h4 className="flood-table-subtitle">
            Showing only lakes with current or future flood hazards.
          </h4>

          <table className="flood-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="sortable" onClick={() => handleSort(header)}>
                    {header} {sortConfig.key === header ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData
                .slice(0, expanded ? sortedData.length : visibleCount)
                .map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      <td key={colIndex}>{row[header] || "—"}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>

          {sortedData.length > visibleCount && (
            <button className="expand-button" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default FloodTable;
