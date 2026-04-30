import { useMemo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useUiStore } from "@/store/useUiStore";
import { useFilterStore } from "@/store/useFilterStore";
import { getHazardHex } from "@/lib/colors";
import { formatStorage } from "@/lib/format";
import type { DamFeature } from "@/types/dam";

interface DamTableProps {
  features: DamFeature[];
  totalCount: number;
}

export function DamTable({ features, totalCount }: DamTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { setSelected } = useSelectionStore();
  const { setView, setSidebarOpen } = useUiStore();
  const resetFilters = useFilterStore((s) => s.reset);
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<DamFeature>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessorFn: (r) => r.properties.name,
        cell: (info) => (
          <span className="font-medium text-text-primary">{String(info.getValue())}</span>
        ),
      },
      {
        id: "state",
        header: "State",
        accessorFn: (r) => r.properties.state,
        size: 60,
      },
      {
        id: "hazardPotential",
        header: "Hazard",
        accessorFn: (r) => r.properties.hazardPotential,
        cell: (info) => {
          const val = String(info.getValue());
          const row = info.row.original;
          return (
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: getHazardHex(row.properties.hazardPotential) }}
                aria-hidden="true"
              />
              {val}
            </span>
          );
        },
      },
      {
        id: "condition",
        header: "Condition",
        accessorFn: (r) => r.properties.condition,
      },
      {
        id: "damHeight",
        header: "Height (ft)",
        accessorFn: (r) => r.properties.damHeight ?? -1,
        cell: (info) => {
          const v = info.getValue() as number;
          return <span className="tabular-nums">{v >= 0 ? v.toLocaleString() : "—"}</span>;
        },
        size: 90,
      },
      {
        id: "maxStorage",
        header: "Storage (af)",
        accessorFn: (r) => r.properties.maxStorage ?? -1,
        cell: (info) => {
          const v = info.getValue() as number;
          return <span className="tabular-nums">{v >= 0 ? formatStorage(v) : "—"}</span>;
        },
        size: 100,
      },
      {
        id: "ownerType",
        header: "Owner",
        accessorFn: (r) => r.properties.ownerType ?? "—",
      },
      {
        id: "primaryPurpose",
        header: "Purpose",
        accessorFn: (r) => r.properties.primaryPurpose ?? "—",
      },
      {
        id: "riskScore",
        header: "Risk",
        accessorFn: (r) => r.properties.riskScore,
        cell: (info) => (
          <span className="tabular-nums font-medium">{String(info.getValue())}</span>
        ),
        size: 60,
      },
    ],
    []
  );

  const table = useReactTable({
    data: features,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 20,
  });

  function handleRowClick(feature: DamFeature) {
    setSelected(feature.properties.nidId);
    setSidebarOpen(true);
    setView("map");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg-base">
      <div className="border-b border-border-subtle px-4 py-2 text-xs text-text-secondary">
        {features.length.toLocaleString()} of {totalCount.toLocaleString()} dams
      </div>
      <div ref={parentRef} className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-bg-elevated">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border-subtle">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="cursor-pointer px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary hover:text-text-secondary"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && (
                        <ChevronUp size={12} aria-hidden="true" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ChevronDown size={12} aria-hidden="true" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <tr style={{ height: `${virtualizer.getVirtualItems()[0]?.start ?? 0}px` }} />
            {virtualizer.getVirtualItems().map((vi) => {
              const row = rows[vi.index];
              if (!row) return null;
              return (
                <tr
                  key={row.id}
                  data-index={vi.index}
                  onClick={() => handleRowClick(row.original)}
                  className={`cursor-pointer border-b border-border-subtle transition-colors hover:bg-bg-hover ${
                    vi.index % 2 === 0 ? "bg-bg-base" : "bg-bg-elevated/50"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-text-secondary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr
              style={{
                height: `${
                  virtualizer.getTotalSize() -
                  (virtualizer.getVirtualItems().at(-1)?.end ?? 0)
                }px`,
              }}
            />
          </tbody>
        </table>
        {features.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="text-text-secondary">No dams match your filters.</p>
            <button onClick={resetFilters} className="text-sm text-accent hover:underline">
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
