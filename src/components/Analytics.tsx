"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { GA_COOKIE_MONTHS } from "@/lib/legal";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Zmaže analytické cookies (_ga, _ga_<ID>) po odvolaní súhlasu. */
function clearGaCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!/^_ga(_|$)/.test(name)) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    });
  });
}

/**
 * Google Analytics 4 v režime „basic consent mode“:
 * skript sa načíta až po súhlase s analytikou, dovtedy Google nedostane nič.
 * Reklamné signály (ad_storage, ad_user_data, ad_personalization) sú vždy zamietnuté.
 * Meracie ID sa nastavuje premennou NEXT_PUBLIC_GA_ID (napr. vo Verceli).
 */
export function Analytics() {
  const { cookieConsent } = useStore();
  const granted = !!cookieConsent?.analytics;

  // odvolanie súhlasu počas návštevy
  useEffect(() => {
    if (granted || !GA_ID) return;
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    clearGaCookies();
  }, [granted]);

  if (!GA_ID || !granted) return null;

  return (
    <>
      <Script id="ga-consent" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${GA_ID}', { cookie_expires: ${GA_COOKIE_MONTHS * 30 * 24 * 60 * 60}, allow_google_signals: false, allow_ad_personalization_signals: false });`}
      </Script>
      <Script id="ga-lib" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
  );
}
