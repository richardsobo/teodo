import Link from "next/link";
import { Logo } from "./Logo";
import { CookieSettingsLink } from "./CookieSettingsLink";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="t-wrap">
        <div
          style={{
            borderTop: "1px solid var(--line)",
            padding: "28px 0 36px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link className="logo logo-footer" href="/" aria-label="Teodo – úvod">
              <Logo />
            </Link>
            <span className="faint" style={{ fontSize: 13 }}>
              © 2026
            </span>
          </div>
          <nav aria-label="Pätička" className="footer-nav">
            <Link href="/ako-to-funguje">Ako to funguje?</Link>
            <Link href="/podmienky">Obchodné podmienky</Link>
            <Link href="/ochrana-udajov">Ochrana osobných údajov</Link>
            <Link href="/kontakt">Kontakt</Link>
            <CookieSettingsLink />
          </nav>
        </div>
      </div>
    </footer>
  );
}
