import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./SuicideBasin.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

export default function Topographic3DTerrainMap() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const modelOrigin = [-134.4199, 58.29999]; // Suicide Basin
    const modelAltitude = 20;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: modelOrigin,
      zoom: 13,
      pitch: 60,
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

          // Lights
          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(0, 100, 100).normalize();
          this.scene.add(directionalLight);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
          this.scene.add(ambientLight);

          // Load model
          const loader = new GLTFLoader();
          loader.load(
            "/models/suicide_basin.glb", // ensure file is in /public/models/
            (gltf) => {
              console.log("✅ Model loaded:", gltf);

              this.model = gltf.scene;
              this.model.rotation.set(0, 0, Math.PI / 8); // slight Z rotation

              // Auto-scale
              const box = new THREE.Box3().setFromObject(this.model);
              const size = new THREE.Vector3();
              box.getSize(size);
              console.log("📦 Bounding box size:", size);

              const maxDim = Math.max(size.x, size.y, size.z);
              const targetSize = 2000; // ~2000 meters footprint
              const scale = targetSize / maxDim;
              console.log("🔍 Scaling factor:", scale);

              this.model.scale.set(scale, scale, scale);

              this.scene.add(this.model);
            },
            undefined,
            (error) => {
              console.error("❌ Error loading GLB:", error);
            }
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
                -modelTransform.scale, // flip Y
                modelTransform.scale
              )
            );

          this.camera.projectionMatrix = m.multiply(l);
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
        },
      };

      map.addLayer(customLayer);

      // === CAMERA ORBIT AROUND DOWNTOWN ===
      const orbitCenter = [-134.4197, 58.3019]; // downtown Juneau
      let angle = 0;
      const speedFactor = 9000; // adjust for orbit speed

      function animateCamera(timestamp) {
        angle = timestamp / speedFactor;
        const radius = 0.01; // orbit radius in degrees (~1 km)
        const lng = orbitCenter[0] + radius * Math.cos(angle);
        const lat = orbitCenter[1] + radius * Math.sin(angle);

        map.setCenter([lng, lat]);
        map.setBearing((angle * 180) / Math.PI); // rotate view
        map.setZoom(13.5); // adjust zoom here

        requestAnimationFrame(animateCamera);
      }
      animateCamera(0);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map-container" />

      {/* === Data Box Overlay === */}
      <div className="data-box">
        <h4>Suicide Basin</h4>
        <p>
          Estimated size: <strong>~</strong>
        </p>
        <p>
          Model shows Suicide Basin on <strong>8/13/2025</strong>: Empty after the{" "}
          <em>largest flood event</em> on record.
        </p>
      </div>
    </div>
  );
}
