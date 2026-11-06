import type { Metadata } from "next";
import { Suspense } from "react";
import { AddListing } from "@/components/AddListing";

export const metadata: Metadata = { title: "Pridať inzerát" };

/** Podporuje aj ?url= a ?text= – tak sem posiela Android cez Zdieľať → Teodo (PWA share target). */
export default function AddPage() {
  return (
    <Suspense>
      <AddListing />
    </Suspense>
  );
}
