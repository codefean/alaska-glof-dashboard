import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import proj4 from "proj4";
import Loc3D from "./Loc3D";
import "./SuicideBasin.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

export default function SuicideBasin() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const utm8n = "+proj=utm +zone=8 +datum=WGS84 +units=m +no_defs";
  const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

  const OFFSET_E = -100;
  const OFFSET_N = 1200;
  const OFFSET_Z = -230;
  const YAW_DEG = 0;

const addGlacierModel = (map, url, utmEasting, utmNorthing) => {
  const adjustedE = utmEasting + OFFSET_E;
  const adjustedN = utmNorthing + OFFSET_N;
  const [lng, lat] = proj4(utm8n, wgs84, [adjustedE, adjustedN]);

  const baseElevation =
    map.queryTerrainElevation([lng, lat], { exaggerated: false }) || 0;
  const modelAltitude = baseElevation + OFFSET_Z;

  const yaw = THREE.MathUtils.degToRad(YAW_DEG);
  const modelRotate = [0, 0, yaw];

  const modelAsMercator = mapboxgl.MercatorCoordinate.fromLngLat(
    [lng, lat],
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercator.x,
    translateY: modelAsMercator.y,
    translateZ: modelAsMercator.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelAsMercator.meterInMercatorCoordinateUnits(),
  };

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);
  renderer.getContext().depthFunc(renderer.getContext().LEQUAL);

const ambientLight = new THREE.AmbientLight(0xffffff, 4.0); // was 0.6
scene.add(ambientLight);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.6); // sky, ground, intensity
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);


  sceneRef.current = scene;
  cameraRef.current = camera;
  rendererRef.current = renderer;

  const loader = new GLTFLoader();
  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh) {
          child.material.depthTest = false;
          child.material.depthWrite = false;
        }
      });

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


  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [-134.49923, 58.45039],
      zoom: 13,
      pitch: 40,
      bearing: -10,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });

      map.once("idle", () => {
        const centerLngLat = [-134.49923, 58.45039];
        const [utmE, utmN] = proj4(wgs84, utm8n, centerLngLat);

        addGlacierModel(
          map,
          `${process.env.PUBLIC_URL}/models/sb_geo.glb`,
          utmE,
          utmN
        );
      });

      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new mapboxgl.FullscreenControl());
    });

    return () => map.remove();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapContainer} className="map-container" />
      <Loc3D
        mapRef={mapRef}
        position={{ left: 12, bottom: 12 }}
        precision={5}
        showFeet={true}
        className="loc-overlay"
      />
    </div>
  );
}
