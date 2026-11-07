"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon";
import { ListingCard, TargetReachedChip } from "./ListingCard";
import { EditListingDialog, NotifySettings } from "./ListingDialogs";
import { PriceChart } from "./PriceChart";
import { Dialog, Img, Popover, useEscape, useIsMobile, useScrollLock } from "./ui";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-state";
import { formatDate, formatPrice, formatTime, priceChange, relativeTime, targetReached } from "@/lib/format";
import { nextCheckTime } from "@/lib/schedule";
import type { Listing } from "@/lib/types";

export function DetailPanel({ id }: { id: string }) {
  const store = useStore();
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const l = store.listings.find((x) => x.id === id);

  useScrollLock(!closing);
  const close = () => setClosing(true);
  useEscape(!closing, close);

  const markSeen = store.markSeen;
  const isNew = l ? store.isNew(l) : false;
  useEffect(() => {
    if (isNew) markSeen(id);
  }, [id, isNew, markSeen]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 55 }}>
      <motion.div
        className="scrim"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        onClick={close}
      />
      <motion.aside
        className="float detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="d-title"
        initial={{ x: "100%" }}
        animate={{ x: closing ? "100%" : 0 }}
        transition={{ type: "spring", damping: 34, stiffness: 300, mass: 0.9 }}
        onAnimationComplete={() => closing && router.push("/prehlad", { scroll: false })}
      >
        <div className="detail-scroll">{l ? <Detail l={l} onClose={close} /> : <NotFound onClose={close} />}</div>
      </motion.aside>
    </div>
  );
}

function NotFound({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ padding: "96px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
      <h1 id="d-title" className="h1">
        Tento inzerát sme nenašli
      </h1>
      <p className="muted" style={{ margin: 0, maxWidth: 400 }}>
        Možno si ho prestal sledovať, alebo je odkaz neúplný.
      </p>
      <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 8 }}>
        Späť na inzeráty
      </button>
    </div>
  );
}

