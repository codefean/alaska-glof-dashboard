import React, { useRef, useState } from "react";
import "./SearchBar.css";

export default function SearchBar({
  lakeData = [],
  glacierData = [],
  mapRef,
  lockedPopupRef,
  handleSearch: handleSearchProp,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const focusMap = () => {
    const map = mapRef?.current;
    if (!map) return;
    const canvas = map.getCanvas?.();
    if (canvas) canvas.focus();
  };

  const blurSearch = () => inputRef.current?.blur();

  const handleSearchLocal = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const foundLake = lakeData.find(
      (lake) =>
        (lake.LakeName && lake.LakeName.toLowerCase() === query) ||
        (lake.LakeID && lake.LakeID.toLowerCase() === query)
    );

    if (foundLake && mapRef?.current) {
      mapRef.current.flyTo({
        center: [foundLake.lon, foundLake.lat],
        zoom: 12,
        speed: 2,
        pitch: 50,
      });
      blurSearch();
      focusMap();
      return;
    }

    const foundGlacier = glacierData.find(
      (gl) => gl.name && gl.name.toLowerCase() === query
    );

    if (foundGlacier && mapRef?.current) {
      mapRef.current.flyTo({
        center: [foundGlacier.lon, foundGlacier.lat],
        zoom: 11.5,
        speed: 2,
        pitch: 50,
      });

      if (lockedPopupRef?.current) {
        lockedPopupRef.current
          .setLngLat([foundGlacier.lon, foundGlacier.lat])
          .setHTML(`<div class="glacier-label">${foundGlacier.name}</div>`)
          .addTo(mapRef.current);
      }

      blurSearch();
      focusMap();
      return;
    }

    alert("No Data Found");
    blurSearch();
    focusMap();
  };

  const handleSearch = handleSearchProp || handleSearchLocal;

  const buildSuggestions = (value) => {
    const q = value.trim().toLowerCase();
    if (!q) return [];

    const lakeMatches = lakeData
      .filter(
        (lake) =>
          (lake.LakeName && lake.LakeName.toLowerCase().includes(q)) ||
          (lake.LakeID && lake.LakeID.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map((lake) => ({
        type: "lake",
        label: lake.LakeName || `Lake ${lake.LakeID}`,
        data: lake,
      }));

    const glacierMatches = glacierData
      .filter((gl) => gl.name && gl.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((gl) => ({
        type: "glacier",
        label: gl.name,
        data: gl,
      }));

    return [...lakeMatches, ...glacierMatches].slice(0, 4);
  };


  const onBlur = () => setTimeout(() => setSuggestions([]), 120);

  const selectSuggestion = (s) => {
    setSearchQuery(s.label);
    setSuggestions([]);

    if (!mapRef?.current) return;

    if (s.type === "lake") {
      const lake = s.data;
      mapRef.current.flyTo({
        center: [lake.lon, lake.lat],
        zoom: 12,
        speed: 2,
        pitch: 50,
      });
    } else {
      const gl = s.data;
      mapRef.current.flyTo({
        center: [gl.lon, gl.lat],
        zoom: 11.5,
        speed: 2,
        pitch: 50,
      });

      if (lockedPopupRef?.current) {
        lockedPopupRef.current
          .setLngLat([gl.lon, gl.lat])
          .setHTML(`<div class="glacier-label">${gl.name}</div>`)
          .addTo(mapRef.current);
      }
    }

    blurSearch();
    focusMap();
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-inner">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search lakes by name, ID, or glacier..."
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            setSuggestions(buildSuggestions(value));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
            if (e.key === "Escape") {
              setSuggestions([]);
              blurSearch();
              focusMap();
            }
          }}
          onBlur={onBlur}
        />

        {suggestions.length > 0 && (
          <ul className="dropdown-suggestions">
            {suggestions.map((s, idx) => (
              <li
                key={`${s.type}-${idx}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
              >
                {s.type === "glacier" ? `🧊 ${s.label}` : s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => {
          handleSearch();
          blurSearch();
          focusMap();
        }}
      >
        Search
      </button>
    </div>
  );
}
