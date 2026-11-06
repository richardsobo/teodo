import Link from "next/link";

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
            <Link className="logo" href="/" style={{ fontSize: 20 }}>
              teodo<b>.</b>
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
          </nav>
        </div>
      </div>
    </footer>
  );
}
