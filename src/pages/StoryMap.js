import React from 'react';
import './StoryMap.css';
 
const StoryMap = () => {
  return (
    <div className="story-map-container">
      <iframe
        src="https://storymaps.arcgis.com/stories/72cef125bbfa4f989356bf9350cd5d63"
        width="100%"
        height="650px"
        allowFullScreen
        allow="geolocation"
        title="StoryMap"
      ></iframe>
      </div>
  );
};

export default StoryMap;
