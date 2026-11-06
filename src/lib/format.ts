import type { Listing } from "./types";

const nf = new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 2 });

export function currencySymbol(c: string | null | undefined): string {
  if (!c) return "";
  if (c === "EUR") return "€";
  if (c === "CZK") return "Kč";
  if (c === "USD") return "$";
  if (c === "PLN") return "zł";
  if (c === "HUF") return "Ft";
  return c;
}

/** 15000, "CZK" → "15 000 Kč" (nedeliteľné medzery) */
export function formatPrice(n: number | null | undefined, currency: string | null | undefined): string {
  if (n == null) return "Cena neuvedená";
  const sym = currencySymbol(currency);
  return `${nf.format(n).replace(/\s/g, " ")}${sym ? ` ${sym}` : ""}`;
}

export function formatAmount(n: number): string {
  return nf.format(n).replace(/\s/g, " ");
}

/** Parsuje číslo zadané používateľom: "14 000", "14000,50" */
export function parseUserNumber(s: string): number | null {
  const t = s.replace(/\s| /g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${d.getMonth() + 1}.`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${pad(d.getMinutes())}`;
}

/** "dnes 08:12", "včera", "pred 3 dňami", "21. 10. 2026" */
export function relativeTime(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days <= 0) return `dnes ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (days === 1) return `včera ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (days < 7) return `pred ${days} dňami`;
  return formatDate(iso);
}

export type ChangeKind = "down" | "up" | "none" | "removed" | "pending" | "unknown";

export interface PriceChange {
  kind: ChangeKind;
  /** rozdiel oproti predchádzajúcej cene */
  diff: number;
  previous: number | null;
  /** celkový rozdiel od pridania */
  totalDiff: number;
  totalPct: number;
  first: number | null;
  lowest: number | null;
  isLowest: boolean;
  changedAt: string | null;
}

export function priceChange(l: Listing): PriceChange {
  const h = l.history;
  const last = h.at(-1);
  const prev = h.length > 1 ? h[h.length - 2] : null;
  const first = h[0]?.price ?? null;
  const lowest = h.length ? Math.min(...h.map((p) => p.price)) : null;
  const diff = last && prev ? last.price - prev.price : 0;
  const totalDiff = last && first != null ? last.price - first : 0;
  const base = {
    diff,
    previous: prev?.price ?? null,
    totalDiff,
    totalPct: first ? Math.round((totalDiff / first) * 100) : 0,
    first,
    lowest,
    isLowest: !!last && h.length > 1 && last.price === lowest && totalDiff < 0,
    changedAt: prev && last ? last.at : null,
  };
  if (l.status === "pending") return { ...base, kind: "pending" };
  if (l.status === "removed") return { ...base, kind: "removed" };
  if (l.price == null) return { ...base, kind: "unknown" };
  if (diff < 0) return { ...base, kind: "down" };
  if (diff > 0) return { ...base, kind: "up" };
  return { ...base, kind: "none" };
}

export function changeLabel(l: Listing, c = priceChange(l)): string {
  if (c.kind === "removed") return "Odstránený";
  if (c.kind === "down") return `↓ ${formatPrice(Math.abs(c.diff), l.currency)}`;
  if (c.kind === "up") return `↑ ${formatPrice(Math.abs(c.diff), l.currency)}`;
  if (c.kind === "pending") return "Načítavame";
  if (c.kind === "unknown") return "Bez ceny";
  return "Bez zmeny";
}

export function chipClass(kind: ChangeKind): string {
  return kind === "down" ? "chip-down" : kind === "up" ? "chip-up" : kind === "removed" ? "chip-off" : "chip-soft";
}

export function targetReached(l: Listing): boolean {
  return l.notify.target != null && l.price != null && l.status === "active" && l.price <= l.notify.target;
}
