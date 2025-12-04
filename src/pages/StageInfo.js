import React from "react";
import "./StageInfo.css";

const floodStages = [
  {
    stage: "Action Stage",
    level: "8-9 ft",
    impacts: "Represents the need to take some type of mitigation action in preparation for possible significant flood event.",
    className: "action-stage",
  },
  {
    stage: "Minor Flood",
    level: "9 - 10 ft",
    impacts: [
      "9 ft: Water starts to cover Skaters Cabin Road.",
      "9.5 ft: View Dr minor yard flooding, 0.5 ft water over Skaters Cabin Road, Campsite 7 floods.",
    ],
    className: "minor-stage",
  },
  {
    stage: "Moderate Flood",
    level: "10 - 14 ft",
    impacts: [
      "10 ft: Mendenhall Campground partially submerged, West Glacier Trail impassable.",
      "11 ft: View Dr impassable, significant flooding, severe bank erosion below Back Loop Bridge.",
      "12.5 ft: Meander Way (river side) under 2-4 ft of water, floodwaters impact Dredge Lake Trail System.",
    ],
    className: "moderate-stage",
  },
  {
    stage: "Major Flood",
    level: "14+ ft",
    impacts: [
      "14 ft: Flooding begins on Northland St, Turn St, Parkview & Center Ct. Meander Way under 1-2 ft of water.",
      "14.5 ft: Severe flooding of View Dr, Meander Way under 2-4 ft of water.",
      "15 ft: 2 ft of water on Killewich Dr, 1.5 ft on Rivercourt Way & Parkview Ct.",
    ],
    className: "major-stage",
  },
];

const FloodStageTable = () => {
  return (
    <div className="flood-stage-table-container">
      <div className="scrollable-table">
        <table className="flood-stage-table">
          <thead>
            <tr>
              <th scope="col">Flood Stage</th>
              <th scope="col">Water Level (ft)</th>
              <th scope="col">Impacts</th>
            </tr>
          </thead>
          <tbody>
            {floodStages.map(({ stage, level, impacts, className }) => (
              <tr key={stage} className={className}>
                <td>{stage}</td>
                <td>{level}</td>
                <td className="impacts-cell">
                  {Array.isArray(impacts)
                    ? impacts.map((impact, index) => (
                        <div key={index} className="impact-line">
                          {impact}
                        </div>
                      ))
                    : impacts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FloodStageTable;
