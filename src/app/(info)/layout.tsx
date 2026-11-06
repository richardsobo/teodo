import { Footer } from "@/components/Footer";
import { Suspense } from "react";
import { InfoNav } from "./InfoNav";

// Pozn.: texty podmienok a ochrany údajov sú pracovné – pred verejným spustením ich prejde právnik.
export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="t-main">
        <div className="t-wrap info">
          <section className="info-body rise">{children}</section>
          <Suspense fallback={<nav className="info-nav" />}>
            <InfoNav />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
