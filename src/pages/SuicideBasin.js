import React, { useRef, useState, useEffect } from "react";
import "@google/model-viewer";
import "./SuicideBasin.css";

const SB = () => {
  const modelRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedElevation, setSelectedElevation] = useState(null);
  const [cameraInfo, setCameraInfo] = useState({
    rotation: "0°",
    elevation: "0°",
    radius: "0m",
  });

  // Your desired "upright" starting view
  const DEFAULT_CAMERA_ORBIT = "363.1deg 158.8deg 2350.49m";

  // Store your default theta as "zero" and track offset from there
  const [zeroTheta, setZeroTheta] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);

  const radToDeg = (rad) => ((rad * 180) / Math.PI).toFixed(1);

  useEffect(() => {
    const modelViewer = modelRef.current;
    if (!modelViewer) return;

    // Enable controls
    modelViewer.setAttribute("camera-controls", "");
    modelViewer.setAttribute("orbit-sensitivity", "2");
    modelViewer.removeAttribute("disable-zoom");

    // Set camera orbit AFTER model finishes loading
    const handleModelLoad = () => {
      modelViewer.setAttribute("camera-orbit", DEFAULT_CAMERA_ORBIT);

      // Get theta for default orientation and set as zero point
      const initialOrbit = modelViewer.getCameraOrbit();
      const initialTheta = (initialOrbit.theta * 180) / Math.PI;
      setZeroTheta(initialTheta);

      // Reset offset so we start fresh
      setRotationOffset(0);
    };

    const handleProgress = (event) => {
      const progress = Math.round((event.detail.totalProgress || 0) * 100);
      setLoadingProgress(progress);
    };

    const handleClick = (event) => {
      const { detail } = event;
      if (detail && detail.intersection) {
        const point = detail.intersection.point;
        const elevation = point.y.toFixed(2);
        setSelectedElevation(elevation);
      }
    };

    const handleCameraChange = () => {
      const orbit = modelViewer.getCameraOrbit();
      setCameraInfo({
        rotation: `${radToDeg(orbit.theta)}°`,
        elevation: `${radToDeg(orbit.phi)}°`,
        radius: `${orbit.radius.toFixed(2)}m`,
      });
    };

    // Attach listeners
    modelViewer.addEventListener("load", handleModelLoad);
    modelViewer.addEventListener("progress", handleProgress);
    modelViewer.addEventListener("click", handleClick);
    modelViewer.addEventListener("camera-change", handleCameraChange);

    return () => {
      modelViewer.removeEventListener("load", handleModelLoad);
      modelViewer.removeEventListener("progress", handleProgress);
      modelViewer.removeEventListener("click", handleClick);
      modelViewer.removeEventListener("camera-change", handleCameraChange);
    };
  }, []);

  // Update camera orbit whenever rotationOffset changes
  useEffect(() => {
    if (modelRef.current) {
      const orbit = modelRef.current.getCameraOrbit();

      // Keep current tilt and zoom
      const phiDeg = (orbit.phi * 180) / Math.PI;
      const radius = orbit.radius.toFixed(2) + "m";

      // Theta relative to zero point
      const newTheta = zeroTheta + rotationOffset;

      modelRef.current.setAttribute(
        "camera-orbit",
        `${newTheta}deg ${phiDeg}deg ${radius}`
      );
    }
  }, [rotationOffset, zeroTheta]);

  // Handle arrow keys for rotation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const step = e.shiftKey ? 15 : 5;
      if (e.key === "ArrowLeft") {
        setRotationOffset((prev) => prev - step);
      } else if (e.key === "ArrowRight") {
        setRotationOffset((prev) => prev + step);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset camera to original "zero" position
  const handleResetCamera = () => {
    if (modelRef.current) {
      modelRef.current.setAttribute("camera-orbit", DEFAULT_CAMERA_ORBIT);
      setRotationOffset(0);
    }
  };

  // Rotate model via buttons
  const rotateModel = (angle) => setRotationOffset((prev) => prev + angle);

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
        <button onClick={handleResetCamera}>Reset Camera</button>
        <button onClick={() => rotateModel(-15)}>⟲ Rotate Left</button>
        <button onClick={() => rotateModel(15)}>⟳ Rotate Right</button>
      </div>
    </div>
  );
};

export default SB;
