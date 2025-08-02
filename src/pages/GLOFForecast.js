import React from "react";
import "./GLOFForecast.css";

const GLOFForecast = () => {
  return (
    <div className="glof-data-container">
      <h2 className="flood-events-title">Glacier Lakes Forecast</h2>
      <h2 className="flood-events-subheading">
        Understand Modeling of Potential Future Glacial Lake Floods
      </h2>

      <div className="about-forecast-card">
        <h2>Forecasting potential future glacial lakes starts in 2026</h2>
      </div>

      {/* Added Image Section */}
      <div className="forecast-image-section">
        <img
          src={process.env.PUBLIC_URL + '/images/flood-forecast.jpg'}
          alt="Flood Forecasting Process"
          className="forecast-image"
        />
      </div>
    </div>
  );
};

export default GLOFForecast;
