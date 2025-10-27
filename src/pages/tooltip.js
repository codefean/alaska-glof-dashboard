import { useState } from "react";
import "./loc.css";

const Tooltip = () => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <span className="tooltip-icon">?????</span>

      {showTip && (
        <div className="tooltip-readout">
          This map displays glacier lake outburst flood (GLOF) data for
          ice-dammed glacial lakes in Alaska and western Canada. An ice-dammed
          glacial lake forms when meltwater collects behind a glacier, creating
          a temporary natural dam made of ice. If you find an ice-dammed glacial
          lake that is not listed, please email us at 
            UAS-GLOF-info@alaska.edu.
        </div>
      )}
    </div>
  );
};

export default Tooltip;
