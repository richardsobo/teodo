"use client";

import { useId, useMemo, useState } from "react";
import { formatAmount, formatPrice, formatShortDate } from "@/lib/format";
import type { PricePoint } from "@/lib/types";

interface Props {
  history: PricePoint[];
  currency: string;
  target: number | null;
  /** do kedy kresliť poslednú cenu (odstránený inzerát končí dňom zmazania) */
  until?: string;
  compact?: boolean;
}

/** Súhrn nad grafom: cena pri pridaní, najnižšia a aktuálna. */
export function PriceSummary({ history, currency, removed }: { history: PricePoint[]; currency: string; removed?: boolean }) {
  const first = history[0].price;
  const last = history.at(-1)!.price;
  const lowest = Math.min(...history.map((p) => p.price));
  const cells: Array<[string, number, string?]> = [
    ["Pri pridaní", first],
    ["Najnižšia", lowest],
    [removed ? "Posledná" : "Teraz", last, last < first ? "var(--mint-text)" : last > first ? "var(--peach-text)" : undefined],
  ];
  return (
    <div className="price-summary">
      {cells.map(([label, value, color]) => (
        <div key={label}>
          <span className="faint">{label}</span>
          <strong className="num" style={{ color }}>
            {formatPrice(value, currency)}
          </strong>
        </div>
      ))}
    </div>
  );
}

/**
 * Schodový graf ceny – cena platí, kým sa nezmení.
 * Každá zmena má pri sebe cenu a dátum, aktuálna cena je zvýraznená.
 */
