"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { CONSENT_MAX_AGE_DAYS, COOKIE_POLICY_VERSION } from "@/lib/legal";
import { Switch } from "./ui";

/** Otvorí nastavenia cookies odkiaľkoľvek (napr. z pätičky). */
export function openCookieSettings() {
  window.dispatchEvent(new Event("teodo:cookies"));
}

function consentValid(c: { at: string; v?: number } | null): boolean {
  if (!c) return false;
  if ((c.v ?? 1) !== COOKIE_POLICY_VERSION) return false;
  return Date.now() - new Date(c.at).getTime() < CONSENT_MAX_AGE_DAYS * 86_400_000;
}

export function CookieBar() {
  const { ready, cookieConsent, setCookieConsent } = useStore();
  const [reopened, setReopened] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const on = () => {
      setAnalytics(!!cookieConsent?.analytics);
      setDetails(true);
      setReopened(true);
    };
    window.addEventListener("teodo:cookies", on);
    return () => window.removeEventListener("teodo:cookies", on);
  }, [cookieConsent]);

  const show = ready && (reopened || !consentValid(cookieConsent));
  const save = (a: boolean) => {
    setCookieConsent({ analytics: a, at: new Date().toISOString(), v: COOKIE_POLICY_VERSION });
    setReopened(false);
    setDetails(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          className="float cookie-bar"
          aria-label="Nastavenia cookies"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 30, stiffness: 300, delay: reopened ? 0 : 0.6 }}
        >
          <div>
            <h2 className="h3" style={{ fontSize: 15, marginBottom: 4 }}>
              Cookies
            </h2>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }} className="muted">
              Nevyhnutné cookies potrebujeme na prihlásenie. S tvojím súhlasom zapneme aj Google Analytics, aby sme videli, ako sa web používa. Súhlas môžeš
              kedykoľvek zmeniť v pätičke.{" "}
              <Link href="/ochrana-udajov#cookies" className="link">
                Viac o cookies
              </Link>
            </p>
          </div>
          <AnimatePresence initial={false}>
            {details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
                  <div className="cookie-row">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Nevyhnutné</div>
                      <div className="faint" style={{ fontSize: 12 }}>
                        Prihlásenie, bezpečnosť a uloženie tvojej voľby. Vždy zapnuté.
                      </div>
                    </div>
                    <Switch checked onChange={() => {}} label="Nevyhnutné cookies" disabled />
                  </div>
                  <div className="cookie-row">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Analytika</div>
                      <div className="faint" style={{ fontSize: 12 }}>
                        Google Analytics – návštevnosť a používanie webu, bez reklamy.
                      </div>
                    </div>
                    <Switch checked={analytics} onChange={setAnalytics} label="Analytické cookies" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="cookie-actions">
            {details ? (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => save(analytics)}>
                  Uložiť výber
                </button>
                <button className="btn btn-soft btn-sm" onClick={() => save(true)}>
                  Prijať všetky
                </button>
              </>
            ) : (
              <>
                {/* prijatie aj odmietnutie sú rovnako výrazné (požiadavka EDPB) */}
                <button className="btn btn-soft btn-sm" onClick={() => save(true)}>
                  Prijať všetky
                </button>
                <button className="btn btn-soft btn-sm" onClick={() => save(false)}>
                  Odmietnuť
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