function Detail({ l, onClose }: { l: Listing; onClose: () => void }) {
  const store = useStore();
  const ui = useUI();
  const mobile = useIsMobile();
  const [panel, setPanel] = useState<"" | "bell" | "edit">("");
  const topRef = useRef<HTMLDivElement>(null);
  const [topScrolled, setTopScrolled] = useState(false);

  // lišta hore dostane sklo pri scrollovaní; fotka sa na mobile jemne posúva pod ňu
  useEffect(() => {
    const sc = topRef.current?.closest(".detail-scroll") as HTMLElement | null;
    if (!sc) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = sc.scrollTop;
        setTopScrolled(y > 12);
        sc.style.setProperty("--py", `${Math.min(y, 400) * 0.35}px`);
      });
    };
    sc.addEventListener("scroll", on, { passive: true });
    return () => {
      sc.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  const c = priceChange(l);
  const category = store.categories.find((x) => x.id === l.categoryId);
  const reached = targetReached(l);
  const removed = l.status === "removed";
  const others = store.listings.filter((x) => x.id !== l.id && x.categoryId === l.categoryId && l.categoryId).slice(0, 4);
  const notifyOn = l.notify.onChange || l.notify.target != null;

  const notices = (
    <>
      {(removed || l.checkError || l.source.support === "manual" || l.status === "pending") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {removed && (
            <div className="notice notice-gray">
              <span className="chip chip-off">Odstránený</span>
              <span className="muted" style={{ flex: 1 }}>
                Inzerát zmizol {formatDate(l.removedAt!)}. Poslednú cenu, fotky aj históriu sme ti uchovali. Ak ho predajca pridal znova, vlož nový odkaz v
                úprave.
              </span>
            </div>
          )}
          {l.checkError && !removed && (
            <div className="notice notice-warn">
              <Icon name="alert" size="s" style={{ color: "var(--peach-text)", marginTop: 2 }} />
              <span className="muted" style={{ flex: 1 }}>
                {l.checkError} Skúsime to znova pri ďalšej kontrole o {formatTime(nextCheckTime().toISOString())}. Zobrazujeme poslednú známu cenu z{" "}
                {l.lastCheckedAt ? relativeTime(l.lastCheckedAt) : "pridania"}.
              </span>
            </div>
          )}
          {l.source.support === "manual" && (
            <div className="notice notice-blue">
              <Icon name="edit" size="s" style={{ color: "var(--link)", marginTop: 2 }} />
              <span className="muted" style={{ flex: 1 }}>
                Cenu tohto inzerátu zatiaľ nevieme sledovať automaticky. Keď sa zmení, uprav ju a zapíšeme ju do histórie.
              </span>
            </div>
          )}
          {l.status === "pending" && (
            <div className="notice notice-blue" style={{ alignItems: "center" }}>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              <span className="muted">Načítavame údaje inzerátu. Zvyčajne to trvá pár sekúnd.</span>
            </div>
          )}
        </div>
      )}
    </>
  );

  const top = (
    <div className={`detail-top${topScrolled ? " scrolled" : ""}`} ref={topRef}>
      {mobile ? (
        <button className="btn btn-icon photo-btn" onClick={onClose} aria-label="Späť na inzeráty" style={{ width: 40, height: 40 }}>
          <Icon name="back" size="s" />
        </button>
      ) : (
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginLeft: -10 }}>
          <Icon name="back" size="s" />
          Späť na inzeráty
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 4, position: "relative" }}>
        <>
          <button
            className={`btn btn-icon ${mobile ? "photo-btn" : "btn-ghost"}`}
            data-popover-trigger
            aria-label={notifyOn ? "Upozornenia sú zapnuté" : "Upozornenia sú vypnuté"}
            title={notifyOn ? "Upozornenia sú zapnuté" : "Upozornenia sú vypnuté"}
            aria-expanded={panel === "bell"}
            onClick={() => setPanel((p) => (p === "bell" ? "" : "bell"))}
            style={{ width: 40, height: 40 }}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <Icon name="bell" />
              {notifyOn && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: -5,
                    top: -4,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "var(--blue)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </span>
              )}
            </span>
          </button>
        </>
        <button
          className={`btn btn-icon ${mobile ? "photo-btn" : "btn-ghost"}`}
          aria-label="Upraviť inzerát"
          onClick={() => setPanel("edit")}
          style={{ width: 40, height: 40 }}
        >
          <Icon name="edit" size={mobile ? "s" : undefined} />
        </button>
        <Popover
          open={!mobile && panel === "bell"}
          onClose={() => setPanel("")}
          label="Upozornenia pre tento inzerát"
          className="pop"
          style={{ top: 50, right: 0, width: 340, borderRadius: 18, padding: 18 }}
        >
          <span className="h3" style={{ display: "block", fontSize: 16, marginBottom: 16 }}>
            Upozornenia pre tento inzerát
          </span>
          <NotifySettings l={l} />
        </Popover>
      </div>
    </div>
  );

  return (
    <>
      {top}
      <div className="detail-body">
        {!mobile && notices}

        <div className="detail-cols">
          <Gallery images={l.images} title={l.title} dim={removed} />

          <div className="detail-info">
            {mobile && notices}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="faint" style={{ fontSize: 13 }}>
                {category ? (
                  <Link href="/prehlad" scroll={false} onClick={() => ui.setCategory(category.id)} style={{ fontWeight: 600 }}>
                    {category.name}
                  </Link>
                ) : (
                  "Bez kategórie"
                )}
                {l.location && ` · ${l.location}`}
              </span>
              <h1 id="d-title" style={{ margin: 0, fontSize: mobile ? 20 : 24, fontWeight: 400, lineHeight: 1.3, letterSpacing: "-.01em" }}>
                {l.title}
              </h1>
            </div>

            {l.status !== "pending" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <span className="num" style={{ fontSize: mobile ? 28 : 32, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1 }}>
                    {formatPrice(l.price, l.currency)}
                  </span>
                  {c.first != null && c.totalDiff !== 0 && (
                    <span className="old num" style={{ fontSize: 15, lineHeight: 1, paddingTop: 2 }}>
                      {formatPrice(c.first, l.currency)}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {removed ? (
                    <span className="chip chip-off">Odstránený</span>
                  ) : c.totalDiff !== 0 ? (
                    <span className={`chip ${c.totalDiff < 0 ? "chip-down" : "chip-up"}`}>
                      {c.totalDiff < 0 ? "↓" : "↑"} {formatPrice(Math.abs(c.totalDiff), l.currency)}
                    </span>
                  ) : (
                    l.history.length > 0 && <span className="chip chip-soft">Bez zmeny od pridania</span>
                  )}
                  {reached && <TargetReachedChip />}
                </div>
              </div>
            )}

            <a className="btn btn-primary detail-cta" href={l.url} target="_blank" rel="noopener noreferrer">
              <Icon name="external" size="s" />
              Zobraziť inzerát
            </a>
            <div className="detail-cta-fade only-mobile" aria-hidden="true" />

            {l.history.length > 0 && (
              <section style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <h2 className="h2">Vývoj ceny</h2>
                  {!removed && l.price != null && (
                    <span style={{ fontSize: 13, display: "inline-flex", gap: 6, alignItems: "baseline" }}>
                      {l.notify.target != null && (
                        <span className="muted num">
                          Cieľ {formatPrice(l.notify.target, l.currency)}
                          {l.price > l.notify.target && ` · chýba ${formatPrice(l.price - l.notify.target, l.currency)}`}
                        </span>
                      )}
                      <button className="link" data-popover-trigger onClick={() => setPanel("bell")} style={{ fontSize: 13 }}>
                        {l.notify.target != null ? "Zmeniť" : "Nastaviť cieľovú cenu"}
                      </button>
                    </span>
                  )}
                </div>
                {mobile ? (
                  <History l={l} />
                ) : (
                  <PriceChart history={l.history} currency={l.currency} target={removed ? null : l.notify.target} until={l.removedAt} />
                )}
                <span className="faint" style={{ fontSize: 12.5, marginTop: -4 }}>
                  {l.lastCheckedAt
                    ? `Naposledy skontrolované ${relativeTime(l.lastCheckedAt)}`
                    : l.source.support === "manual"
                      ? "Cenu dopĺňaš ručne"
                      : "Ešte nekontrolované"}
                  {!removed && l.source.support !== "manual" && ` · ďalšia kontrola o ${formatTime(nextCheckTime().toISOString())}`}
                </span>
              </section>
            )}

            {l.description && (
              <section className="desc-section">
                <h2 className="h3">Popis</h2>
                <Description text={l.description} />
              </section>
            )}
            <Note l={l} />
          </div>
        </div>

        {others.length > 0 && category && (
          <section className="detail-more others" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="h2">Ďalšie v kategórii {category.name}</h2>
              <Link className="link" href="/prehlad" scroll={false} onClick={() => ui.setCategory(category.id)} style={{ fontSize: 14 }}>
                Zobraziť všetky
              </Link>
            </div>
            <div className="grid others-grid">
              {others.map((o) => (
                <ListingCard key={o.id} l={o} isNew={false} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Dialog open={mobile && panel === "bell"} onClose={() => setPanel("")} title="Upozornenia" z={70}>
        <NotifySettings l={l} onDone={() => setPanel("")} />
      </Dialog>
      <EditListingDialog key={`${l.id}-${panel}`} l={l} open={panel === "edit"} onClose={() => setPanel("")} />
    </>
  );
}

function Gallery({ images, title, dim }: { images: string[]; title: string; dim: boolean }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const n = images.length;
  const go = (d: number) => {
    if (n < 2) return;
    setDir(d);
    setI((x) => (x + d + n) % n);
  };
  return (
    <div className="detail-gallery">
      <div
        className="gallery-main"
        tabIndex={n > 1 ? 0 : -1}
        aria-roledescription="galéria"
        aria-label={`Fotky inzerátu, ${n ? i + 1 : 0} z ${n}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            style={{ position: "absolute", inset: 0 }}
            initial={{ x: `${dir * 100}%`, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: `${dir * -100}%`, opacity: 0.6 }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            drag={n > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
          >
            <Img
              src={images[i]}
              alt={`${title} – fotka ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: dim ? "grayscale(1) brightness(.65)" : undefined, pointerEvents: "none" }}
            />
          </motion.div>
        </AnimatePresence>
        {n > 1 && (
          <>
            <button
              className="btn btn-icon photo-btn only-desktop"
              aria-label="Predchádzajúca fotka"
              onClick={() => go(-1)}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 34, height: 34 }}
            >
              <Icon name="chevronLeft" size="s" />
            </button>
            <button
              className="btn btn-icon photo-btn only-desktop"
              aria-label="Ďalšia fotka"
              onClick={() => go(1)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 34, height: 34 }}
            >
              <Icon name="chevronRight" size="s" />
            </button>
          </>
        )}
        {n > 0 && (
          <span className="chip num" style={{ position: "absolute", right: 12, bottom: 12, background: "rgba(0,0,0,.5)", color: "#fff" }}>
            {i + 1} / {n}
          </span>
        )}
      </div>
    </div>
  );
}

function Description({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  // „clamped“ = zbalené na 2 riadky s trojbodkou; pri zbaľovaní sa zapne až po skončení animácie
  const [clamped, setClamped] = useState(true);
  const [heights, setHeights] = useState<{ two: number; full: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      const prev = el.style.webkitLineClamp;
      el.style.webkitLineClamp = "unset";
      const full = el.scrollHeight;
      el.style.webkitLineClamp = prev;
      setHeights({ two: Math.ceil(lh * 2), full });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
  }, [text]);

  const long = heights ? heights.full > heights.two + 2 : text.length > 160;
  const toggle = () => {
    if (open) setOpen(false);
    else {
      setClamped(false);
      setOpen(true);
    }
  };

  return (
    <div>
      <div
        className="desc-wrap"
        style={{ height: !long || !heights ? "auto" : open ? heights.full : heights.two }}
        onTransitionEnd={() => !open && setClamped(true)}
      >
        <p ref={ref} className={`muted${long && clamped ? " clamp-2" : ""}`} style={{ margin: 0 }}>
          {text}
        </p>
      </div>
      {long && (
        <button className="link desc-toggle" onClick={toggle} aria-expanded={open}>
          {open ? "Skryť popis" : "Zobraziť celý popis"}
          <Icon name="chevronDown" size="s" style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  );
}

function History({ l }: { l: Listing }) {
  const rows = [...l.history].reverse();
  return (
    <div>
      {l.removedAt && (
        <div className="history-row">
          <span className="dot" style={{ background: "var(--gray)" }} />
          <span className="muted" style={{ flex: 1, fontSize: 14 }}>
            {formatDate(l.removedAt)} · odstránený
          </span>
          <span className="chip chip-off">Odstránený</span>
        </div>
      )}
      {rows.map((p, i) => {
        const prev = rows[i + 1];
        const diff = prev ? p.price - prev.price : 0;
        const isFirst = !prev;
        return (
          <div className="history-row" key={p.at}>
            <span
              className="dot"
              style={
                isFirst ? { background: "transparent", boxShadow: "inset 0 0 0 2px #858DA0" } : i === 0 && !l.removedAt ? undefined : { background: "#858DA0" }
              }
            />
            <span className="muted" style={{ flex: 1, fontSize: 14 }}>
              {formatDate(p.at)}
              {isFirst && " · pridané"}
            </span>
            {diff !== 0 && (
              <span className={`num ${diff < 0 ? "t-down" : "t-up"}`} style={{ fontSize: 13, fontWeight: 600 }}>
                {diff < 0 ? "↓" : "↑"} {formatPrice(Math.abs(diff), l.currency)}
              </span>
            )}
            <span className={`num${isFirst ? " faint" : ""}`} style={{ fontWeight: 700, minWidth: 96, textAlign: "right" }}>
              {formatPrice(p.price, l.currency)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Note({ l }: { l: Listing }) {
  const { updateListing } = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(l.note);

  if (!editing && !l.note) {
    return (
      <button className="note-add note-block" onClick={() => setEditing(true)}>
        <Icon name="plus" size="s" />
        Pridať poznámku
      </button>
    );
  }
  if (!editing) {
    return (
      <div className="note-block">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 28 }}>
          <h2 className="cap" style={{ margin: 0, color: "var(--link)" }}>
            Moja poznámka
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} style={{ height: 28, marginRight: -8 }}>
            Upraviť
          </button>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{l.note}</p>
      </div>
    );
  }
  return (
    <div className="note-block" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label className="cap" htmlFor="note" style={{ color: "var(--link)" }}>
        Moja poznámka
      </label>
      <div className="field textarea">
        <textarea
          id="note"
          autoFocus
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Napr. predajca je ochotný zľaviť, obhliadka v sobotu…"
          style={{ minHeight: 84 }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setText(l.note);
            setEditing(false);
          }}
        >
          Zrušiť
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            updateListing(l.id, { note: text.trim() });
            setEditing(false);
          }}
        >
          Uložiť poznámku
        </button>
      </div>
    </div>
  );
}
