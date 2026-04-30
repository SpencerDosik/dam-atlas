import { useState, useEffect } from "react";
import { loadGeoJson, loadSummary } from "@/lib/dataLoader";
import { initSearch } from "@/lib/searchDams";
import type { DamFeature, Summary } from "@/types/dam";

export type LoadStatus = "idle" | "loading" | "ready" | "error";

interface DamsState {
  features: DamFeature[];
  summary: Summary | null;
  status: LoadStatus;
  error: string | null;
  reload: () => void;
}

export function useDams(): DamsState {
  const [features, setFeatures] = useState<DamFeature[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    async function load() {
      try {
        const [geo, sum] = await Promise.all([loadGeoJson(), loadSummary()]);
        if (cancelled) return;
        setFeatures(geo.features);
        setSummary(sum);
        initSearch(geo.features);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    features,
    summary,
    status,
    error,
    reload: () => setReloadKey((k) => k + 1),
  };
}
