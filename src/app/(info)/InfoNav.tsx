"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/ochrana-udajov", "Ochrana osobných údajov"],
  ["/podmienky", "Obchodné podmienky"],
  ["/kontakt", "Kontakt"],
] as const;

export function InfoNav() {
  const path = usePathname();
  return (
    <nav aria-label="Právne informácie" className="info-nav">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={`nav-item${path === href ? " active" : ""}`} aria-current={path === href ? "page" : undefined}>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
