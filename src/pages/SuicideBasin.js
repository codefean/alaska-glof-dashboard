import React, { useRef, useState, useEffect } from "react";
import "@google/model-viewer";
import "./SuicideBasin.css";

const SB = () => {
  const modelRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedElevation, setSelectedElevation] = useState(null);
  const [cameraInfo, setCameraInfo] = useState({
    rotation: "0°",
    elevation: "0°",
    radius: "0m",
  });

  // Helper: Convert radians to degrees
  const radToDeg = (rad) => ((rad * 180) / Math.PI).toFixed(1);

  // Default camera settings (based on your provided values)
  const DEFAULT_CAMERA_ORBIT = "363.1deg 158.8deg 2350.49m";

  useEffect(() => {
    const modelViewer = modelRef.current;

    if (modelViewer) {
      // Enable full 3D rotation and zoom
      modelViewer.setAttribute("camera-controls", "");
      modelViewer.setAttribute("orbit-sensitivity", "2");
      modelViewer.removeAttribute("disable-zoom");

      // Set initial camera orbit to your desired position
      modelViewer.setAttribute("camera-orbit", DEFAULT_CAMERA_ORBIT);

      // Handle loading progress
      const handleProgress = (event) => {
        const progress = Math.round((event.detail.totalProgress || 0) * 100);
        setLoadingProgress(progress);
      };

      // Handle elevation inspector on click
      const handleClick = (event) => {
        const { detail } = event;
        if (detail && detail.intersection) {
          const point = detail.intersection.point;
          const elevation = point.y.toFixed(2);
          setSelectedElevation(elevation);
        }
      };

      // Update camera info box in real-time
      const handleCameraChange = () => {
        const orbit = modelViewer.getCameraOrbit();
        setCameraInfo({
          rotation: `${radToDeg(orbit.theta)}°`,  // Horizontal rotation
          elevation: `${radToDeg(orbit.phi)}°`,  // Vertical tilt
          radius: `${orbit.radius.toFixed(2)}m`, // Zoom distance
        });
      };

      modelViewer.addEventListener("progress", handleProgress);
      modelViewer.addEventListener("click", handleClick);
      modelViewer.addEventListener("camera-change", handleCameraChange);

      // Initialize info box on load
      handleCameraChange();

      return () => {
        modelViewer.removeEventListener("progress", handleProgress);
        modelViewer.removeEventListener("click", handleClick);
        modelViewer.removeEventListener("camera-change", handleCameraChange);
      };
    }
  }, []);

  // Handle fullscreen mode
  const handleFullscreen = () => {
    if (modelRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        modelRef.current.requestFullscreen();
      }
    }
  };

  // Reset camera back to your desired default
  const handleResetCamera = () => {
    if (modelRef.current) {
      modelRef.current.cameraOrbit = DEFAULT_CAMERA_ORBIT;
    }
  };

  // Toggle auto-rotation on/off
  const toggleAutoRotate = () => setAutoRotate((prev) => !prev);

  return (
    <div className="model-container">
      {/* Loading Progress Bar */}
      {loadingProgress < 100 && (
        <div className="loading-overlay">
          <div
            className="loading-bar"
            style={{ width: `${loadingProgress}%` }}
          ></div>
          <span>Loading {loadingProgress}%</span>
        </div>
      )}

      {/* 3D Model Viewer */}
<model-viewer
  ref={modelRef}
  src={`${process.env.PUBLIC_URL}/models/suicide_basin.glb`}
  alt="3D Model of Suicide Basin"
  camera-controls
  touch-action="pan-y"
  environment-image="neutral"
  shadow-intensity="1"
  exposure="1"
  style={{
    width: "100%",
    height: "750px",
    backgroundColor: "#000000ff",
    opacity: 0.9,
  }}
/>



      {/* Elevation Info */}
      {selectedElevation && (
        <div className="elevation-display">
          Elevation: <strong>{selectedElevation} m</strong>
        </div>
      )}

      {/* Scale Overlay */}
      <div className="scale-overlay">
        <div className="scale-line height">Height (Z): 220m</div>
        <div className="scale-line length">Length (X): 1300m</div>
        <div className="scale-line width">Width (Y): 465m</div>
      </div>

      {/* Camera Info Box */}
      <div className="camera-info">
        <div><strong>Camera Info:</strong></div>
        <div>Rotation Angle: {cameraInfo.rotation}</div>
        <div>Elevation: {cameraInfo.elevation}</div>
        <div>Zoom: {cameraInfo.radius}</div>
      </div>

      {/* Control Buttons */}
      <div className="controls">
        <button onClick={handleFullscreen}>Fullscreen</button>
        <button onClick={handleResetCamera}>Reset Camera</button>
      </div>
    </div>
  );
};

export default SB;
