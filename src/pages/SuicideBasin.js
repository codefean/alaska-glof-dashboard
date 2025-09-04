import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import proj4 from "proj4";
import "./SuicideBasin.css";

import { UTM8N, WGS84, MODEL_OFFSETS } from "./constants";
import { setupMap } from "./mapSetup";
import { setupTooltip } from "./tooltip";

export default function SuicideBasin() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  /**
   * Adds the GLTF glacier model to the map
   */
  const addGlacierModel = (map, url, utmEasting, utmNorthing) => {
    // ✅ Apply offsets from constants.js
    const adjustedE = utmEasting + MODEL_OFFSETS.OFFSET_E;
    const adjustedN = utmNorthing + MODEL_OFFSETS.OFFSET_N;

    // ✅ Convert UTM coords to WGS84 (lng, lat)
    const [lng, lat] = proj4(UTM8N, WGS84, [adjustedE, adjustedN]);

    // ✅ Calculate elevation
    const baseElevation =
      map.queryTerrainElevation([lng, lat], { exaggerated: false }) || 0;
    const modelAltitude = baseElevation + MODEL_OFFSETS.OFFSET_Z;

    const yaw = THREE.MathUtils.degToRad(MODEL_OFFSETS.YAW_DEG);
    const modelRotate = [0, 0, yaw];

    // ✅ Convert lng/lat to Mapbox Mercator coordinates
    const modelAsMercator = mapboxgl.MercatorCoordinate.fromLngLat(
      [lng, lat],
      modelAltitude
    );

    // ✅ Model transformation info
    const modelTransform = {
      translateX: modelAsMercator.x,
      translateY: modelAsMercator.y,
      translateZ: modelAsMercator.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercator.meterInMercatorCoordinateUnits(),
    };

    // ✅ Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    renderer.getContext().depthFunc(renderer.getContext().LEQUAL);

    // ✅ Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 4.0);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.6);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    // ✅ Store references for later
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // ✅ Load glacier model
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            // Avoid z-fighting with terrain
            child.material.depthTest = false;
            child.material.depthWrite = false;
          }
        });

        // Adjust scale factor
        const debugScale = modelTransform.scale * 500;
        model.scale.set(debugScale, debugScale, debugScale);
        model.position.set(0, 0, 0);
        model.rotation.set(...modelRotate);
        model.renderOrder = 999;
        model.matrixAutoUpdate = false;

        modelRef.current = model;
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error("Error loading glacier model:", error);
      }
    );

    // ✅ Add custom Three.js layer to Mapbox
    map.addLayer({
      id: "glacier-model",
      type: "custom",
      renderingMode: "3d",
      onAdd: (map, gl) => {
        const renderer = rendererRef.current;
        renderer.domElement.style.position = "absolute";
        map.getCanvas().parentNode.appendChild(renderer.domElement);
        renderer.setSize(map.getCanvas().clientWidth, map.getCanvas().clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
      },
      render: (gl, matrix) => {
        const model = modelRef.current;
        const camera = cameraRef.current;
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        if (!model) return;

        // ✅ Model transformation matrix
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const modelMatrix = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        camera.projectionMatrix.fromArray(matrix);
        model.matrix = modelMatrix;

        renderer.state.reset();
        renderer.setSize(map.getCanvas().clientWidth, map.getCanvas().clientHeight);
        renderer.render(scene, camera);
        map.triggerRepaint();
      },
    });
  };

  /**
   * Initialize map and glacier model
   */
  useEffect(() => {
    // ✅ Setup the base Mapbox map
    const map = setupMap(mapContainer.current, { mapRef });

    // ✅ Setup real-time tooltip for lat/lon/elevation
    setupTooltip(map);

    // ✅ Wait until map is idle before adding model
    map.once("idle", () => {
      const centerLngLat = [-134.49923, 58.45039];
      const [utmE, utmN] = proj4(WGS84, UTM8N, centerLngLat);

      addGlacierModel(
        map,
        `${process.env.PUBLIC_URL}/models/sb_813.glb`,
        utmE,
        utmN
      );
    });

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapContainer} className="map-container" />

      {/* ✅ Tooltip for lat/lon/elevation */}
      <div
        id="loc-readout"
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          padding: "8px",
          borderRadius: "6px",
          fontSize: "13px",
          pointerEvents: "none",
        }}
      >
        Move cursor to see details
      </div>

      {/* ✅ Existing Loc3D overlay */}

    </div>
  );
}
