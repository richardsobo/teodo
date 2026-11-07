"use client";

import { openCookieSettings } from "./CookieBar";

export function CookieSettingsLink() {
  return (
    <button type="button" onClick={openCookieSettings}>
      Nastavenia cookies
    </button>
  );
}
