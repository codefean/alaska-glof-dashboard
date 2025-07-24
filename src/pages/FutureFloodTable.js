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

const FutureFloodTable = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expanded, setExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);


  const visibleCount = 10;

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

            const filteredData = processedData.filter(row =>
              row["Future Hazard"]?.toLowerCase() === "true",
            );

            const columnsToExclude = [
              "Lake ID",
              "Lake Area (km²)",
              "Latitude",
              "Longitude",
              "Future Hazard",
              "Current Hazard"
            ];

            const allHeaders = Object.keys(filteredData[0] || {});
            const filteredHeaders = allHeaders.filter(h => !columnsToExclude.includes(h));

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
          <p className="flood-table-title">
            Alaska Glacier Lakes Current Flood Table
          </p>
          <p className="flood-table-subtitle">
            Showing lakes with future flood hazards
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

          if (header === "Hazard Website" && row[header]?.includes("www.")) {
            return (
              <td key={colIndex}>
                <a href={row[header]} target="_blank" rel="noopener noreferrer">
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

export default FutureFloodTable;
