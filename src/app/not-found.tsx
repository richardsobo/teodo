import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <main className="t-main">
        <div
          className="t-wrap rise"
          style={{ padding: "96px var(--gutter) 120px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}
        >
          <span className="display num" style={{ fontSize: 72, color: "var(--link)" }}>
            404
          </span>
          <h1 className="h1">Táto stránka neexistuje</h1>
          <p className="muted" style={{ margin: 0, maxWidth: 420 }}>
            Možno bola presunutá, alebo je v odkaze preklep. Skús to od začiatku.
          </p>
          <Link className="btn btn-primary" href="/" style={{ marginTop: 8 }}>
            Späť na úvod
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
