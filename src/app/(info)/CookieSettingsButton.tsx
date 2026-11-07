"use client";

import { openCookieSettings } from "@/components/CookieBar";

export function CookieSettingsButton() {
  return (
    <button type="button" className="link" onClick={openCookieSettings}>
      otvoriť nastavenia cookies
    </button>
  );
}
