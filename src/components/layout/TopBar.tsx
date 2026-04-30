import { Github } from "lucide-react";
import { useUiStore, type AppView } from "@/store/useUiStore";
import { SearchBar } from "@/components/search/SearchBar";
import { ExportMenu } from "@/components/export/ExportMenu";
import type { DamFeature, Summary } from "@/types/dam";

interface TopBarProps {
  features: DamFeature[];
  filteredFeatures: DamFeature[];
  summary: Summary;
  searchRef: React.RefObject<HTMLInputElement>;
}

const VIEWS: { id: AppView; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "table", label: "Table" },
  { id: "summary", label: "Summary" },
];

export function TopBar({ features, filteredFeatures, summary, searchRef }: TopBarProps) {
  const { view, setView, setAboutOpen } = useUiStore();

  return (
    <header
      className="relative z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-bg-elevated px-4 glass"
      role="banner"
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
        <span className="text-sm font-semibold text-text-primary">Dam Hazard Atlas</span>
      </div>

      <nav
        className="mx-auto flex items-center rounded-lg bg-bg-overlay p-0.5"
        aria-label="View navigation"
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            aria-pressed={view === v.id}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              view === v.id
                ? "bg-bg-hover text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <SearchBar
          ref={searchRef}
          features={features}
        />
        <ExportMenu filteredFeatures={filteredFeatures} summary={summary} />
        <button
          onClick={() => setAboutOpen(true)}
          className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label="About this application"
        >
          About
        </button>
        <a
          href="https://github.com/spencerdosik/dam-atlas"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label="View source on GitHub"
        >
          <Github size={16} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
