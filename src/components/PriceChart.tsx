"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { formatDate, formatPrice, formatShortDate } from "@/lib/format";
import type { PricePoint } from "@/lib/types";

interface Props {
  history: PricePoint[];
  currency: string;
  target: number | null;
  /** do kedy kresliť poslednú cenu (odstránený inzerát končí dňom zmazania) */
  until?: string;
}

const H = 230;
const TOP = 18;
const BOTTOM = 34; // miesto na dátumy
const FONT = 12;

/** „Pekné“ hodnoty na osi cien (napr. po 500 alebo 1 000). */
function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

/**
 * Graf vývoja ceny. Kreslí sa v skutočnej šírke (nie zmenšením), takže písmo
 * je rovnako čitateľné na mobile aj na počítači. Cena platí, kým sa nezmení
 * (schodová čiara). Bod sa dá vybrať myšou aj ťuknutím.
 */
export function PriceChart({ history, currency, target, until }: Props) {
  const gid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const m = useMemo(() => {
    if (!W) return null;
    const start = new Date(history[0].at).getTime();
    const end = Math.max(until ? new Date(until).getTime() : now, start + 86_400_000);
    const values = history.map((p) => p.price).concat(target != null ? [target] : []);
    const ticks = niceTicks(Math.min(...values), Math.max(...values), 4);
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    // šírka popisov osi podľa najdlhšej ceny
    const labelW = Math.max(...ticks.map((t) => formatPrice(t, currency).length)) * FONT * 0.58 + 10;
    const left = labelW;
    const right = W - 14;
    const x = (t: number) => left + 8 + ((t - start) / (end - start)) * (right - left - 16);
    const y = (v: number) => TOP + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - TOP - BOTTOM);
    const pts = history.map((p, i) => ({ x: x(new Date(p.at).getTime()), y: y(p.price), p, diff: i ? p.price - history[i - 1].price : 0 }));
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += `H${pts[i].x}V${pts[i].y}`;
    const endX = x(end);
    d += `H${endX}`;
    const area = `${d}V${H - BOTTOM}H${pts[0].x}Z`;
    // dátumy na osi: rovnomerne, 3 na mobile, 4 inak
    const n = W < 480 ? 3 : 4;
    const dates = Array.from({ length: n }, (_, i) => start + ((end - start) * i) / (n - 1)).map((t, i) => ({
      x: x(t),
      text: i === n - 1 && !until ? "dnes" : formatShortDate(new Date(t).toISOString()),
    }));
    return { ticks, y, pts, d, area, left, right, endX, dates };
  }, [W, history, target, until, now, currency]);

  const label = `Vývoj ceny od ${formatPrice(history[0].price, currency)} po ${formatPrice(history.at(-1)!.price, currency)}${
    target != null ? `, cieľová cena ${formatPrice(target, currency)}` : ""
  }`;

  const pick = (clientX: number, rect: DOMRect) => {
    if (!m) return null;
    const px = clientX - rect.left;
    let idx = 0;
    m.pts.forEach((p, i) => {
      if (p.x <= px + 10) idx = i;
    });
    return idx;
  };

  const a = m && active != null ? m.pts[active] : null;
  const tipLeft = a ? a.x > W / 2 : false;

  return (
    <div ref={box} className="price-chart" style={{ height: H }}>
      {m && (
        <>
          <svg width={W} height={H} role="img" aria-label={label} style={{ display: "block", fontFamily: "inherit", overflow: "visible" }}>
            <defs>
              <linearGradient id={`a${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2A63DB" stopOpacity=".26" />
                <stop offset="1" stopColor="#2A63DB" stopOpacity="0" />
              </linearGradient>
              <clipPath id={`c${gid}`}>
                <rect x="0" y="0" width={W} height={H} className="chart-reveal" />
              </clipPath>
            </defs>

            {/* os cien */}
            {m.ticks.map((t) => (
              <g key={t}>
                <path d={`M${m.left} ${m.y(t)}H${m.right}`} stroke="rgba(255,255,255,.07)" />
                <text x={m.left - 8} y={m.y(t) + 4} textAnchor="end" fill="#858DA0" fontSize={FONT} className="num">
                  {formatPrice(t, currency)}
                </text>
              </g>
            ))}

            {/* os dátumov */}
            {m.dates.map((d, i) => (
              <g key={i}>
                <path d={`M${d.x} ${H - BOTTOM}v5`} stroke="rgba(255,255,255,.2)" />
                <text
                  x={d.x}
                  y={H - 12}
                  textAnchor={i === 0 ? "start" : i === m.dates.length - 1 ? "end" : "middle"}
                  dx={i === 0 ? -4 : i === m.dates.length - 1 ? 4 : 0}
                  fill="#858DA0"
                  fontSize={FONT}
                >
                  {d.text}
                </text>
              </g>
            ))}

            {/* cieľová cena */}
            {target != null && (
              <g>
                <path d={`M${m.left} ${m.y(target)}H${m.right}`} stroke="#4D7FEE" strokeOpacity=".8" strokeWidth="1.25" strokeDasharray="4 5" />
                <text x={m.right} y={m.y(target) - 6} textAnchor="end" fill="#6E96F2" fontSize={FONT} fontWeight="600">
                  Cieľ {formatPrice(target, currency)}
                </text>
              </g>
            )}

            {a && <path d={`M${a.x} ${TOP - 6}V${H - BOTTOM}`} stroke="rgba(255,255,255,.28)" strokeDasharray="3 3" />}

            <g clipPath={`url(#c${gid})`}>
              <path d={m.area} fill={`url(#a${gid})`} />
              <path d={m.d} fill="none" stroke="#4D7FEE" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </g>

            {m.pts.map((p, i) => {
              const on = i === active;
              const isLast = i === m.pts.length - 1;
              return (
                <circle
                  key={p.p.at}
                  cx={p.x}
                  cy={p.y}
                  r={on ? 7 : isLast ? 5.5 : 4.5}
                  fill={on || isLast ? "#4D7FEE" : "#1C1F28"}
                  stroke={on || isLast ? "#fff" : "#4D7FEE"}
                  strokeWidth="2"
                  className="chart-dot"
                  style={{ animationDelay: `${0.25 + i * 0.08}s`, transition: "r .15s" }}
                />
              );
            })}

            {/* výber bodu: myš (pohyb) aj prst (ťuknutie) */}
            <rect
              x={m.left}
              y="0"
              width={m.right - m.left}
              height={H}
              fill="transparent"
              style={{ cursor: "pointer", touchAction: "pan-y" }}
              onPointerMove={(e) => e.pointerType === "mouse" && setActive(pick(e.clientX, e.currentTarget.ownerSVGElement!.getBoundingClientRect()))}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
              onPointerDown={(e) => {
                if (e.pointerType === "mouse") return;
                const i = pick(e.clientX, e.currentTarget.ownerSVGElement!.getBoundingClientRect());
                setActive((cur) => (cur === i ? null : i));
              }}
            />
          </svg>

          {a && (
            <div
              className="pop chart-card"
              style={{
                top: TOP,
                ...(tipLeft ? { right: W - a.x + 14 } : { left: a.x + 14 }),
              }}
            >
              <span className="faint" style={{ fontSize: 12 }}>
                {formatDate(a.p.at)}
                {active === 0 && " · pridané"}
              </span>
              <strong className="num" style={{ fontSize: 16 }}>
                {formatPrice(a.p.price, currency)}
              </strong>
              {a.diff !== 0 && (
                <span className={`num ${a.diff < 0 ? "t-down" : "t-up"}`} style={{ fontSize: 13, fontWeight: 600 }}>
                  {a.diff < 0 ? "↓" : "↑"} {formatPrice(Math.abs(a.diff), currency)}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
