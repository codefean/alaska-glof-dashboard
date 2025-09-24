import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./LayersToggle.css";

const DATA_URL = "https://flood-events.s3.us-east-2.amazonaws.com/AK_GL.csv";

const LayersToggle = ({
  showLakes,
  setShowLakes,
  showImpacts,
  setShowImpacts,
  showPredicted,
  setShowPredicted,
}) => {
  const [lakesCount, setLakesCount] = useState(0);
  const [impactsCount, setImpactsCount] = useState(0);
  const [predictedCount, setPredictedCount] = useState(0);

  useEffect(() => {
    Papa.parse(DATA_URL, {
      download: true,
      header: true,
      complete: (results) => {
        let lakes = 0;
        let impacts = 0;
        let predicted = 0;

        results.data.forEach((row) => {
          if (row.isHazard === "TRUE") {
            impacts += 1; // red square
          } else if (row.futureHazard === "TRUE") {
            predicted += 1; // orange diamond
          } else if (row.isHazard === "FALSE") {
            lakes += 1; // blue circle
          }
        });

        setLakesCount(lakes);
        setImpactsCount(impacts);
        setPredictedCount(predicted);
      },
    });
  }, []);

return (
  <div className="layer-toggle-panel">
    <h4>Active Layers</h4>

    <div className="layer-icons">
      <div
        className={`layer-circle toggle-icon ${showLakes ? "active" : ""}`}
        onClick={() => setShowLakes(!showLakes)}
        data-tooltip={`${lakesCount}`}
        role="button"
        tabIndex={0}
        aria-label={`${lakesCount}`}
      />
      <div
        className={`layer-square toggle-icon ${showImpacts ? "active" : ""}`}
        onClick={() => setShowImpacts(!showImpacts)}
        data-tooltip={`${impactsCount}`}
        role="button"
        tabIndex={0}
        aria-label={`${impactsCount}`}
      />
      <div className="layer-item">
        <div
          className={`layer-diamond toggle-icon ${showPredicted ? "active" : ""}`}
          onClick={() => setShowPredicted(!showPredicted)}
          role="button"
          tabIndex={0}
        >
        </div>
      </div>
    </div> 

  </div> 
);
};

export default LayersToggle;
