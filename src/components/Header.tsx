"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { NotificationsList } from "./NotificationsList";
import { Dialog, Popover, useIsMobile } from "./ui";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-state";
import { CHECK_HOURS } from "@/lib/schedule";

/** Skrýva hlavičku pri scrollovaní nadol, ukáže ju pri scrollovaní nahor. */
function useHeaderScroll() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - last.current;
        if (y < 12) {
          setHidden(false);
          setScrolled(false);
        } else if (dy > 6 && y > 90) {
          setHidden(true);
        } else if (dy < -6) {
          setHidden(false);
          setScrolled(true);
        }
        last.current = y;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return { hidden, scrolled };
}

export function Header() {
  const store = useStore();
  const { user, ready, notifications } = store;
  const ui = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const mobile = useIsMobile();
  const { hidden, scrolled } = useHeaderScroll();
  const [open, setOpen] = useState<"" | "notif" | "menu">("");
  const guest = ready && !user;
  const unread = notifications.filter((n) => !n.read).length;
  const onBoard = pathname === "/prehlad" || pathname.startsWith("/inzerat") || pathname === "/pridat";

  // panely zavrieme pri zmene stránky
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen("");
  }

  const toggle = (k: "notif" | "menu") => setOpen((o) => (o === k ? "" : k));

  return (
    <header className={`site-header${hidden && !open && !ui.searchOpen ? " hidden" : ""}${scrolled ? " scrolled" : ""}`}>
      <div className="hdr-blur" aria-hidden="true" />
      <div className="t-wrap" style={{ position: "relative", height: "var(--header-h)", display: "flex", alignItems: "center", gap: 16 }}>
        <Link className="logo header-logo" href={user ? "/prehlad" : "/"} aria-label="Teodo – domov">
          <Logo />
        </Link>

        {/* desktop: tlačidlo a vyhľadávanie */}
        <Link className="btn btn-primary only-desktop" href={guest ? "/prihlasenie?next=/pridat" : "/pridat"} scroll={false}>
          <Icon name="plus" />
          Pridať inzerát
        </Link>
        <label className="field only-desktop" style={{ flex: "1 1 200px", height: 44, background: "rgba(255,255,255,.05)", borderColor: "transparent" }}>
          <Icon name="search" size="s" style={{ width: 18, height: 18 }} />
          <input
            placeholder="Hľadať v uložených inzerátoch…"
            aria-label="Hľadať v uložených inzerátoch"
            value={ui.query}
            onFocus={() => guest && router.push("/prihlasenie")}
            onChange={(e) => {
              ui.setQuery(e.target.value);
              if (!onBoard) router.push("/prehlad");
            }}
            type="search"
          />
          {ui.query && (
            <button className="btn btn-ghost btn-icon btn-sm" aria-label="Vymazať hľadanie" onClick={() => ui.setQuery("")} style={{ width: 28, height: 28 }}>
              <Icon name="close" size="s" />
            </button>
          )}
        </label>

        <div className="only-mobile" style={{ flex: 1 }} />

        {/* mobil: lupa */}
        {!guest && onBoard && (
          <button
            className="btn btn-ghost btn-icon only-mobile"
            aria-label="Hľadať"
            aria-expanded={ui.searchOpen}
            onClick={() => ui.setSearchOpen(!ui.searchOpen)}
          >
            <Icon name="search" />
          </button>
        )}

        {guest ? (
          <>
            <Link className="btn btn-ghost btn-icon" href="/prihlasenie" aria-label="Upozornenia">
              <Icon name="bell" />
            </Link>
            <Link className="btn btn-ghost btn-icon" href="/prihlasenie" aria-label="Prihlásiť sa">
              <Icon name="user" />
            </Link>
          </>
        ) : user ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4 }}>
            {mobile ? (
              <Link
                className="btn btn-ghost btn-icon"
                href="/upozornenia"
                aria-label={unread ? `Upozornenia (${unread} nové)` : "Upozornenia"}
                style={{ position: "relative" }}
              >
                <Icon name="bell" />
                {unread > 0 && <UnreadDot />}
              </Link>
            ) : (
              <button
                className="btn btn-ghost btn-icon"
                data-popover-trigger
                aria-label={unread ? `Upozornenia (${unread} nové)` : "Upozornenia"}
                aria-expanded={open === "notif"}
                onClick={() => toggle("notif")}
                style={{ position: "relative" }}
              >
                <Icon name="bell" />
                {unread > 0 && <UnreadDot />}
              </button>
            )}
            <button className="avatar" data-popover-trigger aria-label="Účet" aria-expanded={open === "menu"} onClick={() => toggle("menu")}>
              {user.name.charAt(0).toUpperCase()}
            </button>

            <Popover
              open={!mobile && open === "notif"}
              onClose={() => setOpen("")}
              label="Upozornenia"
              style={{ top: 56, right: -4, width: 400, borderRadius: 20, padding: 6, maxHeight: "calc(100dvh - 120px)", overflowY: "auto" }}
            >
              <NotifHeader />
              <NotificationsList compact onNavigate={() => setOpen("")} />
              <hr className="divider" style={{ margin: "4px 8px 0", width: "auto" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px 8px", fontSize: 13 }}>
                <span className="muted">
                  {store.settings.emailDigest ? "E-mailom: denný súhrn" : "E-mailom: hneď pri zmene"} · kontrola {CHECK_HOURS.map((h) => `${h}:00`).join(" a ")}
                </span>
                <Link className="link" href="/nastavenia#upozornenia" onClick={() => setOpen("")}>
                  Nastaviť
                </Link>
              </div>
            </Popover>

            <Popover
              open={!mobile && open === "menu"}
              onClose={() => setOpen("")}
              label="Účet"
              style={{ top: 56, right: -4, width: 280, borderRadius: 18, padding: 6 }}
            >
              <AccountMenu onNavigate={() => setOpen("")} />
            </Popover>
            <Dialog open={mobile && open === "menu"} onClose={() => setOpen("")} title="Účet" hideTitle>
              <AccountMenu onNavigate={() => setOpen("")} />
            </Dialog>
          </div>
        ) : (
          <span style={{ width: 88 }} />
        )}
      </div>
    </header>
  );
}

