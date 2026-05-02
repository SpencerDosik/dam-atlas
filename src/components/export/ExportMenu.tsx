import { useState } from "react";
import { Download, FileText, Map, Link, ChevronDown } from "lucide-react";
import { exportCsv } from "./CsvExport";
import { exportMapPng } from "./PngExport";
import type { DamFeature, Summary } from "@/types/dam";

interface ExportMenuProps {
  filteredFeatures: DamFeature[];
  summary: Summary;
}

export function ExportMenu({ filteredFeatures }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCsv() {
    exportCsv(filteredFeatures, "dam-atlas-filtered.csv");
    setOpen(false);
  }

  function handleGeoJson() {
    const fc = {
      type: "FeatureCollection",
      features: filteredFeatures,
    };
    const blob = new Blob([JSON.stringify(fc)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dam-atlas-filtered.geojson";
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  async function handlePng() {
    await exportMapPng();
    setOpen(false);
  }

  async function handleShareLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
        aria-label="Export options"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download size={14} aria-hidden="true" />
        Export
        <ChevronDown size={12} aria-hidden="true" />
      </button>

      {copied && (
        <div className="absolute right-0 top-full mt-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-bg-base shadow-panel">
          Link copied!
        </div>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-border-strong bg-bg-overlay shadow-panel"
          >
            <button
              role="menuitem"
              onClick={handleCsv}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <FileText size={14} aria-hidden="true" />
              <div className="text-left">
                <p>Download CSV</p>
                <p className="text-xs text-text-tertiary">
                  {filteredFeatures.length.toLocaleString()} dams
                </p>
              </div>
            </button>
            <button
              role="menuitem"
              onClick={handleGeoJson}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <Map size={14} aria-hidden="true" />
              <div className="text-left">
                <p>Download GeoJSON</p>
                <p className="text-xs text-text-tertiary">
                  {filteredFeatures.length.toLocaleString()} dams
                </p>
              </div>
            </button>
            <button
              role="menuitem"
              onClick={handlePng}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <Map size={14} aria-hidden="true" />
              <p>Export map as PNG</p>
            </button>
            <button
              role="menuitem"
              onClick={handleShareLink}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <Link size={14} aria-hidden="true" />
              <p>Copy shareable link</p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
