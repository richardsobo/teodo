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

/** Schodový graf ceny – cena platí, kým sa nezmení. */
export function PriceChart({ history, currency, target, until, compact }: Props) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const [now] = useState(() => Date.now());
  const W = compact ? 350 : 640;
  const H = compact ? 130 : 210;
  const left = compact ? 8 : 56;
  const right = W - (compact ? 10 : 20);
  const top = 16;
  const bottom = H - 30;

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
    const pad = (max - min) * 0.12;
    min -= pad;
    max += pad;
    const x = (t: number) => left + ((t - start) / span) * (right - left);
    const y = (p: number) => top + (1 - (p - min) / (max - min)) * (bottom - top);
    const pts = history.map((p, i) => ({ x: x(new Date(p.at).getTime()), y: y(p.price), p, diff: i > 0 ? p.price - history[i - 1].price : 0 }));
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += `H${pts[i].x}V${pts[i].y}`;
    d += `H${right}`;
    const area = `${d}V${bottom}H${pts[0].x}Z`;
    const hi = Math.max(...history.map((p) => p.price));
    const lo = Math.min(...history.map((p) => p.price));
    return { pts, d, area, y, start, end, hi, lo };
  }, [history, target, until, now, left, right, bottom]);

  const first = history[0];
  const last = history.at(-1)!;
  const label = `Graf ceny: od ${formatPrice(first.price, currency)} (${formatShortDate(first.at)}) po ${formatPrice(last.price, currency)}${target != null ? `, cieľová cena ${formatPrice(target, currency)}` : ""}`;
  const h = hover != null ? m.pts[hover] : null;
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let idx = 0;
    m.pts.forEach((p, i) => {
      if (p.x <= px + 6) idx = i;
    });
    setHover(idx);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`a${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A63DB" stopOpacity=".35" />
            <stop offset="1" stopColor="#2A63DB" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`c${gid}`}>
            <rect x="0" y="0" width={W} height={H} className="chart-reveal" />
          </clipPath>
        </defs>
        <g stroke="rgba(255,255,255,.07)">
          <path d={`M${left} ${m.y(m.hi)}H${right}M${left} ${m.y(m.lo)}H${right}`} />
        </g>
        {target != null && (
          <g>
            <path d={`M${left} ${m.y(target)}H${right}`} stroke="#4D7FEE" strokeWidth="1.5" strokeDasharray="5 5" />
            {compact ? (
              <text x={left + 2} y={m.y(target) - 5} fill="#6E96F2" fontSize="11" fontWeight="600" fontFamily="inherit">
                Cieľ {formatAmount(target)}
              </text>
            ) : (
              <text x="0" y={m.y(target) + 4} fill="#4D7FEE" fontSize="12" fontWeight="600" fontFamily="inherit">
                {formatAmount(target)}
              </text>
            )}
          </g>
        )}
        {!compact && (
          <g fill="#858DA0" fontSize="12" fontFamily="inherit">
            <text x="0" y={m.y(m.hi) + 4}>
              {formatAmount(m.hi)}
            </text>
            {m.lo !== m.hi && (
              <text x="0" y={m.y(m.lo) + 4}>
                {formatAmount(m.lo)}
              </text>
            )}
          </g>
        )}
        <g fill="#858DA0" fontSize={compact ? 11 : 12} fontFamily="inherit">
          <text x={m.pts[0].x} y={H - 8}>
            {formatShortDate(first.at)}
          </text>
          <text x={right} y={H - 8} textAnchor="end">
            {until ? formatShortDate(until) : "dnes"}
          </text>
        </g>
        {h && <path d={`M${h.x} ${top - 6}V${bottom}`} stroke="rgba(255,255,255,.2)" strokeDasharray="2 3" />}
        <g clipPath={`url(#c${gid})`}>
          <path d={m.area} fill={`url(#a${gid})`} />
          <path d={m.d} fill="none" stroke="#4D7FEE" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        {m.pts.map((p, i) => {
          const isLast = i === m.pts.length - 1;
          return (
            <g key={p.p.at}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isLast ? 6 : 4.5}
                fill={isLast ? "#4D7FEE" : "#1C1F28"}
                stroke={isLast ? "#1C1F28" : "#4D7FEE"}
                strokeWidth={isLast ? 3 : 2}
                className="chart-dot"
                style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              />
            </g>
          );
        })}
        {/* sledovanie kurzora / prsta: platí cena posledného bodu naľavo */}
        <rect
          x={left}
          y="0"
          width={right - left}
          height={H}
          fill="transparent"
          style={{ touchAction: "pan-y" }}
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {h && (
        <div className="pop chart-tip" style={{ left: `${(h.x / W) * 100}%`, top: `${(h.y / H) * 100}%` }}>
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
