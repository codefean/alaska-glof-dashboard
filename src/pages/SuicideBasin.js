import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./SuicideBasin.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

export default function Topographic3DTerrainMap() {
  const mapContainer = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const center = [-134.4199, 58.29999]; // Juneau, Alaska

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center,
      zoom: 13.5,
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

      map.setLight({
        anchor: "map",
        color: "white",
        intensity: 0.8,
        position: [1.5, 90, 80],
      });

      // === THREE.JS + GLTF MODEL ===
      const modelOrigin = center;
      const modelAltitude = 0;
      const mercatorCoord = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      );

      const customLayer = {
        id: "3d-model",
        type: "custom",
        renderingMode: "3d",
        onAdd: function (map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          // Lighting
          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(0, 100, 100).normalize();
          this.scene.add(directionalLight);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
          this.scene.add(ambientLight);

          // Debug helper: shows XYZ orientation and confirms model position
          const axesHelper = new THREE.AxesHelper(200);
          this.scene.add(axesHelper);

          // Load model
          const loader = new GLTFLoader();
          loader.load(
            `${process.env.PUBLIC_URL}/models/sb_cleaned.glb`,
            (gltf) => {
              console.log("✅ Model loaded successfully", gltf);
              this.model = gltf.scene;

              // Reset baked transforms from GLB
              this.model.position.set(0, 0, 0);
              this.model.rotation.set(0, 0, 0);

              // Calculate bounding box and scale model automatically
              const box = new THREE.Box3().setFromObject(this.model);
              const size = new THREE.Vector3();
              box.getSize(size);

              const maxDim = Math.max(size.x, size.y, size.z);
              const targetSize = 500; // Target footprint ~500 meters
              const scale = targetSize / maxDim;

              this.model.scale.set(scale, scale, scale);

              // Place model at the correct Mercator anchor point, slightly above terrain
              this.model.position.set(
                mercatorCoord.x,
                mercatorCoord.y,
                mercatorCoord.z + 10 // Lift 10 meters above DEM to avoid clipping
              );

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
          this.camera.projectionMatrix = m;
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
        },
      };

      map.addLayer(customLayer);

      // === CINEMATIC CAMERA ORBIT ===
      const rotateCamera = (timestamp) => {
        map.setBearing((timestamp / 100) % 360);
        map.setPitch(60);
        animationRef.current = requestAnimationFrame(rotateCamera);
      };
      rotateCamera(0);
    });

    return () => {
      cancelAnimationFrame(animationRef.current);
      map.remove();
    };
  }, []);

  return <div ref={mapContainer} className="map-container" />;
}
