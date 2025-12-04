import React, { useState } from "react";
import "./AboutMap.css";
import Model from './Model';

const AboutMap = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flood-records-container ${isHovered ? "expanded" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered ? (
        <span className="tooltip-icon">More Info</span>
      ) : (
        <div className="tooltip-title">
          <h2>Ice-Dammed Glacial Lakes</h2>

          <div className="tooltip-text">
            These lakes form when glaciers block natural valleys, creating reservoirs that can release suddenly.
            <Model />
          </div>

          <div className="tooltip-bottom-text">
            As shown above, one side of Snow Lake is dammed by the Snow Glacier. Around every 14 months, the lake drains rapidly when the ice dam fails, impacting infrastructure in Seward and along the Snow River.
          </div>

          {/* Only show button when expanded */}
          <div className="button-wrapper2">
            <a
              href="https://www.alaskaglacialfloods.org/#/about-glacial-lakes"
              target="_blank"
              rel="noopener noreferrer"
              className="glof-button3"
            >
             Learn More
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutMap;

