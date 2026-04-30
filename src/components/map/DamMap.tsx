import { useRef, useEffect, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useViewStore, DEFAULT_VIEW } from "@/store/useViewStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import { DeckOverlay } from "./DeckOverlay";
import { Legend } from "./Legend";
import { MapControls } from "./MapControls";
import { HoverTooltip } from "./HoverTooltip";
import { FilteredCountBadge } from "./FilteredCountBadge";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { DamFeature } from "@/types/dam";

const STADIA_STYLE_URL = import.meta.env.VITE_STADIA_API_KEY
  ? `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json?api_key=${import.meta.env.VITE_STADIA_API_KEY}`
  : "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json";

interface DamMapProps {
  features: DamFeature[];
  filteredFeatures: DamFeature[];
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function DamMap({ features, filteredFeatures, searchRef }: DamMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const setView = useViewStore((s) => s.setView);
  const { selectedNidId } = useSelectionStore();

  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      center: [DEFAULT_VIEW.longitude, DEFAULT_VIEW.latitude],
      zoom: DEFAULT_VIEW.zoom,
      pitch: DEFAULT_VIEW.pitch,
      bearing: DEFAULT_VIEW.bearing,
      duration: 1200,
    });
  }, []);

  useKeyboardShortcuts(searchRef, resetView);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STADIA_STYLE_URL,
      center: [-98.5, 39.5],
      zoom: 2.8,
      pitch: 0,
      bearing: 0,
      maxPitch: 75,
      attributionControl: { compact: true },
      antialias: true,
    });

    mapRef.current = map;

    map.on("error", (e) => {
      const msg = e.error?.message ?? "";
      if (msg.includes("401") || msg.includes("403")) {
        setTileError(true);
      }
    });

    map.on("load", () => {
      map.addSource("terrain", {
        type: "raster-dem",
        tiles: [
          "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
        ],
        encoding: "terrarium",
        tileSize: 256,
        maxzoom: 15,
        attribution: "Terrain data courtesy AWS Open Data",
      });
      map.setTerrain({ source: "terrain", exaggeration: 1.3 });

      try {
        map.setSky({
          "sky-color": "#0a0d12",
          "horizon-color": "#161b25",
          "fog-color": "#0a0d12",
          "fog-ground-blend": 0.5,
          "horizon-fog-blend": 0.5,
          "sky-horizon-blend": 0.6,
          "atmosphere-blend": 0.5,
        });
      } catch (err) {
        console.warn("setSky not supported in this MapLibre version:", err);
      }

      if (!prefersReducedMotion) {
        const ease = (t: number) => t * (2 - t);
        map.easeTo({
          zoom: 3.5,
          pitch: 45,
          bearing: 0,
          duration: 2500,
          easing: ease,
        });
      }

      setMapReady(true);
    });

    map.on("move", () => {
      const center = map.getCenter();
      setView({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "imperial" }), "bottom-left");

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedNidId) return;
    const feature = features.find((f) => f.properties.nidId === selectedNidId);
    if (!feature) return;
    const [lon, lat] = feature.geometry.coordinates;
    map.flyTo({
      center: [lon, lat],
      zoom: 11,
      pitch: 60,
      bearing: map.getBearing() + 30,
      duration: prefersReducedMotion ? 0 : 1200,
    });
  }, [selectedNidId, features, prefersReducedMotion]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="Interactive dam hazard map"
      />
      <span className="sr-only">
        Use arrow keys to pan, +/- to zoom. Press Enter to select a hovered dam. Press Tab to cycle through dams when the sidebar is open.
      </span>

      {mapReady && mapRef.current && (
        <DeckOverlay
          map={mapRef.current}
          features={features}
          filteredFeatures={filteredFeatures}
        />
      )}

      <HoverTooltip features={features} />
      <FilteredCountBadge
        filteredCount={filteredFeatures.length}
        totalCount={features.length}
      />
      <Legend filteredFeatures={filteredFeatures} />
      <MapControls map={mapRef.current} onResetView={resetView} />

      {tileError && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-lg border border-border-strong bg-bg-overlay px-4 py-3 text-sm text-text-secondary shadow-panel">
          Map tiles are not loading. The deployed domain may need to be added to the Stadia Maps
          allowed origins list. See README.
        </div>
      )}
    </div>
  );
}
