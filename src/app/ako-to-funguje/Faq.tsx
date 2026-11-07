"use client";

import Link from "next/link";
import { useState } from "react";

/** Časté otázky – akordeón s plynulým rozbalením. */
export function Faq({ items }: { items: Array<[string, string]> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <span className="cap" style={{ color: "var(--link)" }}>
        Časté otázky
      </span>
      <h2 id="faq-title" className="display" style={{ fontSize: "clamp(24px, 3.2vw, 30px)" }}>
        Máš otázku? Tu je odpoveď
      </h2>
      <div className="faq-list">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} className={`faq-item${isOpen ? " open" : ""}`}>
              <button className="faq-q" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </button>
              <div className="faq-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                <div>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
        Nenašiel si odpoveď?{" "}
        <Link className="link" href="/kontakt">
          Napíš nám
        </Link>
      </p>
    </section>
  );
}
