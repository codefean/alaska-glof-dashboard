// src/pages/FloodDataTable.js
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodTable.css";

const COLUMN_NAME_MAPPING = {
  lakeid: "Lake ID",
  lakename: "Lake Name",
  km2: "Lake Area (km²)",
  lat: "Latitude",
  lon: "Longitude",
  ishazard: "Current Hazard",
  futurehazard: "Future Hazard",
  futurehazardeta: "Time to Future Hazard",
  hazardurl: "Hazard Info",
  summary: "Summary",
  moreinfo: "More Info",
  waterflow: "Water Flow",
  downstream: "Downstream",
  glaciername: "Glacier Name",
  frequency: "Frequency",
};


const TABLE_CONFIG = {
  current: {
    excluded: [
      "Lake Area (km²)",
      "Latitude",
      "Longitude",
      "Future Hazard",
      "Time to Future Hazard", 
      "Current Hazard",
      "More Info",
    ],
    title: "Current Alaska Glacier Lakes",
    filterFn: (row) => row["Current Hazard"]?.toLowerCase() === "true",
  },
  future: {
    excluded: [
      "Lake Area (km²)",
      "Latitude",
      "Longitude",
      "Current Hazard", 
      "Frequency",
      "Future Hazard",
      "Hazard Info",
    ],
    title: "Future Alaska Glacier Lakes (2026)",
    filterFn: (row) => row["Future Hazard"]?.toLowerCase() === "true",
  },
};

const FloodDataTable = ({
  csvUrl = process.env.PUBLIC_URL + "/AK_GL.csv",
  type = "current",
  subtitle = "",
}) => {
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [,setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  const { excluded, title, filterFn } = TABLE_CONFIG[type] || TABLE_CONFIG.current;

  useEffect(() => {
    fetch(csvUrl)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rawData = result.data;

            // Normalize keys
            const processedData = rawData.map((row) => {
              const newRow = {};
              Object.keys(row).forEach((key) => {
                const normalizedKey = Object.keys(COLUMN_NAME_MAPPING).find(
                  (mappedKey) => mappedKey.toLowerCase() === key.toLowerCase()
                );
                const newKey = normalizedKey
                  ? COLUMN_NAME_MAPPING[normalizedKey]
                  : key;
                newRow[newKey] = row[key];
              });
              return newRow;
            });

            // Apply filter based on type
            const filteredData = processedData.filter(filterFn);

            // Exclude columns
            const allHeaders = Object.keys(filteredData[0] || {});
            const filteredHeaders = allHeaders.filter(
              (h) => !excluded.includes(h)
            );

            // Ensure Lake Name first
            const orderedHeaders = [
              "Lake Name",
              ...filteredHeaders.filter((h) => h !== "Lake Name"),
            ];

            // Always add View on Map
            const finalHeaders = [...orderedHeaders, "View on Map"];

            setData(filteredData);
            setSortedData(filteredData);
            setHeaders(finalHeaders);
            setLoading(false);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
        setLoading(false);
      });
  }, [csvUrl, type, excluded, filterFn]);


  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className={`glacier-table-container`}>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="glacier-table-header">
            <h3 className="glacier-table-title">{title}</h3>
            <h4 className="glacier-table-subtitle">{subtitle}</h4>

            
          </div>

          <table className="glacier-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                  >
                    {header}{" "}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, rowIndex) => {
                const isExpanded = expandedRows.includes(rowIndex);
                return (
                  <tr
                    key={rowIndex}
                    onClick={() => toggleRow(rowIndex)}
                    className="expandable-row"
                  >
                    {headers.map((header, colIndex) => {
                      let content = row[header] || "—";

                      
                      if (
                        ["Summary", "More Info"].includes(header) &&
                        !isExpanded &&
                        typeof content === "string" &&
                        content.length > 120
                      ) {
                        content = content.substring(0, 100) + "...";
                      }

                      
                      if (header === "View on Map") {
                        return (
                          <td key={colIndex}>
                            <a
                              className="glacier-button"
                              href={`#/GLOF-map?lake=${encodeURIComponent(
                                row["Lake ID"]
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Map
                            </a>
                          </td>
                        );
                      }

                      
                      if (
                        header === "Hazard Info" &&
                        typeof row[header] === "string"
                      ) {
                        const rawUrl = row[header];
                        if (rawUrl.includes("www.") || rawUrl.includes("http")) {
                          const url = rawUrl.startsWith("http")
                            ? rawUrl
                            : `https://${rawUrl}`;
                          return (
                            <td key={colIndex}>
                              <a
                                className="glacier-button"
                                href={encodeURI(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Link
                              </a>
                            </td>
                          );
                        }
                      }

                      return (
                        <td
                          key={colIndex}
                          className={
                            ["Summary", "More Info"].includes(header)
                              ? "summary-cell scrollable-summary"
                              : ""
                          }
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default FloodDataTable;
