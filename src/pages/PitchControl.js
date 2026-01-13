import React, { forwardRef } from "react";
import "./PitchControl.css";

const PitchControl = forwardRef(
  (
    {
      mapRef,

      value,
      onChange,
      min = 10,
      max = 70,
      step = 1,


      bearing = 0,
      onBearingChange,
      bearingMin = -180,
      bearingMax = 180,
      bearingStep = 1,
    },
    ref
  ) => {
    const handlePitchChange = (e) => {
      const newPitch = parseInt(e.target.value, 10);
      if (mapRef.current) mapRef.current.setPitch(newPitch);
      onChange?.(newPitch);
    };

    const handleBearingChange = (e) => {
      const newBearing = parseInt(e.target.value, 10);
      if (mapRef.current) mapRef.current.setBearing(newBearing);
      onBearingChange?.(newBearing);
    };

    return (
      <div ref={ref} className="pitch-control">
        <label htmlFor="pitch-slider">3D</label>
        <input
          id="pitch-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.round(Number(value) || 0)}
          onChange={handlePitchChange}
        />

  <div className="bearing-control">
    <label htmlFor="bearing-slider"></label>
    <input
      id="bearing-slider"
      type="range"
      min={bearingMin}
      max={bearingMax}
      step={bearingStep}
      value={Math.round(Number(bearing) || 0)}
      onChange={handleBearingChange}
    />
  </div>
      </div>
    );
  }
);

export default PitchControl;
