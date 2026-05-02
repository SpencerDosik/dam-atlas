import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useDams } from "@/hooks/useDams";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUiStore } from "@/store/useUiStore";
import { Shell } from "@/components/layout/Shell";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { ErrorScreen } from "@/components/layout/ErrorScreen";

export default function App() {
  const { features, summary, status, error, reload } = useDams();
  const isMobileQuery = useMediaQuery("(max-width: 767px)");
  const setIsMobile = useUiStore((s) => s.setIsMobile);

  useUrlSync();

  useEffect(() => {
    setIsMobile(isMobileQuery);
  }, [isMobileQuery, setIsMobile]);

  if (status === "loading" || status === "idle") {
    return <LoadingScreen totalCount={summary?.totalDams} />;
  }

  if (status === "error") {
    return <ErrorScreen message={error ?? "Unknown error"} onRetry={reload} />;
  }

  return (
    <>
      <Shell features={features} summary={summary!} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
