import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./SuicideBasin.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

export default function Topographic3DTerrainMap() {
  const mapContainer = useRef(null);
  const animationRef = useRef(null);

  const [paused, setPaused] = useState(false);

  // state for location
  const [location, setLocation] = useState({
    modelOrigin: [-134.4197, 58.3019], // downtown Juneau (default)
    orbitCenter: [-134.4197, 58.3019],
  });

  useEffect(() => {
    const { modelOrigin, orbitCenter } = location;
    const modelAltitude = 30;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: modelOrigin,
      zoom: 12.7,
      pitch: 65,
      bearing: 0,
      antialias: true,
    });

    map.on("load", () => {
      // === TERRAIN & FOG ===
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 12,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 0.9 });

      map.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.3,
        range: [0.5, 15],
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.15,
      });

      map.setLights([
        {
          id: "sunlight",
          type: "directional",
          color: "white",
          intensity: 0.8,
          position: [1.5, 90, 80],
        },
      ]);

      // === MODEL TRANSFORM ===
      const mercatorCoord = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      );
      const modelTransform = {
        translateX: mercatorCoord.x,
        translateY: mercatorCoord.y,
        translateZ: mercatorCoord.z,
        scale: mercatorCoord.meterInMercatorCoordinateUnits(),
      };

      // === CUSTOM LAYER ===
      const customLayer = {
        id: "3d-model",
        type: "custom",
        renderingMode: "3d",
        onAdd: function (map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(0, 100, 100).normalize();
          this.scene.add(directionalLight);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
          this.scene.add(ambientLight);

          const loader = new GLTFLoader();
          loader.load(
            "/models/suicide_basin.glb",
            (gltf) => {
              this.model = gltf.scene;
              this.model.rotation.set(0, 0, Math.PI / 8);

              const box = new THREE.Box3().setFromObject(this.model);
              const size = new THREE.Vector3();
              box.getSize(size);

              const maxDim = Math.max(size.x, size.y, size.z);
              const targetSize = 2000;
              const scale = targetSize / maxDim;

              this.model.scale.set(scale, scale, scale);

              this.scene.add(this.model);
            },
            undefined,
            (error) => console.error("❌ Error loading GLB:", error)
          );

          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
          });
          this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
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
            );

          this.camera.projectionMatrix = m.multiply(l);
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
        },
      };

      map.addLayer(customLayer);

      // === CAMERA ORBIT ===
      let angle = 0;
      const speedFactor = 9300;

      function animateCamera(timestamp) {
        if (!paused) {
          angle = timestamp / speedFactor;
          const radius = 0.01;
          const lng = orbitCenter[0] + radius * Math.cos(angle);
          const lat = orbitCenter[1] + radius * Math.sin(angle);

          map.setCenter([lng, lat]);
          map.setBearing((angle * 180) / Math.PI);
          map.setZoom(13.5);
        }
        animationRef.current = requestAnimationFrame(animateCamera);
      }
      animateCamera(0);
    });

    return () => {
      cancelAnimationFrame(animationRef.current);
      map.remove();
    };
  }, [paused, location]);

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map-container" />

      {/* === Data Box Overlay === */}
      <div className="data-box">
        <h4>Suicide Basin for Scale</h4>
        <p>
          Model shows Suicide Basin on <strong>8/13/2025</strong>: Empty after the{" "}
          <em>largest flood event</em> on record.
        </p>
      </div>

     <div className="controls">
  <button className="pause-btn" onClick={() => setPaused((p) => !p)}>
    {paused ? "▶ Resume Orbit" : "⏸ Pause Orbit"}
  </button>

  <button
    onClick={() =>
      setLocation({
        modelOrigin: [-134.575402, 58.393573], // Mendenhall Valley
        orbitCenter: [-134.575402, 58.393573],
      })
    }
  >
    Mendenhall Valley
  </button>

  <button
    onClick={() =>
      setLocation({
        modelOrigin: [-134.4197, 58.3019], // Downtown Juneau
        orbitCenter: [-134.4197, 58.3019],
      })
    }
  >
    Downtown Juneau
  </button>
</div>
</div>
  );
}
