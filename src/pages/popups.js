// popups.js
import mapboxgl from "mapbox-gl";
import "./popup.css";

export function buildLakePopupHTML(lake) {
  const {
    LakeID,
    LakeName,
    GlacierName,
    waterFlow,
    downstream,
    isHazard,
    futureHazard,
    futureHazardETA,
  } = lake;

  return `
    <h4>${LakeName || `Lake ${LakeID}`}</h4>
    <p>
      <strong>Glacier:</strong> ${GlacierName || "Unknown"}<br/>
      ${waterFlow ? `<strong>Flow:</strong> ${waterFlow}<br/>` : ""}
      ${downstream ? `<strong>Downstream:</strong> ${downstream}<br/>` : ""}
      ${
        futureHazard
          ? `<em>Potential future hazard${
              futureHazardETA ? ` (ETA: ${futureHazardETA})` : ""
            }</em><br/>`
          : ""
      }
    </p>

${
  isHazard || futureHazard
    ? `
      <div class="glof-button-wrapper">
        <a
          href="#/data"
          class="glof-button"
          onclick="
            event.stopPropagation();
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          "
        >
          More Info
        </a>
      </div>
    `
    : ""
}
  `;
}

export function createPopupController({
  map,
  hoverPopupRef,
  lockedPopupRef,
  isPopupLockedRef,
  hoverAutoCloseMs = 20000,
}) {
  let hoverTimeout = null;

  const clearHover = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = null;
    hoverPopupRef.current?.remove();
    hoverPopupRef.current = null;
  };

  const clearLocked = () => {
    isPopupLockedRef.current = false;
    lockedPopupRef.current?.remove();
    lockedPopupRef.current = null;
  };

  const showHover = ({ lngLat, html }) => {
    clearHover();

    hoverPopupRef.current = new mapboxgl.Popup({
      closeOnClick: false,
      closeButton: false,
      className: "glof-mapbox-popup glof-mapbox-popup--hover",
    })
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(map);

    hoverTimeout = setTimeout(clearHover, hoverAutoCloseMs);
  };

  const showLocked = ({ lngLat, html }) => {
    clearHover();
    lockedPopupRef.current?.remove();

    isPopupLockedRef.current = true;

    lockedPopupRef.current = new mapboxgl.Popup({
      closeOnClick: false,
      className: "glof-mapbox-popup glof-mapbox-popup--locked",
    })
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(map);
  };

  const attachToMarkerEl = ({
    el,
    lon,
    lat,
    html,
    onLock,
  }) => {
    const lngLat = [lon, lat];

    const handleEnter = () => showHover({ lngLat, html });
    const handleLeave = () => clearHover();
    const handleClick = (e) => {
      e.stopPropagation();
      showLocked({ lngLat, html });
      if (typeof onLock === "function") onLock();
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("click", handleClick);

    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("click", handleClick);
    };
  };

  return {
    showHover,
    showLocked,
    clearHover,
    clearLocked,
    attachToMarkerEl,
  };
}
