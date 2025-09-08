import React from "react";
import "./PitchControl.css";

const PitchControl = ({ mapRef, defaultPitch = 20 }) => {
  const handlePitchChange = (e) => {
    const newPitch = parseInt(e.target.value, 10);
    if (mapRef.current) {
      mapRef.current.setPitch(newPitch);
    }
  };

  return (
    <div className="pitch-control">
      <label htmlFor="pitch-slider">3D</label>
      <input
        id="pitch-slider"
        type="range"
        min="10"
        max="70"
        step="1"
        defaultValue={defaultPitch}
        onChange={handlePitchChange}
      />
    </div>
  );
};

export default PitchControl;
