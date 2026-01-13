import React from "react";
import "./citation.css";

const Citation = ({ stylePos }) => {
  return (
    <div className="citation-readout" style={stylePos}>
      <a
        href="https://www.alaskaglacialfloods.org/#/GLOF-data"
        target="_self"
        rel="noopener noreferrer"
        className="references-button"
      >
        References
      </a>
    </div>
  );
};

export default Citation;
