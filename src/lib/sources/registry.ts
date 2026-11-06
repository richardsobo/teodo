import type { SourceAdapter } from "./types";
import { extractGeneric } from "./generic";

/**
 * Zoznam webov, ktoré poznáme lepšie než všeobecný načítavač.
 * Zatiaľ používajú všeobecné načítanie; vlastné spracovanie stránky
 * (selektory pre cenu, lokalitu, zmazaný inzerát) doplníme v kroku 3,
 * keď budeme mať skutočné HTML ukážky.
 *
 * Akýkoľvek iný web funguje cez `extractGeneric` – Teodo teda nie je
 * viazané na Bazoš ani Autobazar.eu.
 */
export const adapters: SourceAdapter[] = [
  {
    id: "bazos",
    name: "Bazoš",
    matches: (u) => /(^|\.)bazos\.(sk|cz)$/i.test(u.hostname),
    extract: (html, u) => extractGeneric(html, u),
  },
  {
    id: "autobazar-eu",
    name: "Autobazar.eu",
    matches: (u) => /(^|\.)autobazar\.eu$/i.test(u.hostname),
    extract: (html, u) => extractGeneric(html, u),
  },
];

export function findAdapter(url: URL): SourceAdapter | null {
  return adapters.find((a) => a.matches(url)) ?? null;
}

/** Pekný názov webu pre UI: "auto.bazos.sk" → "bazos.sk" */
export function displayDomain(hostname: string): string {
  const parts = hostname.replace(/^www\./, "").split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
}

/** Overí, či používateľ vložil použiteľnú adresu inzerátu. */
export function parseListingUrl(input: string): { ok: true; url: URL } | { ok: false; error: string } {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Vlož odkaz na inzerát." };
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "Toto nevyzerá ako odkaz. Skopíruj celú adresu z prehliadača." };
  }
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) {
    return { ok: false, error: "Toto nevyzerá ako odkaz. Skopíruj celú adresu z prehliadača." };
  }
  if (/(^|\.)facebook\.com$|(^|\.)fb\.com$/i.test(url.hostname)) {
    return { ok: false, error: "Inzeráty z Facebooku zatiaľ nevieme sledovať." };
  }
  if (url.pathname === "/" && !url.search) {
    return { ok: false, error: "Toto je úvodná stránka webu. Vlož odkaz priamo na konkrétny inzerát." };
  }
  return { ok: true, url };
}
