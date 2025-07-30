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
        <h2>Flood Forecasting (coming in 2026)</h2>
        <p>
          The Alaska GLOF Dashboard provides a comprehensive overview of glacial
          lake outburst flood (GLOF) events in Alaska. This platform is designed
          to help researchers, emergency responders, and the public understand
          the risks associated with GLOFs and access critical data for
          decision-making.
        </p>
        <p>
          The dashboard includes data on glacial lakes, historical flood events,
          and (in the future) predictive models to forecast potential GLOF
          occurrences. It serves as a valuable resource for monitoring glacial
          activity and assessing the impact of climate change on glacial
          systems.
        </p>
      </div>
    </div>
  );
};

export default GLOFForecast;
