import { RefreshCw } from "lucide-react";

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div className="flex h-full items-center justify-center bg-bg-base p-4">
      <div className="w-full max-w-md rounded-xl border border-border-strong bg-bg-elevated p-8 shadow-panel">
        <h1 className="mb-2 text-xl font-semibold text-text-primary">Could not load dam data.</h1>
        <p className="mb-4 text-sm text-text-secondary">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-base transition-colors hover:bg-accent-hover"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Retry
          </button>
          <a
            href="https://github.com/spencerdosik/dam-atlas/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
          >
            Report this issue
          </a>
        </div>
      </div>
    </div>
  );
}
