import React, { useEffect, useRef, useState } from "react";
import "./aboutglaciallakes.css";

// === Stat Counter Component with Tooltip ===
const Stat = ({ target, label, tooltip }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      let current = 0;
      const increment = Math.ceil(target / 200);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCount(current);
      }, 20);
    }
  }, [isVisible, target]);

  return (
    <div
      className="stat"
      ref={ref}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="stat-number">{count}</span>
      <p className="stat-label">{label}</p>

      {showTooltip && tooltip && (
        <div className="stat-tooltip">
          <div className="stat-tooltip-content">
            <p>{tooltip}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// === About Page ===
const AboutGlacialLakes = () => {
  return (
    <div className="about-container">
      <div className="stats-bar">
        <div className="stats-overlay">
          <Stat
            target={125}
            label="Known Glacial Lakes"
            tooltip="Glacial lakes identified across Alaska and BC."
          />
          <Stat
            target={25}
            label="Glacial Lakes that Flood"
            tooltip="Lakes known to produce recurring glacial lake outburst floods."
          />
          <Stat
            target={5}
            label="Glacial Lakes Causing Hazards"
            tooltip="These lakes include Suicide Basin, Snow Lake, and Bear Lake."
          />
          <Stat
            target={327}
            label="Recorded Glacial Flood Events"
            tooltip="Glacial flood events that have been documented by NWS. Few events cause downstream impacts."
          />
          <Stat
            target={100000}
            label="Glaciers Receding in Alaska"
            tooltip="Over 100,000 glaciers are actively receding in Alaska."
          />
        </div>
      </div>

      <h1 className="about-title">Ice-Dammed Glacial Lakes in Alaska</h1>
      <h3 className="about-subheading">
        Their Presence as a Hazard & How They Work
      </h3>

      <section className="about-lakes-card">
        <p>
          Ice-dammed glacial lakes represent a serious flood hazard in Alaska.
          These lakes form when glaciers block natural valleys, creating
          reservoirs that can release suddenly and catastrophically. As glaciers retreat more glacial lakes become exposed.
        </p>
      </section>
    </div>
  );
};

export default AboutGlacialLakes;
