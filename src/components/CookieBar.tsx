"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Switch } from "./ui";

export function CookieBar() {
  const { ready, cookieConsent, setCookieConsent } = useStore();
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const show = ready && !cookieConsent;
  const save = (a: boolean) => setCookieConsent({ analytics: a, at: new Date().toISOString() });

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          className="float"
          aria-label="Súhlas s cookies"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 30, stiffness: 300, delay: 0.6 }}
          style={{
            position: "fixed",
            left: 16,
            bottom: 16,
            zIndex: 70,
            width: "min(480px, calc(100% - 32px))",
            borderRadius: 18,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
            Na analýzu návštevnosti používame cookies (Google Analytics). Zapneme ich iba s tvojím súhlasom.{" "}
            <Link href="/ochrana-udajov" className="link">
              Viac
            </Link>
          </p>
          <AnimatePresence initial={false}>
            {details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Nevyhnutné</div>
                      <div className="faint" style={{ fontSize: 12 }}>
                        Prihlásenie a uloženie nastavení. Vždy zapnuté.
                      </div>
                    </div>
                    <Switch checked onChange={() => {}} label="Nevyhnutné cookies" disabled />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Analytika</div>
                      <div className="faint" style={{ fontSize: 12 }}>
                        Anonymná návštevnosť cez Google Analytics.
                      </div>
                    </div>
                    <Switch checked={analytics} onChange={setAnalytics} label="Analytické cookies" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {details ? (
              <button className="btn btn-primary btn-sm" onClick={() => save(analytics)}>
                Uložiť výber
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => save(true)}>
                  Prijať všetky
                </button>
                <button className="btn btn-soft btn-sm" onClick={() => save(false)}>
                  Iba nevyhnutné
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setDetails(true)}>
                  Nastavenia
                </button>
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
