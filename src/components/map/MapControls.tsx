import { ZoomIn, ZoomOut, Compass, Home, Maximize, Box } from "lucide-react";
import type maplibregl from "maplibre-gl";

interface MapControlsProps {
  map: maplibregl.Map | null;
  onResetView: () => void;
}

export function MapControls({ map, onResetView }: MapControlsProps) {
  function zoomIn() {
    map?.zoomIn({ duration: 300 });
  }

  function zoomOut() {
    map?.zoomOut({ duration: 300 });
  }

  function resetNorth() {
    map?.easeTo({ bearing: 0, duration: 500 });
  }

  function togglePitch() {
    if (!map) return;
    const current = map.getPitch();
    map.easeTo({ pitch: current > 10 ? 0 : 45, duration: 600 });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const btnClass =
    "flex h-10 w-10 items-center justify-center rounded-lg bg-bg-overlay text-text-secondary shadow-panel transition-colors hover:bg-bg-hover hover:text-text-primary";

  return (
    <div className="absolute bottom-12 right-4 z-10 flex flex-col gap-1.5">
      <button onClick={zoomIn} className={btnClass} aria-label="Zoom in">
        <ZoomIn size={16} aria-hidden="true" />
      </button>
      <button onClick={zoomOut} className={btnClass} aria-label="Zoom out">
        <ZoomOut size={16} aria-hidden="true" />
      </button>
      <button onClick={resetNorth} className={btnClass} aria-label="Reset north">
        <Compass size={16} aria-hidden="true" />
      </button>
      <button onClick={onResetView} className={btnClass} aria-label="Reset map view to continental US">
        <Home size={16} aria-hidden="true" />
      </button>
      <button onClick={togglePitch} className={btnClass} aria-label="Toggle 3D perspective">
        <Box size={16} aria-hidden="true" />
      </button>
      <button onClick={toggleFullscreen} className={btnClass} aria-label="Toggle fullscreen">
        <Maximize size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
