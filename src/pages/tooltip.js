// src/tooltip.js
export const setupTooltip = (map) => {
  const tooltip = document.getElementById("loc-readout");

  if (!tooltip) {
    console.warn("Tooltip element #loc-readout not found in DOM.");
    return;
  }

  map.on("mousemove", (e) => {
    const { lng, lat } = e.lngLat;
    const elevation =
      map.queryTerrainElevation([lng, lat], { exaggerated: false }) || 0;
    const elevationFeet = (elevation * 3.28084).toFixed(1);

    tooltip.innerHTML = `
      <strong>Lat:</strong> ${lat.toFixed(5)}<br/>
      <strong>Lon:</strong> ${lng.toFixed(5)}<br/>
      <strong>Elevation:</strong> ${elevation.toFixed(1)} m (${elevationFeet} ft)
    `;
  });
};
