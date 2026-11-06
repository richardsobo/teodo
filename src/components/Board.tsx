"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CategoryNav, CategoryPills } from "./Categories";
import { EmptyHero } from "./EmptyHero";
import { Icon } from "./Icon";
import { ListingCard } from "./ListingCard";
import { Dialog, Popover, useIsMobile } from "./ui";
import { useStore } from "@/lib/store";
import { useUI, type SortKey, type StateFilter } from "@/lib/ui-state";
import { formatTime, plural, priceChange, relativeTime } from "@/lib/format";
import { lastCheckTime } from "@/lib/schedule";
import type { Listing } from "@/lib/types";

const SORTS: Array<[SortKey, string]> = [
  ["changed", "Naposledy zmenené"],
  ["added", "Naposledy pridané"],
  ["drop", "Najväčší pokles ceny"],
  ["title", "Podľa názvu"],
];
const STATES: Array<[StateFilter, string]> = [
  ["all", "Všetky"],
  ["down", "Zlacnené"],
  ["up", "Zdražené"],
  ["none", "Bez zmeny"],
  ["removed", "Odstránené"],
];

const lastActivity = (l: Listing) => l.removedAt ?? (l.history.length > 1 ? l.history.at(-1)!.at : l.addedAt);

function matchesQuery(l: Listing, q: string) {
  if (!q) return true;
  const hay = `${l.title} ${l.description} ${l.location ?? ""} ${l.source.domain} ${l.note}`
    .toLocaleLowerCase("sk")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return q
    .toLocaleLowerCase("sk")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/\s+/)
    .every((w) => hay.includes(w));
}

