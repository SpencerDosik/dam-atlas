import { X } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { formatDate } from "@/lib/format";
import type { Summary } from "@/types/dam";

interface AboutModalProps {
  summary: Summary;
}

export function AboutModal({ summary }: AboutModalProps) {
  const { aboutOpen, setAboutOpen } = useUiStore();

  if (!aboutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/60"
        aria-label="Close about modal"
        onClick={() => setAboutOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-heading"
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-border-strong bg-bg-elevated shadow-panel"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border-subtle bg-bg-elevated px-6 py-4">
          <h2 id="about-heading" className="text-lg font-semibold text-text-primary">
            About Dam Hazard Atlas
          </h2>
          <button
            onClick={() => setAboutOpen(false)}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            aria-label="Close about modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <section>
            <p className="text-sm leading-relaxed text-text-secondary">
              Dam Hazard Atlas visualizes approximately 92,000 dam records from the U.S. Army Corps
              of Engineers National Inventory of Dams (NID) on an interactive 3D map. Each dam is
              rendered as an extruded column — height encodes physical dam height, color encodes
              hazard classification. The risk score combines hazard potential and structural
              condition into a single 0–100 index.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Data Source</h3>
            <p className="text-sm text-text-secondary">
              Data from the{" "}
              <a
                href="https://nid.sec.usace.army.mil/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                U.S. Army Corps of Engineers National Inventory of Dams (NID)
              </a>
              . Last updated: {formatDate(summary.generatedAt)}.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Attributions</h3>
            <ul className="space-y-1 text-sm text-text-secondary">
              <li>
                Map tiles by{" "}
                <a
                  href="https://stadiamaps.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Stadia Maps
                </a>{" "}
                (Alidade Smooth Dark style)
              </li>
              <li>
                Terrain data courtesy{" "}
                <a
                  href="https://registry.opendata.aws/terrain-tiles/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  AWS Open Data
                </a>
              </li>
              <li>
                Map rendering by{" "}
                <a
                  href="https://maplibre.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  MapLibre GL JS
                </a>{" "}
                and{" "}
                <a
                  href="https://deck.gl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  deck.gl
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Risk Score Formula</h3>
            <p className="mb-2 text-sm text-text-secondary">
              Risk score = round(0.6 × hazard weight + 0.4 × condition weight)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <table className="text-xs">
                <caption className="mb-1 text-left font-medium text-text-secondary">
                  Hazard Weights
                </caption>
                <tbody>
                  {[
                    ["High", 100],
                    ["Significant", 60],
                    ["Low", 20],
                    ["Undetermined", 0],
                  ].map(([k, v]) => (
                    <tr key={String(k)}>
                      <td className="py-0.5 pr-4 text-text-secondary">{k}</td>
                      <td className="tabular-nums text-text-primary">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="text-xs">
                <caption className="mb-1 text-left font-medium text-text-secondary">
                  Condition Weights
                </caption>
                <tbody>
                  {[
                    ["Poor", 100],
                    ["Unsatisfactory", 100],
                    ["Fair", 60],
                    ["Not Rated", 40],
                    ["Satisfactory", 20],
                  ].map(([k, v]) => (
                    <tr key={String(k)}>
                      <td className="py-0.5 pr-4 text-text-secondary">{k}</td>
                      <td className="tabular-nums text-text-primary">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Caveats</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-text-secondary">
              <li>
                Hazard potential refers to consequences if the dam fails, not the probability of
                failure.
              </li>
              <li>Condition assessment is not available for all dams.</li>
              <li>Dam coordinates are approximate and may not reflect exact structure location.</li>
              <li>
                Data is refreshed monthly from NID; very recent changes may not be reflected.
              </li>
            </ul>
          </section>

          <section className="rounded-lg border border-border-strong bg-bg-overlay p-4">
            <p className="text-xs text-text-tertiary">
              <strong className="text-text-secondary">Disclaimer:</strong> This visualization is
              for informational purposes only and is not an official safety assessment. Do not use
              for emergency planning or safety decisions.
            </p>
          </section>

          <section className="flex items-center justify-between text-xs text-text-tertiary">
            <span>License: MIT</span>
            <a
              href="https://github.com/spencerdosik/dam-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              View on GitHub
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
