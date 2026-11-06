import type { ExtractResult } from "./types";
import { displayDomain, findAdapter } from "./registry";

/**
 * KROK 1 – simulácia načítania inzerátu (bez servera).
 * V kroku 3 ju nahradí volanie API, ktoré stránku stiahne (raz, s ohľadom
 * na robots.txt) a spracuje ju cez `findAdapter(url) ?? extractGeneric`.
 *
 * Na vyskúšanie stavov v UI:
 *  - odkaz obsahujúci „chyba“ → inzerát sa nepodarí načítať
 *  - odkaz obsahujúci „bez-ceny“ → cenu nenájdeme, treba ju doplniť ručne
 *  - akýkoľvek iný web → všeobecné načítanie (schema.org / Open Graph)
 */
export async function mockFetchListing(url: URL): Promise<ExtractResult> {
  await new Promise((r) => setTimeout(r, 1300));
  const href = url.href.toLowerCase();
  if (href.includes("chyba")) throw new Error("Inzerát sa nepodarilo načítať. Skontroluj odkaz alebo to skús o chvíľu znova.");

  const adapter = findAdapter(url);
  const domain = url.hostname.replace(/^www\./, "");
  const title = titleFromPath(url) ?? `Inzerát z ${displayDomain(url.hostname)}`;
  const guess = guessKind(title);
  const noPrice = href.includes("bez-ceny");

  const currency = url.hostname.endsWith(".cz") ? "CZK" : "EUR";
  const price = noPrice ? null : guess.price * (currency === "CZK" ? 25 : 1);
  const images = noPrice ? [] : Array.from({ length: adapter ? guess.n : 1 }, (_, i) => `/demo/${guess.slug}-${i + 1}.svg`);

  return {
    support: adapter ? "adapter" : "generic",
    sourceName: adapter?.name ?? displayDomain(url.hostname),
    domain,
    data: {
      title,
      description: "",
      images,
      price,
      currency,
      location: adapter ? "Bratislava" : null,
      removed: false,
    },
    missing: [...(price == null ? (["price"] as const) : []), ...(images.length ? [] : (["images"] as const))],
  };
}

function titleFromPath(url: URL): string | null {
  const seg = url.pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/\.(php|html?)$/i, ""))
    .filter((s) => /[a-z]/i.test(s) && s.length > 3 && !/^(inzerat|detail|uzivatel|item|ad)$/i.test(s))
    .at(-1);
  if (!seg) return null;
  const words = decodeURIComponent(seg)
    .replace(/[-_+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function guessKind(title: string) {
  const t = title.toLowerCase();
  if (/(bmw|skoda|škoda|toyota|audi|vw|volkswagen|octavia|ford|auto|car)/.test(t)) return { slug: "camry", n: 6, price: 8900 };
  if (/(bicyk|kolo|trek|bike|specialized)/.test(t)) return { slug: "domane", n: 6, price: 640 };
  if (/(iphone|samsung|mobil|telef)/.test(t)) return { slug: "iphone", n: 1, price: 690 };
  if (/(notebook|laptop|macbook|lenovo)/.test(t)) return { slug: "legion", n: 3, price: 750 };
  if (/(sluch|slúch|sony|headphone)/.test(t)) return { slug: "sony", n: 4, price: 180 };
  if (/(gauc|gauč|sedack|sedačk|pohov)/.test(t)) return { slug: "sofa", n: 3, price: 290 };
  return { slug: "generic", n: 1, price: 120 };
}
