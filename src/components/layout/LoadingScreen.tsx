interface LoadingScreenProps {
  totalCount?: number;
}

export function LoadingScreen({ totalCount }: LoadingScreenProps) {
  const count = totalCount?.toLocaleString() ?? "91,843";

  return (
    <div
      className="flex h-full flex-col items-center justify-center bg-bg-base"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
          aria-hidden="true"
        >
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>

        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Dam Hazard Atlas</h1>
          <p className="mt-1 text-sm text-text-secondary">Loading {count} dams…</p>
        </div>

        <div className="w-64 overflow-hidden rounded-full bg-bg-overlay">
          <div
            className="h-1 animate-pulse rounded-full bg-accent"
            style={{ width: "60%" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
