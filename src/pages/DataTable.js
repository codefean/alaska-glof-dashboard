// src/pages/DataTable.js
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodTable.css";

const DataTable = ({
  csvUrl,
  columnNameMapping = {},
  excludedColumns = [],
  title = "Data Table",
  subtitle = "Select Columns to Explore",
  filterFn, 
  extraColumns = [], 
  expandableColumns = [], 
}) => {
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    fetch(csvUrl)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rawData = result.data;

            let processedData = rawData.map((row, idx) => {
              const newRow = { Index: idx + 1 };
              Object.keys(row).forEach((key) => {
                if (!excludedColumns.includes(key)) {
                  const normalizedKey = Object.keys(columnNameMapping).find(
                    (mappedKey) => mappedKey.toLowerCase() === key.toLowerCase()
                  );
                  const newKey = normalizedKey
                    ? columnNameMapping[normalizedKey]
                    : key;
                  newRow[newKey] = row[key];
                }
              });
              return newRow;
            });

            if (filterFn) {
              processedData = processedData.filter(filterFn);
            }

            const newHeaders = [
              "Index",
              ...Object.keys(processedData[0] || {}).filter(
                (h) => h !== "Index"
              ),
              ...extraColumns,
            ];

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
  }, [csvUrl, columnNameMapping, excludedColumns, filterFn, extraColumns]);

  const handleSort = (column) => {
    const direction =
      sortConfig.key === column && sortConfig.direction === "asc"
        ? "desc"
        : "asc";

    const sorted = [...sortedData].sort((a, b) => {
      const aVal = a[column] || "";
      const bVal = b[column] || "";
      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setSortedData(sorted);
    setSortConfig({ key: column, direction });
  };

  const toggleRow = (index) => {
    if (window.innerWidth <= 915) return; 
    setExpandedRows((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="glacier-table-container">
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <h3 className="glacier-table-title">{title}</h3>
          <h4 className="glacier-table-subtitle">{subtitle}</h4>

          <table className="glacier-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    onClick={() => handleSort(header)}
                    className="sortable"
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
                    onClick={() => toggleRow(rowIndex)}
                    className="expandable-row"
                  >
                    {headers.map((header, colIndex) => {
                      let content = row[header] || "—";

            
                      if (
                        expandableColumns.includes(header) &&
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
                            expandableColumns.includes(header)
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

export default DataTable;
