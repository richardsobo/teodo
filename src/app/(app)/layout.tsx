"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useStore } from "@/lib/store";

/** Stránky len pre prihlásených. V kroku 2 to nahradí kontrola session zo Supabase v proxy.ts. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, user } = useStore();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (ready && !user) {
      const next = path + (typeof window !== "undefined" ? window.location.search : "");
      router.replace(`/prihlasenie?next=${encodeURIComponent(next)}`);
    }
  }, [ready, user, path, router]);

  if (!ready || !user) return <Skeleton />;
  return <>{children}</>;
}

function Skeleton() {
  return (
    <main className="t-main" aria-busy="true">
      <div className="t-wrap board">
        <div className="board-side">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 34, margin: "4px 12px" }} />
          ))}
        </div>
        <div className="board-main">
          <div className="skeleton" style={{ height: 30, width: 220 }} />
          <div className="grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: "4/5", borderRadius: 18 }} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