export function PriceChart({ history, currency, target, until, compact }: Props) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const [now] = useState(() => Date.now());
  const W = compact ? 350 : 640;
  const H = compact ? 176 : 224;
  const left = 10;
  const right = W - 10;
  const top = 34;
  const bottom = H - 34;
  const fs = compact ? 11 : 12;

  const m = useMemo(() => {
    const end = until ? new Date(until).getTime() : now;
    const start = new Date(history[0].at).getTime();
    const span = Math.max(end - start, 86_400_000);
    const prices = history.map((p) => p.price).concat(target != null ? [target] : []);
    let min = Math.min(...prices);
    let max = Math.max(...prices);
    if (min === max) {
      min -= Math.max(1, min * 0.05);
      max += Math.max(1, max * 0.05);
    }
    const pad = (max - min) * 0.08;
    min -= pad;
    max += pad;
    // body držíme kúsok od okrajov, aby sa zmestili popisky
    const inset = compact ? 24 : 34;
    const x = (t: number) => left + inset + ((t - start) / span) * (right - left - inset * 2);
    const y = (p: number) => top + (1 - (p - min) / (max - min)) * (bottom - top);
    const pts = history.map((p, i) => ({
      x: x(new Date(p.at).getTime()),
      y: y(p.price),
      p,
      diff: i > 0 ? p.price - history[i - 1].price : 0,
    }));
    let d = `M${left} ${pts[0].y}H${pts[0].x}`;
    for (let i = 1; i < pts.length; i++) d += `H${pts[i].x}V${pts[i].y}`;
    d += `H${right}`;
    const area = `${d}V${bottom}H${left}Z`;

    // popisky: posledný vždy, ostatné len ak sa neprekrývajú
    const minGap = compact ? 58 : 76;
    const labeled = new Set<number>([pts.length - 1]);
    let lastX = pts.at(-1)!.x;
    for (let i = pts.length - 2; i >= 0; i--) {
      if (lastX - pts[i].x >= minGap) {
        labeled.add(i);
        lastX = pts[i].x;
      }
    }
    return { pts, d, area, y, labeled };
  }, [history, target, until, now, compact, left, right, top, bottom]);

  const last = m.pts.length - 1;
  const label = `Graf ceny od ${formatPrice(history[0].price, currency)} po ${formatPrice(history.at(-1)!.price, currency)}${
    target != null ? `, cieľová cena ${formatPrice(target, currency)}` : ""
  }`;
  const h = hover != null ? m.pts[hover] : null;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    // aktívny je posledný bod naľavo od kurzora (cena platí, kým sa nezmení)
    let idx = 0;
    m.pts.forEach((p, i) => {
      if (p.x <= px + 6) idx = i;
    });
    setHover(idx);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label} style={{ display: "block", overflow: "visible", fontFamily: "inherit" }}>
        <defs>
          <linearGradient id={`a${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A63DB" stopOpacity=".28" />
            <stop offset="1" stopColor="#2A63DB" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`c${gid}`}>
            <rect x="0" y="0" width={W} height={H} className="chart-reveal" />
          </clipPath>
        </defs>

        {/* základná čiara */}
        <path d={`M${left} ${bottom}H${right}`} stroke="rgba(255,255,255,.08)" />

        {/* cieľová cena */}
        {target != null && (
          <g>
            <path d={`M${left} ${m.y(target)}H${right}`} stroke="#4D7FEE" strokeOpacity=".7" strokeWidth="1.25" strokeDasharray="4 5" />
            <text x={left + 2} y={m.y(target) - 6} fill="#6E96F2" fontSize={fs} fontWeight="600">
              Cieľ {formatAmount(target)}
            </text>
          </g>
        )}

        {/* hover: zvislá čiara */}
        {h && <path d={`M${h.x} ${top - 8}V${bottom}`} stroke="rgba(255,255,255,.18)" strokeDasharray="2 3" />}

        <g clipPath={`url(#c${gid})`}>
          <path d={m.area} fill={`url(#a${gid})`} />
          <path d={m.d} fill="none" stroke="#4D7FEE" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </g>

        {m.pts.map((p, i) => {
          const isLast = i === last;
          const show = m.labeled.has(i);
          const text = formatAmount(p.p.price);
          const pillW = text.length * (fs * 0.62) + 16;
          const pillX = Math.min(Math.max(p.x, left + pillW / 2), right - pillW / 2);
          return (
            <g key={p.p.at} className="chart-dot" style={{ animationDelay: `${0.25 + i * 0.08}s` }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isLast ? 5.5 : 4}
                fill={isLast ? "#4D7FEE" : "#1C1F28"}
                stroke={isLast ? "#fff" : "#4D7FEE"}
                strokeWidth={isLast ? 2 : 2}
              />
              {show &&
                (isLast ? (
                  <g>
                    <rect x={pillX - pillW / 2} y={p.y - 30} width={pillW} height={20} rx={10} fill="#2A63DB" />
                    <text x={pillX} y={p.y - 16} textAnchor="middle" fill="#fff" fontSize={fs} fontWeight="700">
                      {text}
                    </text>
                  </g>
                ) : (
                  <text x={p.x + 8} y={p.y - 9} fill="#C9CFDB" fontSize={fs} fontWeight="600">
                    {text}
                  </text>
                ))}
              {show && (
                <text x={p.x} y={H - 10} textAnchor="middle" fill="#858DA0" fontSize={fs}>
                  {formatShortDate(p.p.at)}
                </text>
              )}
              {show && <path d={`M${p.x} ${bottom}v4`} stroke="rgba(255,255,255,.18)" />}
            </g>
          );
        })}

        {/* plocha na sledovanie kurzora / prsta */}
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
          style={{ touchAction: "pan-y" }}
        />
      </svg>

      {h && (
        <div className="pop chart-tip" style={{ left: `${(h.x / W) * 100}%`, top: `${((h.y - 34) / H) * 100}%` }}>
          <strong className="num">{formatPrice(h.p.price, currency)}</strong>
          {h.diff !== 0 && (
            <span className={`num ${h.diff < 0 ? "t-down" : "t-up"}`}>
              {h.diff < 0 ? "↓" : "↑"} {formatPrice(Math.abs(h.diff), currency)}
            </span>
          )}
          <span className="faint">{formatShortDate(h.p.at)}</span>
        </div>
      )}
    </div>
  );
}
