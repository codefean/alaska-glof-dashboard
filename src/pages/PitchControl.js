import React, { forwardRef, useEffect, useMemo } from "react";
import "./PitchControl.css";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const PitchControl = forwardRef(
  (
    {
      mapRef,

      value,
      onChange,
      min = 10,
      max = 80,
      step = 1,

      bearing = 0,
      onBearingChange,
      bearingMin = -180,
      bearingMax = 180,
      bearingStep = 1,
    },
    ref
  ) => {

    const safePitch = useMemo(() => {
      const n = Number(value);
      const fallback = Number.isFinite(n) ? n : min;
      return Math.round(clamp(fallback, min, max));
    }, [value, min, max]);

    const safeBearing = useMemo(() => {
      const n = Number(bearing);
      const fallback = Number.isFinite(n) ? n : 0;
      return Math.round(clamp(fallback, bearingMin, bearingMax));
    }, [bearing, bearingMin, bearingMax]);

    const handlePitchChange = (e) => {
      const newPitch = parseInt(e.target.value, 10);
      if (mapRef.current) mapRef.current.setPitch(newPitch);
      onChange?.(newPitch); 
    };

    const handleBearingChange = (e) => {
      const newBearing = parseInt(e.target.value, 10);
      if (mapRef.current) mapRef.current.setBearing(newBearing);
      onBearingChange?.(newBearing); 
    };


    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const syncPitchFromMap = () => {
        const p = map.getPitch?.();
        if (typeof p === "number" && Number.isFinite(p)) {
          onChange?.(Math.round(p));
        }
      };

      const syncBearingFromMap = () => {
        const b = map.getBearing?.();
        if (typeof b === "number" && Number.isFinite(b)) {
          onBearingChange?.(Math.round(b));
        }
      };


      map.on?.("pitch", syncPitchFromMap);
      map.on?.("zoom", syncPitchFromMap);   
      map.on?.("rotate", syncBearingFromMap);
      map.on?.("move", syncBearingFromMap); 


      syncPitchFromMap();
      syncBearingFromMap();

      return () => {
        map.off?.("pitch", syncPitchFromMap);
        map.off?.("zoom", syncPitchFromMap);
        map.off?.("rotate", syncBearingFromMap);
        map.off?.("move", syncBearingFromMap);
      };
    }, [mapRef, onChange, onBearingChange]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const current = map.getPitch?.();
      if (typeof current === "number" && Math.round(current) !== safePitch) {
        map.setPitch?.(safePitch);
      }
    }, [mapRef, safePitch]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const current = map.getBearing?.();
      if (typeof current === "number" && Math.round(current) !== safeBearing) {
        map.setBearing?.(safeBearing);
      }
    }, [mapRef, safeBearing]);

    return (
      <div ref={ref} className="pitch-control">
        <label htmlFor="pitch-slider">3D</label>
        <input
          id="pitch-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={safePitch}
          onInput={handlePitchChange}
          aria-label="Angle"
          title="Angle"
        />

        <div className="bearing-control">
          <label htmlFor="bearing-slider"></label>
          <input
            id="bearing-slider"
            type="range"
            min={bearingMin}
            max={bearingMax}
            step={bearingStep}
            value={safeBearing}
            onInput={handleBearingChange}
            aria-label="Rotate"
            title="Rotate"
          />
        </div>
      </div>
    );
  }
);

export default PitchControl;
