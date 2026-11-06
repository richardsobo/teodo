"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppNotification, ArchiveReason, Category, Listing, NotificationSettings, User } from "./types";
import { DEMO_ACCOUNT, DEMO_CATEGORIES, buildDemoListings, buildDemoNotifications, daysAgoIso } from "./demo-data";

/**
 * KROK 1 – ukážkový „backend“ v prehliadači (localStorage).
 * Rozhranie (akcie nižšie) je navrhnuté tak, aby ho v kroku 2 nahradili
 * volania Supabase bez zmeny komponentov.
 */

interface Account {
  password: string | null; // null = účet cez Google
  name: string;
}

export interface CookieConsent {
  analytics: boolean;
  at: string;
}

interface PersistedState {
  v: 1;
  user: User | null;
  accounts: Record<string, Account>;
  categories: Category[];
  listings: Listing[];
  notifications: AppNotification[];
  settings: NotificationSettings;
  /** čas predchádzajúcej návštevy – podľa neho zvýrazňujeme novinky */
  lastVisitAt: string;
  seen: Record<string, string>;
  cookieConsent: CookieConsent | null;
}

const KEY = "teodo:v1";

function initialState(): PersistedState {
  const listings = buildDemoListings();
  return {
    v: 1,
    user: null,
    accounts: { [DEMO_ACCOUNT.email]: { password: DEMO_ACCOUNT.password, name: DEMO_ACCOUNT.name } },
    categories: DEMO_CATEGORIES,
    listings,
    notifications: buildDemoNotifications(listings),
    settings: { emailInstant: true, emailDigest: false, notifyIncrease: true },
    lastVisitAt: daysAgoIso(2),
    seen: {},
    cookieConsent: null,
  };
}

export type SignInResult = { ok: true } | { ok: false; error: string };

export interface Store extends PersistedState {
  ready: boolean;
  /* --- prihlásenie --- */
  checkEmail(email: string): Promise<"existing" | "new" | "google">;
  signIn(email: string, password: string): Promise<SignInResult>;
  signUp(email: string, password: string): Promise<SignInResult>;
  signInWithGoogle(): Promise<SignInResult>;
  signOut(): void;
  changePassword(current: string, next: string): Promise<SignInResult>;
  setPassword(next: string): Promise<SignInResult>;
  deleteAccount(): void;
  /* --- kategórie --- */
  addCategory(name: string): string;
  renameCategory(id: string, name: string): void;
  deleteCategory(id: string): void;
  reorderCategories(ids: string[]): void;
  /* --- inzeráty --- */
  addListing(l: Listing): void;
  updateListing(id: string, patch: Partial<Listing>): void;
  removeListing(id: string): void;
  archiveListing(id: string, reason: ArchiveReason): void;
  restoreListing(id: string): void;
  markSeen(id: string): void;
  isNew(l: Listing): boolean;
  /* --- upozornenia --- */
  markAllRead(): void;
  markRead(id: string): void;
  updateSettings(patch: Partial<NotificationSettings>): void;
  /* --- ostatné --- */
  setCookieConsent(c: CookieConsent): void;
  resetDemo(): void;
}

const Ctx = createContext<Store | null>(null);

const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const norm = (e: string) => e.trim().toLowerCase();
const uid = () => Math.random().toString(36).slice(2, 10);

