// src/pages/FloodDataTable.js
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodTable.css";

const S3_CSV_URL =
  "https://agfd-data.s3.us-west-2.amazonaws.com/AK_GL.csv";

const COLUMN_NAME_MAPPING = {
  lakeid: "Lake ID",
  lakename: "Lake Name",
  km2: "Lake Area (km²)",
  lat: "Latitude",
  lon: "Longitude",
  ishazard: "Current Hazard",
  futurehazard: "Future Hazard",
  futurehazardeta: "Time to Future Hazard",
  hazardurl: "Reference",
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
      "numberEvents",
      "lastEvent",
      "firstEvent",
    ],
    title: "Hazard Causing Ice-Dammed Glacial Lakes",
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
      "Reference",
      "numberEvents",
      "lastEvent",
      "firstEvent",
    ],
    title: "Future Alaska Glacier Lakes (2026)",
    filterFn: (row) => row["Future Hazard"]?.toLowerCase() === "true",
  },
};

const FloodDataTable = ({
  csvUrl = S3_CSV_URL,
  type = "current",
  subtitle = "",
}) => {
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  const { excluded, title, filterFn } =
    TABLE_CONFIG[type] || TABLE_CONFIG.current;

  useEffect(() => {
    fetch(csvUrl)
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
                const normalizedKey = Object.keys(
                  COLUMN_NAME_MAPPING
                ).find(
                  (mappedKey) =>
                    mappedKey.toLowerCase() === key.toLowerCase()
                );
                const newKey = normalizedKey
                  ? COLUMN_NAME_MAPPING[normalizedKey]
                  : key;
                newRow[newKey] = row[key];
              });
              return newRow;
            });

            const filteredData = processedData.filter(filterFn);

            const allHeaders = Object.keys(filteredData[0] || {});
            const filteredHeaders = allHeaders.filter(
              (h) => !excluded.includes(h)
            );

            const orderedHeaders = [
              "Lake Name",
              ...filteredHeaders.filter((h) => h !== "Lake Name"),
            ];

            const finalHeaders = [...orderedHeaders, "View"];

            setData(filteredData);
            setSortedData(filteredData);
            setHeaders(finalHeaders);
            setLoading(false);
            setOpenRow(null);
            setHoverRow(null);
          },
        });
      })
      .catch(() => setLoading(false));
  }, [csvUrl, type, excluded, filterFn]);

  useEffect(() => {
    const handleClickOutside = () => setOpenRow(null);
    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleRow = (index) => {
    setOpenRow((prev) => (prev === index ? null : index));
  };

  return (
    <div className="glacier-table-container">
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
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedData.map((row, rowIndex) => {
                const isExpanded =
                  openRow === rowIndex ||
                  (openRow === null && hoverRow === rowIndex);

                return (
                  <tr
                    key={rowIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(rowIndex);
                    }}
                    className={`expandable-row ${
                      isExpanded ? "is-expanded" : ""
                    }`}
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

                      if (header === "View") {
                        const lakeId = row["Lake ID"];
                        return (
                          <td key={colIndex}>
                            <a
                              className="glacier-button"
                              href={`#/map?lake=${encodeURIComponent(
                                lakeId
                              )}`}
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.scrollTo(0, 0);
                                document.documentElement.scrollTop = 0;
                                document.body.scrollTop = 0;
                              }}
                            >
                              Map
                            </a>
                          </td>
                        );
                      }

                      if (
                        header === "Reference" &&
                        typeof row[header] === "string"
                      ) {
                        const rawUrl = row[header];
                        if (
                          rawUrl.includes("www.") ||
                          rawUrl.includes("http")
                        ) {
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
                                onClick={(e) => e.stopPropagation()}
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
