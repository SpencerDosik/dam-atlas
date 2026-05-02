import { toPng } from "html-to-image";

export async function exportMapPng(filename = "dam-atlas.png"): Promise<void> {
  const mapEl = document.querySelector(".maplibregl-canvas-container") as HTMLElement | null;
  if (!mapEl) {
    console.warn("Map canvas container not found for PNG export");
    return;
  }

  const dataUrl = await toPng(mapEl, { pixelRatio: 2 });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
