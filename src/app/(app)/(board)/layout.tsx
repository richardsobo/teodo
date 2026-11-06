import { Board } from "@/components/Board";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Overlays } from "./Overlays";

/**
 * Prehľad zostáva vykreslený pod detailom aj pod pridaním inzerátu,
 * takže /inzerat/[id] a /pridat sú „okná“ nad zoznamom s vlastnou URL.
 */
export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="t-main">
        <Board />
      </main>
      <Footer />
      {children}
      <Suspense>
        <Overlays />
      </Suspense>
    </>
  );
}