function UnreadDot() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 10,
        right: 11,
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--link)",
        boxShadow: "0 0 0 2px var(--bg)",
      }}
    />
  );
}

export function NotifHeader() {
  const { markAllRead, notifications } = useStore();
  const unread = notifications.some((n) => !n.read);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 8px 14px" }}>
      <h2 className="h3" style={{ fontSize: 17 }}>
        Upozornenia
      </h2>
      {unread && (
        <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
          Označiť ako prečítané
        </button>
      )}
    </div>
  );
}

function AccountMenu({ onNavigate }: { onNavigate: () => void }) {
  const { user, signOut } = useStore();
  const router = useRouter();
  if (!user) return null;
  return (
    <nav aria-label="Účet" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
        <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>
          {user.provider === "google" ? "Prihlásený cez Google" : "Prihlásený e-mailom"}
        </div>
      </div>
      <Link className="nav-item" href="/nastavenia" onClick={onNavigate}>
        <span>
          <Icon name="settings" size="s" />
          Nastavenia účtu
        </span>
      </Link>
      <Link className="nav-item" href="/nastavenia#upozornenia" onClick={onNavigate}>
        <span>
          <Icon name="bell" size="s" />
          Nastavenia upozornení
        </span>
      </Link>
      {user.provider === "email" && (
        <Link className="nav-item" href="/nastavenia#heslo" onClick={onNavigate}>
          <span>
            <Icon name="lock" size="s" />
            Zmeniť heslo
          </span>
        </Link>
      )}
      <Link className="nav-item" href="/ako-to-funguje" onClick={onNavigate}>
        <span>
          <Icon name="help" size="s" />
          Ako to funguje?
        </span>
      </Link>
      <hr className="divider" style={{ margin: "4px 8px", width: "auto" }} />
      <button
        className="nav-item"
        style={{ color: "var(--danger)" }}
        onClick={() => {
          onNavigate();
          signOut();
          router.push("/");
        }}
      >
        <span>
          <Icon name="logout" size="s" />
          Odhlásiť sa
        </span>
      </button>
    </nav>
  );
}

/** Statická hlavička počas prvého vykreslenia (kým sa nenačíta adresa stránky). */
export function HeaderFallback() {
  return (
    <header className="site-header">
      <div className="t-wrap" style={{ height: "var(--header-h)", display: "flex", alignItems: "center" }}>
        <span className="logo header-logo">
          <Logo />
        </span>
      </div>
    </header>
  );
}
