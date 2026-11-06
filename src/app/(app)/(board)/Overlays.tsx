"use client";

import { usePathname } from "next/navigation";
import { AddListing } from "@/components/AddListing";
import { DetailPanel } from "@/components/DetailPanel";

/**
 * Okná nad prehľadom (detail, pridanie) sa riadia priamo adresou.
 * Next.js si inak skryté stránky pamätá aj so stavom (napr. „zatvorený panel“)
 * a pri opätovnom otvorení toho istého inzerátu by sa panel neukázal.
 */
export function Overlays() {
  const path = usePathname();
  const detail = path.match(/^\/inzerat\/([^/]+)\/?$/);
  if (detail) {
    const id = decodeURIComponent(detail[1]);
    return <DetailPanel key={id} id={id} />;
  }
  if (path === "/pridat") return <AddListing />;
  return null;
}
