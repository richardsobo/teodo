"use client";

import Link from "next/link";
import { Img } from "./ui";
import { Icon } from "./Icon";
import { changeLabel, chipClass, formatPrice, priceChange, targetReached } from "@/lib/format";
import type { Listing } from "@/lib/types";

function Chips({ l }: { l: Listing }) {
  const c = priceChange(l);
  const reached = targetReached(l);
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {c.kind === "none" ? null : c.kind === "unknown" ? (
        <span className="chip chip-soft">Bez ceny</span>
      ) : c.kind === "pending" ? null : (
        <span className={`chip ${chipClass(c.kind)}`}>{changeLabel(l, c)}</span>
      )}
      {reached && <span className="chip chip-target">Cieľ dosiahnutý</span>}
      {l.source.support === "manual" && l.status === "active" && <span className="chip chip-soft">Ručne</span>}
      {l.checkError && l.status === "active" && (
        <span className="chip chip-warn" title={l.checkError}>
          <Icon name="alert" size="s" style={{ width: 12, height: 12 }} />
          Kontrola zlyhala
        </span>
      )}
    </div>
  );
}

function TargetLine({ l }: { l: Listing }) {
  if (l.notify.target == null || targetReached(l) || l.status !== "active") return null;
  return (
    <div className="faint num" style={{ fontSize: 12.5, marginTop: 4 }}>
      Cieľ {formatPrice(l.notify.target, l.currency)}
    </div>
  );
}

/** Karta do mriežky (desktop, tablet). */
export function ListingCard({ l, isNew }: { l: Listing; isNew: boolean }) {
  const c = priceChange(l);
  const dim = l.status === "removed";
  if (l.status === "pending") {
    return (
      <Link className="card" href={`/inzerat/${l.id}`} style={{ border: "1px dashed rgba(255,255,255,.12)", background: "transparent" }} scroll={false}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            paddingBottom: 40,
          }}
        >
          <span className="spinner" />
          <span className="faint" style={{ fontSize: 13 }}>
            Načítavame údaje…
          </span>
        </div>
        <div className="meta" style={{ background: "none" }}>
          <div className="title" style={{ color: "var(--muted)" }}>
            {l.title}
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link className={`card${dim ? " removed" : ""}${isNew ? " is-new" : ""}`} href={`/inzerat/${l.id}`} scroll={false}>
      {isNew && <span className="new-dot" aria-label="Nová zmena" />}
      <Img src={l.images[0]} alt={l.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div className="meta">
        <div style={{ marginBottom: 8 }}>
          <Chips l={l} />
        </div>
        <div className="title">{l.title}</div>
        <div className="row">
          <span className="price">{formatPrice(l.price, l.currency)}</span>
          {(c.kind === "down" || c.kind === "up") && c.previous != null && (
            <span className="old num" style={{ fontSize: 13 }}>
              {formatPrice(c.previous, l.currency)}
            </span>
          )}
        </div>
        <TargetLine l={l} />
      </div>
    </Link>
  );
}
