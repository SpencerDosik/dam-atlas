import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatHeight(feet: number | null): string {
  if (feet === null) return "—";
  return `${feet.toLocaleString()} ft`;
}

export function formatStorage(acFt: number | null): string {
  if (acFt === null) return "—";
  if (acFt >= 1_000_000) return `${(acFt / 1_000_000).toFixed(1)} M af`;
  if (acFt >= 1_000) return `${(acFt / 1_000).toFixed(1)} K af`;
  return `${acFt.toLocaleString()} af`;
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  try {
    return format(parseISO(isoDate), "MMMM d, yyyy");
  } catch {
    return isoDate;
  }
}

export function formatRelativeDate(isoDate: string | null): string {
  if (!isoDate) return "";
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return "";
  }
}

export function formatNumber(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString();
}

export function formatArea(sqMiles: number | null): string {
  if (sqMiles === null) return "—";
  return `${sqMiles.toLocaleString()} sq mi`;
}
