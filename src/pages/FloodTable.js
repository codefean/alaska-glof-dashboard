import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodTable.css";

const LOCAL_CSV_URL = process.env.PUBLIC_URL + "/AK_GL.csv";

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

const FloodTable = ({ type = "current" }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedData, setSortedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [fontSize, setFontSize] = useState("font-default"); // 'font-default', 'font-medium', 'font-large'


  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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

            const filteredData = processedData.filter((row) =>
              type === "current"
                ? row["Current Hazard"]?.toLowerCase() === "true"
                : row["Future Hazard"]?.toLowerCase() === "true"
            );

            const columnsToExclude =
              type === "current"
                ? [
                    "Lake Area (km²)",
                    "Latitude",
                    "Longitude",
                    "Future Hazard",
                    "Time to Future Hazard",
                    "Current Hazard",
                    "More Info",
                  ]
                : [
                    "Lake Area (km²)",
                    "Latitude",
                    "Longitude",
                    "Future Hazard",
                    "Current Hazard",
                    "Frequency",
                  ];

            const allHeaders = Object.keys(filteredData[0] || {});
            const filteredHeaders = allHeaders.filter(
              (h) => !columnsToExclude.includes(h)
            );

            const orderedHeaders = [
              "Lake Name",
              ...filteredHeaders.filter((h) => h !== "Lake Name"),
            ];

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
  }, [type]);

  useEffect(() => {
    if (!sortedData.length || !headers.length) return;

    const hash = window.location.hash;
    const [, queryString] = hash.split("?");
    if (!queryString) return;

    const lakeID = new URLSearchParams(queryString).get("lake");
    if (!lakeID) return;

    const targetIndex = sortedData.findIndex((row) => row["Lake ID"] === lakeID);
    if (targetIndex === -1) return;

    const rowElement = document.getElementById(`lake-row-${lakeID}`);
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
      rowElement.classList.add("highlighted-row");
      setTimeout(() => {
        rowElement.classList.remove("highlighted-row");
      }, 5000);
    }
  }, [sortedData, headers]);

  

  return (
    <div className={`flood-table-container ${fontSize}`}>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="flood-table-header">
            <p className="flood-table-title">
              {type === "current" ? "Current" : "Future"} Alaska Glacier Lakes Flood Table
            </p>
            <div className="font-size-buttons">
              <button
                onClick={() => setFontSize("font-default")}
                className={fontSize === "font-default" ? "active" : ""}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("font-medium")}
                className={fontSize === "font-medium" ? "active" : ""}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("font-large")}
                className={fontSize === "font-large" ? "active" : ""}
              >
                A
              </button>
            </div>
          </div>

          <table className="flood-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="sortable"
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
                    id={`lake-row-${row["Lake ID"]}`}
                    onClick={() => toggleRow(rowIndex)}
                    className="expandable-row"
                  >
                    {headers.map((header, colIndex) => {
                      if (header === "View on Map") {
                        return (
                          <td key={colIndex}>
                            <a
                              className="button"
                              href={`#/GLOF-map?lake=${encodeURIComponent(row["Lake ID"])}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Map
                            </a>
                          </td>
                        );
                      }

                      let cellContent = row[header] || "—";

                      if (
                        (header === "Summary" || header === "More Info") &&
                        !isExpanded &&
                        typeof cellContent === "string" &&
                        cellContent.length > 180
                      ) {
                        cellContent = cellContent.substring(0, 180) + "...";
                      }

                      if (
                        header === "Hazard Info" &&
                        typeof row[header] === "string" &&
                        (row[header].includes("www.") || row[header].includes("https:"))
                      ) {
                        const rawUrl = row[header];
                        const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
                        return (
                          <td key={colIndex}>
                            <a
                              className="button"
                              href={encodeURI(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Link
                            </a>
                          </td>
                        );
                      }

                      return <td key={colIndex}>{cellContent}</td>;
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

export default FloodTable;