export function Board() {
  const store = useStore();
  const ui = useUI();
  const mobile = useIsMobile();
  const [filterOpen, setFilterOpen] = useState(false);
  const { listings, categories, isNew } = store;

  const catName =
    ui.category === "all" ? "Všetky sledované inzeráty" : ui.category === "none" ? "Bez kategórie" : categories.find((c) => c.id === ui.category)?.name;
  // kategória mohla medzitým zaniknúť
  const category = catName ? ui.category : "all";

  const items = useMemo(() => {
    const q = ui.query.trim();
    const inCat = listings.filter((l) => {
      if (category === "all") return true;
      if (category === "none") return !l.categoryId || !categories.some((c) => c.id === l.categoryId);
      return l.categoryId === category;
    });
    const filtered = inCat.filter((l) => {
      if (!matchesQuery(l, q)) return false;
      if (ui.stateFilter === "all") return true;
      const k = priceChange(l).kind;
      return ui.stateFilter === "none" ? k === "none" || k === "unknown" : k === ui.stateFilter;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      if (ui.sort === "added") return b.addedAt.localeCompare(a.addedAt);
      if (ui.sort === "title") return a.title.localeCompare(b.title, "sk");
      if (ui.sort === "drop") return priceChange(a).totalPct - priceChange(b).totalPct;
      // nové zmeny od poslednej návštevy navrch, odstránené až na koniec
      if (isNew(a) !== isNew(b)) return isNew(a) ? -1 : 1;
      if ((a.status === "removed") !== (b.status === "removed")) return a.status === "removed" ? 1 : -1;
      return lastActivity(b).localeCompare(lastActivity(a));
    });
    return { all: inCat, shown: sorted };
  }, [listings, categories, category, ui.query, ui.stateFilter, ui.sort, isNew]);

  const filtered = ui.stateFilter !== "all" || ui.sort !== "changed";
  const check = lastCheckTime();
  const total = items.shown.length;
  const searching = ui.query.trim().length > 0;
  const noListingsAtAll = listings.length === 0;

  const resetFilter = () => {
    ui.setStateFilter("all");
    ui.setSort("changed");
  };

  const filterBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label className="label" htmlFor="f-sort">
          Zoradiť
        </label>
        <div className="field">
          <select id="f-sort" value={ui.sort} onChange={(e) => ui.setSort(e.target.value as SortKey)}>
            {SORTS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size="s" />
        </div>
      </div>
      <div>
        <span className="label">Stav ceny</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {STATES.map(([k, l]) => (
            <button key={k} className={`pill${ui.stateFilter === k ? " on" : ""}`} aria-pressed={ui.stateFilter === k} onClick={() => ui.setStateFilter(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => setFilterOpen(false)}>
        Zobraziť {total} {plural(total, "inzerát", "inzeráty", "inzerátov")}
      </button>
    </div>
  );

  return (
    <div className="t-wrap board">
      <CategoryNav />

      <section className="board-main">
        <AnimatePresence initial={false}>
          {mobile && ui.searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden", margin: "-4px -4px 0", padding: 4 }}
            >
              <label className="field" style={{ height: 44 }}>
                <Icon name="search" size="s" style={{ width: 18, height: 18 }} />
                <input
                  autoFocus
                  placeholder="Hľadať v uložených inzerátoch…"
                  aria-label="Hľadať"
                  value={ui.query}
                  onChange={(e) => ui.setQuery(e.target.value)}
                  type="search"
                />
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    ui.setQuery("");
                    ui.setSearchOpen(false);
                  }}
                  style={{ height: 30, padding: "0 8px" }}
                >
                  Zrušiť
                </button>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
        <CategoryPills />

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={searching ? "q" : category}
                className="h1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{ fontSize: mobile ? 22 : undefined }}
              >
                {searching ? `Výsledky pre „${ui.query.trim()}“` : catName}
              </motion.h1>
            </AnimatePresence>
            <p className="faint" style={{ margin: "4px 0 0", fontSize: mobile ? 12 : 14 }}>
              {total} {plural(total, "inzerát", "inzeráty", "inzerátov")}
              {` · ceny sme naposledy skontrolovali ${relativeTime(check.toISOString()).startsWith("dnes") ? `dnes o ${formatTime(check.toISOString())}` : relativeTime(check.toISOString())}`}
            </p>
          </div>
          {!noListingsAtAll && (
            <>
              <button
                className="btn btn-soft btn-icon"
                data-popover-trigger
                aria-label="Filter a zoradenie"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((o) => !o)}
                style={{ position: "relative", flex: "none" }}
              >
                <Icon name="filter" />
                {filtered && <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--link)" }} />}
              </button>
              <Popover
                open={!mobile && filterOpen}
                onClose={() => setFilterOpen(false)}
                label="Filter a zoradenie"
                style={{ top: "calc(100% + 10px)", right: 0, width: 360, borderRadius: 20, padding: 20 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h2 className="h3" style={{ fontSize: 17 }}>
                    Filter
                  </h2>
                  {filtered && (
                    <button className="btn btn-ghost btn-sm" onClick={resetFilter}>
                      Zrušiť filter
                    </button>
                  )}
                </div>
                {filterBody}
              </Popover>
              <Dialog open={mobile && filterOpen} onClose={() => setFilterOpen(false)} title="Filter">
                {filterBody}
                {filtered && (
                  <button className="btn btn-ghost btn-block" style={{ marginTop: 6 }} onClick={resetFilter}>
                    Zrušiť filter
                  </button>
                )}
              </Dialog>
            </>
          )}
        </div>

        {noListingsAtAll ? (
          <EmptyHero guest={false} />
        ) : total === 0 ? (
          <EmptyResult
            kind={searching ? "search" : filtered ? "filter" : "category"}
            onReset={() => {
              ui.setQuery("");
              resetFilter();
            }}
          />
        ) : (
          <motion.div layout className="grid">
            <AnimatePresence initial={false} mode="popLayout">
              {items.shown.map((l, i) => (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(i * 0.03, 0.3), duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                >
                  <ListingCard l={l} isNew={isNew(l)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <Link className="btn btn-primary fab only-mobile" href="/pridat" aria-label="Pridať inzerát" scroll={false}>
        <Icon name="plus" size="l" style={{ strokeWidth: 2.2 }} />
      </Link>
    </div>
  );
}

function EmptyResult({ kind, onReset }: { kind: "search" | "filter" | "category"; onReset: () => void }) {
  const text = {
    search: ["Nič sme nenašli", "Skús iné slovo – hľadáme v názve, popise, lokalite aj poznámkach."],
    filter: ["Žiadny inzerát nevyhovuje filtru", "Skús zmeniť filter alebo kategóriu."],
    category: ["V tejto kategórii zatiaľ nič nie je", "Pridaj inzerát a pri pridávaní vyber túto kategóriu."],
  }[kind];
  return (
    <div
      className="rise"
      style={{
        padding: "64px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        border: "1px dashed rgba(255,255,255,.1)",
        borderRadius: 20,
      }}
    >
      <h2 className="h2">{text[0]}</h2>
      <p className="muted" style={{ margin: 0, maxWidth: 420 }}>
        {text[1]}
      </p>
      {kind === "category" ? (
        <Link className="btn btn-primary" href="/pridat" style={{ marginTop: 8 }} scroll={false}>
          <Icon name="plus" />
          Pridať inzerát
        </Link>
      ) : (
        <button className="btn btn-soft" style={{ marginTop: 8 }} onClick={onReset}>
          Zrušiť hľadanie a filter
        </button>
      )}
    </div>
  );
}
