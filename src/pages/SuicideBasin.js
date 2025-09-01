import React, { useRef, useState, useEffect } from 'react';
import '@google/model-viewer';
import './SuicideBasin.css';

const SB = () => {
  const modelRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedElevation, setSelectedElevation] = useState(null);

  useEffect(() => {
    const modelViewer = modelRef.current;

    if (modelViewer) {
      // Handle loading progress
      const handleProgress = (event) => {
        const progress = Math.round((event.detail.totalProgress || 0) * 100);
        setLoadingProgress(progress);
      };

      // Handle clicks for DEM elevation inspector
      const handleClick = (event) => {
        const { detail } = event;
        if (detail && detail.intersection) {
          const point = detail.intersection.point;
          const elevation = point.y.toFixed(2); // Y-axis = elevation
          setSelectedElevation(elevation);
        }
      };

      modelViewer.addEventListener('progress', handleProgress);
      modelViewer.addEventListener('click', handleClick);

      return () => {
        modelViewer.removeEventListener('progress', handleProgress);
        modelViewer.removeEventListener('click', handleClick);
      };
    }
  }, []);

  const handleFullscreen = () => {
    if (modelRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        modelRef.current.requestFullscreen();
      }
    }
  };

  const handleResetCamera = () => {
    if (modelRef.current) {
      modelRef.current.resetTurntableRotation();
      modelRef.current.cameraOrbit = "0deg 75deg 2.5m";
    }
  };

  const handleZoom = (factor) => {
    if (modelRef.current) {
      const current = parseFloat(modelRef.current.cameraOrbit.split(' ')[2]) || 2.5;
      modelRef.current.cameraOrbit = `0deg 75deg ${Math.max(0.5, current * factor)}m`;
    }
  };

  const toggleAutoRotate = () => setAutoRotate((prev) => !prev);


  return (
    <div className="model-container">
      {/* Loading Progress Bar */}
      {loadingProgress < 100 && (
        <div className="loading-overlay">
          <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
          <span>Loading {loadingProgress}%</span>
        </div>
      )}

      {/* 3D Model Viewer */}
      <model-viewer
        ref={modelRef}
        src={`${process.env.PUBLIC_URL}/models/suicide_basin.glb`}
        alt="3D Model of Suicide Basin"
        camera-controls
        auto-rotate={autoRotate ? true : undefined}
        touch-action="pan-y"
        environment-image="neutral"
        shadow-intensity="1"
        exposure="1.2"
        style={{
          width: '100%',
          height: '750px',
          backgroundColor: '#000000ff',
        }}
      >


      </model-viewer>

      {/* Elevation Info */}
      {selectedElevation && (
        <div className="elevation-display">
          Elevation: <strong>{selectedElevation} m</strong>
        </div>
      )}

      {/* Control Buttons */}
      <div className="controls">
        <button onClick={handleFullscreen}>Fullscreen</button>
        <button onClick={handleResetCamera}>Reset Camera</button>
        <button onClick={toggleAutoRotate}>
          {autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
        </button>
      </div>


    </div>
  );
};

export default SB;
