import React, { useRef, useState, useEffect } from "react";
import "@google/model-viewer";
import "./SuicideBasin.css";

const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const SB = () => {
  const modelRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedElevation, setSelectedElevation] = useState(null);
  const [cameraInfo, setCameraInfo] = useState({
    rotation: "0°",
    elevation: "0°",
    radius: "0m",
  });

  const [targetInfo, setTargetInfo] = useState({ x: 0, y: 0, z: 0 });

  const DEFAULT_CAMERA_ORBIT = "363.1deg 158.8deg 2350.49m";
  const [zeroTheta, setZeroTheta] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);

  const radToDeg = (rad) => ((rad * 180) / Math.PI).toFixed(1);

  useEffect(() => {
    const modelViewer = modelRef.current;
    if (!modelViewer) return;

    modelViewer.setAttribute("camera-controls", "");
    modelViewer.setAttribute("camera-up", "0 0 1");
    modelViewer.setAttribute("orbit-sensitivity", "2");
    modelViewer.removeAttribute("disable-zoom");

    const handleModelLoad = () => {
      modelViewer.cameraOrbit = DEFAULT_CAMERA_ORBIT;

      const initialOrbit = modelViewer.getCameraOrbit();
      const initialTheta = (initialOrbit.theta * 180) / Math.PI;
      setZeroTheta(initialTheta);
      setRotationOffset(0);

      // Get initial camera target XYZ
      const target = modelViewer.getCameraTarget();
      setTargetInfo({
        x: target.x.toFixed(2),
        y: target.y.toFixed(2),
        z: target.z.toFixed(2),
      });
    };

    const handleProgress = (event) => {
      const progress = Math.round(
        ((event.detail.totalProgress ?? event.detail.loaded) || 0) * 100
      );
      setLoadingProgress(progress);
    };

    const handleClick = (event) => {
      const { detail } = event;
      if (detail?.intersection?.point) {
        const elevation = detail.intersection.point.y.toFixed(2);
        setSelectedElevation(elevation);
      }
    };

    const handleCameraChange = debounce(() => {
      const orbit = modelViewer.getCameraOrbit();
      setCameraInfo({
        rotation: `${radToDeg(orbit.theta)}°`,
        elevation: `${radToDeg(orbit.phi)}°`,
        radius: `${orbit.radius.toFixed(2)}m`,
      });

      // Update XYZ whenever camera changes
      const target = modelViewer.getCameraTarget();
      setTargetInfo({
        x: target.x.toFixed(2),
        y: target.y.toFixed(2),
        z: target.z.toFixed(2),
      });
    }, 50);

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

  useEffect(() => {
    if (modelRef.current) {
      const orbit = modelRef.current.getCameraOrbit();
      const phiDeg = (orbit.phi * 180) / Math.PI;
      const radius = orbit.radius.toFixed(2) + "m";
      const newTheta = zeroTheta + rotationOffset;

      modelRef.current.cameraOrbit = `${newTheta}deg ${phiDeg}deg ${radius}`;
    }
  }, [rotationOffset, zeroTheta]);

  useEffect(() => {
    let animationFrame;
    const handleKeyDown = (e) => {
      const step = e.shiftKey ? 15 : 5;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        animationFrame = requestAnimationFrame(() => {
          setRotationOffset((prev) =>
            e.key === "ArrowLeft" ? prev - step : prev + step
          );
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleResetCamera = () => {
    if (modelRef.current) {
      modelRef.current.cameraOrbit = DEFAULT_CAMERA_ORBIT;
      setRotationOffset(0);

      // Reset XYZ as well
      const target = modelRef.current.getCameraTarget();
      setTargetInfo({
        x: target.x.toFixed(2),
        y: target.y.toFixed(2),
        z: target.z.toFixed(2),
      });
    }
  };

  const rotateModel = (angle) => setRotationOffset((prev) => prev + angle);

  return (
    <div className="model-container">
      {/* Loading Overlay */}
      {loadingProgress < 100 && (
        <div className="loading-overlay">
          <div
            className="loading-bar"
            style={{ width: `${loadingProgress}%` }}
          ></div>
          <span>Loading {loadingProgress}%</span>
        </div>
      )}

      {/* Model Viewer */}
      <model-viewer
        ref={modelRef}
        src={`${process.env.PUBLIC_URL}/models/suicide_basin.glb`}
        alt="3D Model of Suicide Basin"
        camera-controls
        camera-up="0 0 1"
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

      {/* Elevation Display */}
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

      {/* Camera Info */}
      <div className="camera-info">
        <strong>Camera Info:</strong>
        <div>Rotation Angle: {cameraInfo.rotation}</div>
        <div>Elevation: {cameraInfo.elevation}</div>
        <div>Zoom: {cameraInfo.radius}</div>

      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={handleResetCamera}>Reset Camera</button>
        <button onClick={() => rotateModel(-15)}>⟲ Rotate Left</button>
        <button onClick={() => rotateModel(15)}>⟳ Rotate Right</button>
      </div>
    </div>
  );
};

export default SB;
