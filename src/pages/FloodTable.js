import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodTable.css";

const LOCAL_CSV_URL = process.env.PUBLIC_URL + "/AK_GL.csv";

const COLUMN_NAME_MAPPING = {
  "LakeID": "Lake ID",
  "km2": "Lake Area (km²)",
  "lat": "Latitude",
  "lon": "Longitude",
  "LakeName": "Lake Name"
};

const getRowColor = (km2) => {
  const size = parseFloat(km2);
  if (isNaN(size)) return "white";
  return "white";
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
            const processedData = rawData.map((row, index) => {
              const newRow = { Index: index + 1 };
              Object.keys(row).forEach((key) => {
                const newKey = COLUMN_NAME_MAPPING[key] || key;
                newRow[newKey] = row[key];
              });
              return newRow;
            });

            const newHeaders = ["Index", ...Object.keys(processedData[0] || {}).filter(h => h !== "Index")];

            setData(processedData);
            setSortedData(processedData);
            setHeaders(newHeaders);
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
            Click column headers to sort by Lake Area, Name, etc.
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
                .map((row, rowIndex) => {
                  const bg = getRowColor(row["Lake Area (km²)"]);
                  return (
                    <tr key={rowIndex} style={{ backgroundColor: bg }}>
                      {headers.map((header, colIndex) => (
                        <td key={colIndex}>{row[header] || "—"}</td>
                      ))}
                    </tr>
                  );
                })}
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
