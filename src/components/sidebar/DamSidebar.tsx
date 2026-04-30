import { useEffect, useState } from "react";
import { X, Copy, MapPin, ExternalLink } from "lucide-react";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useUiStore } from "@/store/useUiStore";
import { loadDetail } from "@/lib/dataLoader";
import { formatHeight, formatStorage, formatDate, formatRelativeDate } from "@/lib/format";
import { getHazardHex } from "@/lib/colors";
import { RiskScoreBadge } from "./RiskScoreBadge";
import { DetailField } from "./DetailField";
import type { DamDetail } from "@/types/dam";

export function DamSidebar() {
  const { selectedNidId, setSelected } = useSelectionStore();
  const { sidebarOpen, setSidebarOpen, isMobile } = useUiStore();
  const [detail, setDetail] = useState<DamDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedNidId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    loadDetail(selectedNidId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [selectedNidId]);

  function close() {
    setSelected(null);
    setSidebarOpen(false);
  }

  async function copyId() {
    if (!selectedNidId) return;
    await navigator.clipboard.writeText(selectedNidId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!sidebarOpen || !selectedNidId) return null;

  const sidebarClass = isMobile
    ? "fixed bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-border-strong bg-bg-elevated shadow-panel"
    : "absolute right-0 top-0 z-20 flex h-full w-96 flex-col overflow-y-auto border-l border-border-subtle bg-bg-elevated shadow-panel";

  return (
    <aside
      aria-label="Dam details"
      className={sidebarClass}
    >
      <div className="sticky top-0 flex items-start justify-between border-b border-border-subtle bg-bg-elevated px-4 py-3">
        <div className="min-w-0 flex-1">
          {detail ? (
            <>
              <h2 className="text-base font-semibold text-text-primary leading-tight">
                {detail.name}
              </h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                {detail.state}{detail.county ? ` · ${detail.county} County` : ""}
              </p>
            </>
          ) : (
            <div className="h-5 w-40 animate-pulse rounded bg-bg-hover" />
          )}
        </div>
        <button
          onClick={close}
          className="ml-2 shrink-0 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label="Close dam details"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {!loading && detail && (
        <div className="space-y-5 p-4">
          <div className="flex items-start gap-4">
            <RiskScoreBadge score={detail.riskScore} tier={detail.riskTier} size="lg" />
            <div className="flex flex-col gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: getHazardHex(detail.hazardPotential) }}
              >
                {detail.hazardPotential} Hazard
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                {detail.condition}
              </span>
            </div>
          </div>

          <section aria-labelledby="physical-heading">
            <h3 id="physical-heading" className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Physical
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailField label="Height" value={formatHeight(detail.damHeight)} mono />
              <DetailField label="Hydraulic Height" value={formatHeight(detail.hydraulicHeight)} mono />
              <DetailField label="Structural Height" value={formatHeight(detail.structuralHeight)} mono />
              <DetailField label="Length" value={detail.damLength ? `${detail.damLength.toLocaleString()} ft` : null} mono />
              <DetailField label="Max Storage" value={formatStorage(detail.maxStorage)} mono />
              <DetailField label="Normal Storage" value={formatStorage(detail.normalStorage)} mono />
              <DetailField label="Drainage Area" value={detail.drainageArea ? `${detail.drainageArea.toLocaleString()} sq mi` : null} mono />
            </div>
          </section>

          <section aria-labelledby="operational-heading">
            <h3 id="operational-heading" className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Operational
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailField label="Year Completed" value={detail.yearCompleted} mono />
              <DetailField label="Year Modified" value={detail.yearModified} mono />
              <DetailField label="Dam Type" value={detail.damType} />
              <DetailField label="Primary Purpose" value={detail.primaryPurpose} />
              <DetailField label="Spillway Type" value={detail.spillwayType} />
              {detail.allPurposes && (
                <div className="col-span-2">
                  <DetailField label="All Purposes" value={detail.allPurposes} />
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="ownership-heading">
            <h3 id="ownership-heading" className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Ownership & Oversight
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailField label="Owner Name" value={detail.ownerName} />
              <DetailField label="Owner Type" value={detail.ownerType} />
              <DetailField label="Regulatory Agency" value={detail.regulatoryAgency} />
              <DetailField label="Federal Agency" value={detail.federalAgency} />
              <DetailField label="State Regulated" value={detail.stateRegulatedDam ?? null} />
            </div>
          </section>

          <section aria-labelledby="inspection-heading">
            <h3 id="inspection-heading" className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Inspection
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-xs text-text-tertiary">Last Inspection</span>
                <span className="text-sm text-text-primary">{formatDate(detail.lastInspectionDate)}</span>
                {detail.lastInspectionDate && (
                  <span className="text-xs text-text-tertiary">{formatRelativeDate(detail.lastInspectionDate)}</span>
                )}
              </div>
              <DetailField label="Frequency" value={detail.inspectionFrequency ? `Every ${detail.inspectionFrequency} yr` : null} mono />
              <DetailField label="EAP Status" value={detail.eapStatus} />
              <DetailField label="Condition Date" value={formatDate(detail.conditionDate)} mono />
            </div>
          </section>

          {detail.downstreamHazardDescription && (
            <section aria-labelledby="downstream-heading">
              <h3 id="downstream-heading" className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Downstream Hazard
              </h3>
              <blockquote className="rounded-lg border-l-2 border-hazard-high bg-bg-overlay pl-3 pr-3 py-2">
                <p className="text-sm italic text-text-secondary">{detail.downstreamHazardDescription}</p>
              </blockquote>
            </section>
          )}

          <footer className="border-t border-border-subtle pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>NID ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-text-primary">{detail.nidId}</span>
                <button
                  onClick={copyId}
                  className="rounded p-0.5 hover:bg-bg-hover"
                  aria-label="Copy NID ID to clipboard"
                >
                  <Copy size={12} aria-hidden="true" />
                </button>
                {copied && <span className="text-accent text-xs">Copied!</span>}
              </div>
            </div>
            <p className="text-xs text-text-tertiary">Source: USACE National Inventory of Dams</p>
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps?q=${detail.name},${detail.state}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-border-strong px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-hover"
              >
                <ExternalLink size={12} aria-hidden="true" />
                Google Maps
              </a>
              <button className="flex items-center gap-1 rounded-lg border border-border-strong px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-hover">
                <MapPin size={12} aria-hidden="true" />
                Center on map
              </button>
            </div>
          </footer>
        </div>
      )}
    </aside>
  );
}
