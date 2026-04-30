import { useEffect, useRef, useMemo, useCallback } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ColumnLayer, ScatterplotLayer } from "@deck.gl/layers";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { LightingEffect, AmbientLight, DirectionalLight } from "@deck.gl/core";
import type maplibregl from "maplibre-gl";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useUiStore } from "@/store/useUiStore";
import { useViewStore } from "@/store/useViewStore";
import { getHazardColorWithRisk, getHazardColor, type ColorArray } from "@/lib/colors";
import type { DamFeature } from "@/types/dam";

const EXCLUDED_ALPHA = 30;
const BASE_ELEVATION = 200;
const SCALE_ELEVATION = 80;

function getDamElevation(heightFt: number | null): number {
  const raw =
    heightFt !== null
      ? BASE_ELEVATION + SCALE_ELEVATION * Math.log10(Math.max(1, heightFt))
      : BASE_ELEVATION + 40;
  return Math.round(raw / 5) * 5;
}


const lightingEffect = new LightingEffect({
  ambient: new AmbientLight({ color: [255, 255, 255], intensity: 0.6 }),
  directional: new DirectionalLight({
    color: [255, 255, 255],
    intensity: 1.4,
    direction: [-3, -9, -1],
  }),
});

interface DeckOverlayProps {
  map: maplibregl.Map;
  features: DamFeature[];
  filteredFeatures: DamFeature[];
}

export function DeckOverlay({ map, features, filteredFeatures }: DeckOverlayProps) {
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const { setSelected, setHovered, selectedNidId } = useSelectionStore();
  const { colorblindMode, showDensityLayer, isMobile } = useUiStore();
  const zoom = useViewStore((s) => s.zoom);

  const filteredIds = useMemo(
    () => new Set(filteredFeatures.map((f) => f.properties.nidId)),
    [filteredFeatures]
  );

  const handleHover = useCallback(
    ({ object }: { object?: DamFeature | null }) => {
      setHovered(object?.properties.nidId ?? null);
    },
    [setHovered]
  );

  const handleClick = useCallback(
    ({ object }: { object?: DamFeature | null }) => {
      if (object) {
        setSelected(object.properties.nidId);
        useUiStore.getState().setSidebarOpen(true);
      }
    },
    [setSelected]
  );

  const layers = useMemo(() => {
    const layerList = [];

    const isFiltered = filteredIds.size < features.length;
    const noFilters = !isFiltered;

    if (noFilters && showDensityLayer && !isMobile && zoom <= 4) {
      layerList.push(
        new HexagonLayer({
          id: "density",
          data: features,
          getPosition: (f: DamFeature) => f.geometry.coordinates,
          radius: 50000,
          elevationScale: 0,
          extruded: false,
          colorRange: [
            [22, 27, 37, 80],
            [34, 197, 94, 120],
            [245, 158, 11, 160],
            [239, 68, 68, 200],
          ] as ColorArray[],
          pickable: false,
        })
      );
    }

    if (zoom < 5) {
      layerList.push(
        new ScatterplotLayer<DamFeature>({
          id: "dams-scatter",
          data: features,
          getPosition: (f) => f.geometry.coordinates,
          getRadius: 4,
          radiusUnits: "pixels",
          getFillColor: (f) => {
            const p = f.properties;
            const excluded = isFiltered && !filteredIds.has(p.nidId);
            return excluded
              ? getHazardColor(p.hazardPotential, colorblindMode, EXCLUDED_ALPHA)
              : getHazardColorWithRisk(p.hazardPotential, p.riskScore, colorblindMode);
          },
          getLineColor: [255, 255, 255, 100],
          stroked: true,
          lineWidthMinPixels: 0.5,
          pickable: true,
          onHover: handleHover,
          onClick: handleClick,
          updateTriggers: {
            getFillColor: [filteredIds, colorblindMode],
          },
        })
      );
    } else {
      layerList.push(
        new ColumnLayer<DamFeature>({
          id: "dams-columns",
          data: features,
          getPosition: (f) => f.geometry.coordinates,
          getElevation: (f) => getDamElevation(f.properties.damHeight),
          getFillColor: (f) => {
            const p = f.properties;
            const excluded = isFiltered && !filteredIds.has(p.nidId);
            return excluded
              ? getHazardColor(p.hazardPotential, colorblindMode, EXCLUDED_ALPHA)
              : getHazardColorWithRisk(p.hazardPotential, p.riskScore, colorblindMode);
          },
          getLineColor: [0, 0, 0, 0],
          diskResolution: 12,
          radius: 1200,
          radiusUnits: "meters",
          extruded: true,
          material: { ambient: 0.5, diffuse: 0.6, shininess: 30, specularColor: [60, 64, 70] },
          pickable: true,
          autoHighlight: true,
          onHover: handleHover,
          onClick: handleClick,
          updateTriggers: {
            getFillColor: [filteredIds, colorblindMode],
            getElevation: [],
          },
        })
      );

      if (selectedNidId) {
        const selectedFeature = features.find((f) => f.properties.nidId === selectedNidId);
        if (selectedFeature) {
          layerList.push(
            new ColumnLayer<DamFeature>({
              id: "dams-selected",
              data: [selectedFeature],
              getPosition: (f) => f.geometry.coordinates,
              getElevation: (f) => getDamElevation(f.properties.damHeight) * 1.15,
              getFillColor: [255, 255, 255, 220],
              getLineColor: [255, 255, 255, 255],
              diskResolution: 16,
              radius: 1400,
              radiusUnits: "meters",
              extruded: true,
              material: { ambient: 0.8, diffuse: 0.8, shininess: 60, specularColor: [255, 255, 255] },
              pickable: false,
            })
          );
        }
      }
    }

    return layerList;
  }, [
    features,
    filteredIds,
    colorblindMode,
    showDensityLayer,
    isMobile,
    zoom,
    selectedNidId,
    handleHover,
    handleClick,
  ]);

  useEffect(() => {
    const overlay = new MapboxOverlay({
      layers,
      effects: [lightingEffect],
      interleaved: false,
    });
    map.addControl(overlay as unknown as maplibregl.IControl);
    overlayRef.current = overlay;

    return () => {
      map.removeControl(overlay as unknown as maplibregl.IControl);
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    overlayRef.current?.setProps({ layers, effects: [lightingEffect] });
  }, [layers]);

  return null;
}
