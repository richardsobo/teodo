"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EmptyHero } from "@/components/EmptyHero";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";

export default function Landing() {
  const { ready, user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/prehlad");
  }, [ready, user, router]);

  return (
    <>
      <main className="t-main">
        <div className="t-wrap board">
          <nav aria-label="Kategórie" className="board-side">
            <span className="cap" style={{ padding: "0 12px 10px" }}>
              Kategórie
            </span>
            <span className="nav-item active">
              <span>Všetky inzeráty</span>
              <span className="count">0</span>
            </span>
            <Link className="nav-item" href="/prihlasenie" style={{ color: "var(--link)", marginTop: 6 }}>
              <span>
                <Icon name="plus" size="s" />
                Nová kategória
              </span>
            </Link>
          </nav>
          <section className="board-main">
            <div>
              <h1 className="h1">Všetky sledované inzeráty</h1>
              <p className="faint" style={{ margin: "4px 0 0", fontSize: 14 }}>
                0 inzerátov
              </p>
            </div>
            <EmptyHero guest />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
