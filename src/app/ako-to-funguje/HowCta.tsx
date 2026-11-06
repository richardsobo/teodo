"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export function HowCta() {
  const { user, ready } = useStore();
  if (!ready) return <span style={{ height: 44, marginTop: 8 }} />;
  return user ? (
    <Link className="btn btn-primary" href="/pridat" style={{ alignSelf: "flex-start", marginTop: 8 }}>
      Pridať inzerát
    </Link>
  ) : (
    <Link className="btn btn-primary" href="/prihlasenie" style={{ alignSelf: "flex-start", marginTop: 8 }}>
      Začať zadarmo
    </Link>
  );
}
