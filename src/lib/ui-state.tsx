"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type SortKey = "changed" | "added" | "drop" | "title";
export type StateFilter = "all" | "down" | "up" | "none" | "removed";

interface UIState {
  query: string;
  setQuery(q: string): void;
  searchOpen: boolean;
  setSearchOpen(v: boolean): void;
  sort: SortKey;
  setSort(s: SortKey): void;
  stateFilter: StateFilter;
  setStateFilter(s: StateFilter): void;
  /** "all" | "none" (bez kategórie) | id kategórie */
  category: string;
  setCategory(c: string): void;
}

const Ctx = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("changed");
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [category, setCategory] = useState("all");
  const value = useMemo(
    () => ({
      query,
      setQuery,
      searchOpen,
      setSearchOpen,
      sort,
      setSort,
      stateFilter,
      setStateFilter,
      category,
      setCategory,
    }),
    [query, searchOpen, sort, stateFilter, category],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI(): UIState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI musí byť vnútri <UIProvider>");
  return v;
}
