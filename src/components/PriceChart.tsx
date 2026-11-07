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

const FULL_H = 230;
const FLAT_H = 96; // cena sa ešte nemenila a nie je cieľ – stačí nízky pás
const TOP = 18;
const BOTTOM = 34; // miesto na dátumy
const FONT = 12;

/**
 * Graf vývoja ceny (desktop). Kreslí sa v skutočnej šírke, takže písmo
 * ostáva čitateľné. Na osiach sú len skutočné ceny a dátumy zmien,
 * cieľová cena je modrou na osi cien. Cena platí, kým sa nezmení (schodová čiara).
 */
export function PriceChart({ history, currency, target, until }: Props) {
  const gid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [now] = useState(() => Date.now());
  const flat = target == null && new Set(history.map((p) => p.price)).size === 1;
  const H = flat ? FLAT_H : FULL_H;

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
    let yMin = Math.min(...values);
    let yMax = Math.max(...values);
    const pad = (yMax - yMin || yMax * 0.1 || 1) * 0.12;
    yMin -= pad;
    yMax += pad;
    const y = (v: number) => (flat ? TOP + 12 : TOP + (1 - (v - yMin) / (yMax - yMin)) * (H - TOP - BOTTOM));

    // os cien: len skutočné ceny (+ cieľ modrou), bez prekrývania; prednosť má cieľ, aktuálna a prvá cena
    const ticks: Array<{ v: number; target?: boolean }> = target != null ? [{ v: target, target: true }] : [];
    for (const v of [history.at(-1)!.price, history[0].price, ...history.map((p) => p.price)]) {
      if (ticks.some((t) => !t.target && t.v === v)) continue;
      if (ticks.some((t) => Math.abs(y(t.v) - y(v)) < 16)) continue;
      ticks.push({ v });
    }

    const left = Math.max(...ticks.map((t) => formatPrice(t.v, currency).length)) * FONT * 0.58 + 12;
    const right = W - 14;
    const x = (t: number) => left + 10 + ((t - start) / (end - start)) * (right - left - 20);
    const pts = history.map((p, i) => ({ x: x(new Date(p.at).getTime()), y: y(p.price), p, diff: i ? p.price - history[i - 1].price : 0 }));
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += `H${pts[i].x}V${pts[i].y}`;
    d += `H${x(end)}`;
    const area = `${d}V${H - BOTTOM}H${pts[0].x}Z`;

    // os dátumov: len dátumy zmien, bez prekrývania (prednosť má najnovší a prvý)
    const dateIdx: number[] = [];
    for (const i of [pts.length - 1, 0, ...pts.map((_, k) => k)]) {
      if (dateIdx.includes(i)) continue;
      if (dateIdx.some((k) => Math.abs(pts[k].x - pts[i].x) < 58)) continue;
      dateIdx.push(i);
    }
    const dates = dateIdx.map((i) => ({ x: pts[i].x, text: formatShortDate(pts[i].p.at) }));

    return { ticks, y, pts, d, area, left, right, dates };
  }, [W, history, target, until, now, currency, flat, H]);

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

            {m.ticks.map((t) => (
              <g key={`${t.v}-${t.target ? "t" : "p"}`}>
                {!t.target && <path d={`M${m.left} ${m.y(t.v)}H${m.right}`} stroke="rgba(255,255,255,.07)" />}
                <text
                  x={m.left - 8}
                  y={m.y(t.v) + 4}
                  textAnchor="end"
                  fill={t.target ? "#6E96F2" : "#858DA0"}
                  fontSize={FONT}
                  fontWeight={t.target ? 600 : 400}
                  className="num"
                >
                  {formatPrice(t.v, currency)}
                </text>
              </g>
            ))}

            {m.dates.map((d) => (
              <g key={d.x}>
                <path d={`M${d.x} ${H - BOTTOM}v5`} stroke="rgba(255,255,255,.2)" />
                <text x={d.x} y={H - 12} textAnchor="middle" fill="#858DA0" fontSize={FONT}>
                  {d.text}
                </text>
              </g>
            ))}

            {target != null && <path d={`M${m.left} ${m.y(target)}H${m.right}`} stroke="#4D7FEE" strokeOpacity=".8" strokeWidth="1.25" strokeDasharray="4 5" />}

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
            <div className="pop chart-card" style={{ top: TOP, ...(tipLeft ? { right: W - a.x + 14 } : { left: a.x + 14 }) }}>
              <span className="faint" style={{ fontSize: 12 }}>
                {formatDate(a.p.at)}
                {active === 0 && " · pridané"}
                {a.p.manual && " · upravené ručne"}
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