/** Stav pred načítaním v prehliadači – bez dátumov, aby bol prerender stabilný. */
const EMPTY: PersistedState = {
  v: 1,
  user: null,
  accounts: {},
  categories: [],
  listings: [],
  notifications: [],
  settings: { emailInstant: true, emailDigest: false, notifyIncrease: true },
  lastVisitAt: "",
  seen: {},
  cookieConsent: null,
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // načítanie z localStorage až v prehliadači
  useEffect(() => {
    let next: PersistedState | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as PersistedState) : null;
      if (parsed?.v === 1) next = parsed;
    } catch {
      /* poškodené dáta – začneme odznova */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- jednorazové načítanie po hydratácii
    setState(next ?? initialState());
    loaded.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* napr. súkromný režim */
    }
  }, [state]);

  const patch = useCallback((fn: (s: PersistedState) => Partial<PersistedState>) => setState((s) => ({ ...s, ...fn(s) })), []);

  const api = useMemo<Omit<Store, keyof PersistedState | "ready" | "isNew">>(
    () => ({
      async checkEmail(email) {
        await wait(500);
        const acc = state.accounts[norm(email)];
        if (!acc) return "new";
        return acc.password ? "existing" : "google";
      },
      async signIn(email, password) {
        await wait();
        const acc = state.accounts[norm(email)];
        if (!acc || acc.password !== password) return { ok: false, error: "Heslo nesedí. Skús to znova alebo si ho obnov." };
        patch(() => ({ user: { email: norm(email), name: acc.name, provider: "email" } }));
        return { ok: true };
      },
      async signUp(email, password) {
        await wait();
        const e = norm(email);
        const name = e.split("@")[0];
        patch((s) => ({ accounts: { ...s.accounts, [e]: { password, name } }, user: { email: e, name, provider: "email" } }));
        return { ok: true };
      },
      async signInWithGoogle() {
        await wait(700);
        const e = "richard.sobotovic@gmail.com";
        patch((s) => ({
          accounts: s.accounts[e] ? s.accounts : { ...s.accounts, [e]: { password: null, name: "Richard" } },
          user: { email: e, name: "Richard", provider: "google" },
        }));
        return { ok: true };
      },
      signOut() {
        patch((s) => ({ user: null, lastVisitAt: new Date().toISOString(), seen: s.seen }));
      },
      async changePassword(current, next) {
        await wait();
        const e = state.user?.email;
        if (!e) return { ok: false, error: "Nie si prihlásený." };
        if (state.accounts[e]?.password !== current) return { ok: false, error: "Súčasné heslo nesedí." };
        patch((s) => ({ accounts: { ...s.accounts, [e]: { ...s.accounts[e], password: next } } }));
        return { ok: true };
      },
      async setPassword(next) {
        await wait();
        const e = state.user?.email;
        if (!e) return { ok: false, error: "Nie si prihlásený." };
        patch((s) => ({ accounts: { ...s.accounts, [e]: { ...s.accounts[e], password: next } } }));
        return { ok: true };
      },
      deleteAccount() {
        const e = state.user?.email;
        const fresh = initialState();
        setState({
          ...fresh,
          listings: [],
          notifications: [],
          categories: [],
          accounts: Object.fromEntries(Object.entries(state.accounts).filter(([k]) => k !== e)),
          cookieConsent: state.cookieConsent,
        });
      },

      addCategory(name) {
        const id = `c-${uid()}`;
        patch((s) => ({ categories: [...s.categories, { id, name: name.trim() }] }));
        return id;
      },
      renameCategory(id, name) {
        patch((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)) }));
      },
      deleteCategory(id) {
        patch((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          listings: s.listings.map((l) => (l.categoryId === id ? { ...l, categoryId: null } : l)),
        }));
      },
      reorderCategories(ids) {
        patch((s) => ({ categories: ids.map((id) => s.categories.find((c) => c.id === id)!).filter(Boolean) }));
      },

      addListing(l) {
        patch((s) => ({ listings: [l, ...s.listings], seen: { ...s.seen, [l.id]: new Date().toISOString() } }));
      },
      updateListing(id, p) {
        patch((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, ...p } : l)) }));
      },
      removeListing(id) {
        patch((s) => ({ listings: s.listings.filter((l) => l.id !== id), notifications: s.notifications.filter((n) => n.listingId !== id) }));
      },
      archiveListing(id, reason) {
        patch((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, status: "archived", archiveReason: reason } : l)) }));
      },
      restoreListing(id) {
        patch((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, status: l.removedAt ? "removed" : "active", archiveReason: undefined } : l)),
        }));
      },
      markSeen(id) {
        patch((s) => ({ seen: { ...s.seen, [id]: new Date().toISOString() } }));
      },

      markAllRead() {
        patch((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
      },
      markRead(id) {
        patch((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
      },
      updateSettings(p) {
        patch((s) => ({ settings: { ...s.settings, ...p } }));
      },

      setCookieConsent(c) {
        patch(() => ({ cookieConsent: c }));
      },
      resetDemo() {
        setState((s) => ({ ...initialState(), user: s.user, cookieConsent: s.cookieConsent }));
      },
    }),
    [state.accounts, state.user, state.cookieConsent, patch],
  );

  const isNew = useCallback(
    (l: Listing) => {
      const changed = l.removedAt ?? (l.history.length > 1 ? l.history.at(-1)!.at : null);
      if (!changed || l.status === "archived") return false;
      const since = state.seen[l.id] ?? state.lastVisitAt;
      return changed > since;
    },
    [state.seen, state.lastVisitAt],
  );

  const value = useMemo<Store>(() => ({ ...state, ...api, ready, isNew }), [state, api, ready, isNew]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore musí byť vnútri <StoreProvider>");
  return s;
}

/** Krátkodobé UI hlásenia (toast). */
interface Toast {
  id: string;
  text: string;
  action?: { label: string; onClick: () => void };
}
const ToastCtx = createContext<{ toasts: Toast[]; show(t: Omit<Toast, "id">): void; dismiss(id: string): void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = uid();
      setToasts((all) => [...all.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);
  return <ToastCtx.Provider value={value}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const t = useContext(ToastCtx);
  if (!t) throw new Error("useToast musí byť vnútri <ToastProvider>");
  return t;
}
