 import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodTable.css";

const LOCAL_CSV_URL = process.env.PUBLIC_URL + "/AK_GL.csv";

const COLUMN_NAME_MAPPING = {
  LakeID: "Lake ID",
  LakeName: "Lake Name",
  km2: "Lake Area (km²)",
  lat: "Latitude",
  lon: "Longitude",
  isHazard: "Current Hazard",
  futureHazard: "Future Hazard",
  futureHazardETA: "Time to Future Hazard",
  hazardURL: "Hazard Website",
  summary: "Summary",
  moreinfo: "More Info",
  waterFlow: "Water Flow",
  downstream: "Downstream",
  GlacierName: "Glacier Name",
};

const FloodTable = ({ type = "current" }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expandedRows, setExpandedRows] = useState([]);

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
                const newKey = COLUMN_NAME_MAPPING[key] || key;
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
                    "Lake ID",
                    "Lake Area (km²)",
                    "Latitude",
                    "Longitude",
                    "Future Hazard",
                    "Time to Future Hazard",
                    "Current Hazard",
                  ]
                : [
                    "Lake ID",
                    "Lake Area (km²)",
                    "Latitude",
                    "Longitude",
                    "Future Hazard",
                    "Current Hazard",
                  ];

            const allHeaders = Object.keys(filteredData[0] || {});
            const filteredHeaders = allHeaders.filter(
              (h) => !columnsToExclude.includes(h)
            );

            const orderedHeaders = [
              "Lake Name",
              ...filteredHeaders.filter((h) => h !== "Lake Name"),
            ];

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
  }, [type]);


useEffect(() => {
  if (!sortedData.length || !headers.length) return;

  // Get `lake` param from the hash portion (after "#/GLOF-data?lake=...")
  const hash = window.location.hash; // e.g., "#/GLOF-data?lake=B117"
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



  const handleSort = (column) => {
    const direction =
      sortConfig.key === column && sortConfig.direction === "asc" ? "desc" : "asc";

    const sorted = [...sortedData].sort((a, b) => {
      const aVal = a[column] ?? "";
      const bVal = b[column] ?? "";

      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
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
          <p className="flood-table-title">
            Alaska Glacier Lakes {type === "current" ? "Current" : "Future"} Flood Table
          </p>
          <p className="flood-table-subtitle">
            Showing lakes with {type === "current" ? "current" : "future"} flood hazards
          </p>

          <table className="flood-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="sortable"
                    onClick={() => handleSort(header)}
                  >
                    {header}{" "}
                    {sortConfig.key === header
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
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
                      let cellContent = row[header] || "—";

                      if (
                        (header === "Summary" || header === "More Info") &&
                        !isExpanded &&
                        typeof cellContent === "string" &&
                        cellContent.length > 300
                      ) {
                        cellContent = cellContent.substring(0, 300) + "...";
                      }

                      if (
                        header === "Hazard Website" &&
                        row[header]?.includes("www.")
                      ) {
                        return (
                          <td key={colIndex}>
                            <a
                              href={row[header]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {row[header]}
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
