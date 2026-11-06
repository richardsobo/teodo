"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice, relativeTime } from "@/lib/format";
import type { AppNotification, Listing } from "@/lib/types";
import { Img } from "./ui";

export function shortTitle(t: string): string {
  const base = t.split(",")[0];
  const words = base.split(/\s+/);
  return words.length > 4 ? words.slice(0, 4).join(" ") : base;
}

const KIND_TEXT: Record<AppNotification["kind"], string> = {
  target: "Dosiahol cieľovú cenu",
  down: "Cena klesla",
  up: "Cena stúpla",
  removed: "Inzerát bol odstránený",
};

export function NotificationsList({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const { notifications, listings, markRead, settings } = useStore();
  const items = notifications
    .filter((n) => settings.notifyIncrease || n.kind !== "up")
    .map((n) => ({ n, l: listings.find((l) => l.id === n.listingId) }))
    .filter((x): x is { n: AppNotification; l: Listing } => !!x.l);

  if (!items.length) {
    return (
      <div style={{ padding: compact ? "28px 16px" : "56px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <span className="h3">Zatiaľ ticho</span>
        <span className="muted" style={{ fontSize: 14, maxWidth: 300 }}>
          Keď niektorý inzerát zlacnie, zdražie alebo zmizne, uvidíš to tu aj v e-maile.
        </span>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: compact ? 2 : 0 }}>
      {items.map(({ n, l }, i) => {
        const removed = n.kind === "removed";
        return (
          <li key={n.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
            <Link
              href={`/inzerat/${l.id}`}
              onClick={() => {
                markRead(n.id);
                onNavigate?.();
              }}
              style={{
                display: "flex",
                gap: 12,
                padding: compact ? "12px 14px" : "14px 0",
                borderRadius: compact ? 14 : 0,
                background: compact && !n.read ? "rgba(42,99,219,.12)" : undefined,
                borderBottom: compact ? undefined : "1px solid var(--line)",
                color: "inherit",
                textDecoration: "none",
              }}
              className="notif-item"
            >
              <Img
                src={l.images[0]}
                alt=""
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flex: "none", filter: removed ? "grayscale(1)" : undefined }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortTitle(l.title)}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {KIND_TEXT[n.kind]}
                </div>
                {removed ? (
                  <div style={{ marginTop: 6 }}>
                    <span className="chip chip-off">Už nie je dostupný</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                    <span className="num" style={{ fontWeight: 700 }}>
                      {formatPrice(n.price, l.currency)}
                    </span>
                    {n.previous != null && (
                      <span className="old num" style={{ fontSize: 13 }}>
                        {formatPrice(n.previous, l.currency)}
                      </span>
                    )}
                    {n.previous != null && n.price != null && (
                      <span className={`chip ${n.price < n.previous ? "chip-down" : "chip-up"}`}>
                        {n.price < n.previous ? "↓" : "↑"} {formatPrice(Math.abs(n.price - n.previous), l.currency)}
                      </span>
                    )}
                  </div>
                )}
                <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>
                  {relativeTime(n.at)}
                </div>
              </div>
              {!n.read && <span className="dot" style={{ marginTop: 6 }} aria-label="Neprečítané" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
