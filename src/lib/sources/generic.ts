import type { ExtractedListing } from "./types";

/**
 * Všeobecný načítavač pre ľubovoľný web.
 * Poradie zdrojov podľa spoľahlivosti:
 *   1. schema.org JSON-LD (Product / Offer / Vehicle …)
 *   2. microdata (itemprop="price", itemprop="priceCurrency")
 *   3. Open Graph a meta značky (og:title, og:image, product:price:amount …)
 *   4. <title> a meta description ako posledná možnosť
 *
 * Funkcia je čistá (vstup HTML, výstup údaje), takže sa dá testovať bez siete.
 */
export function extractGeneric(html: string, pageUrl: URL): ExtractedListing {
  const out: ExtractedListing = {
    title: null,
    description: null,
    images: [],
    price: null,
    currency: null,
    location: null,
    removed: false,
  };

  // 1) JSON-LD
  for (const node of readJsonLd(html)) {
    const offer = pickOffer(node);
    out.title ??= str(node.name);
    out.description ??= str(node.description);
    out.images.push(...toArray(node.image).map(imageUrl).filter(isStr));
    if (offer) {
      out.price ??= parsePrice(offer.price ?? offer.lowPrice);
      out.currency ??= str(offer.priceCurrency);
      const avail = str(offer.availability) ?? "";
      if (/(SoldOut|Discontinued|OutOfStock)/i.test(avail)) out.removed = true;
    }
    const addr = node.address ?? (offer?.availableAtOrFrom as Record<string, unknown> | undefined)?.address;
    if (addr && typeof addr === "object") {
      const a = addr as Record<string, unknown>;
      out.location ??= str(a.addressLocality) ?? str(a.addressRegion);
    }
  }

  // 2) microdata
  out.price ??= parsePrice(attr(html, /itemprop=["']price["'][^>]*content=["']([^"']+)["']/i));
  out.currency ??= attr(html, /itemprop=["']priceCurrency["'][^>]*content=["']([^"']+)["']/i);

  // 3) Open Graph a meta
  out.title ??= meta(html, "og:title");
  out.description ??= meta(html, "og:description") ?? meta(html, "description");
  const ogImage = meta(html, "og:image");
  if (ogImage) out.images.push(ogImage);
  out.price ??= parsePrice(meta(html, "product:price:amount") ?? meta(html, "og:price:amount"));
  out.currency ??= meta(html, "product:price:currency") ?? meta(html, "og:price:currency");

  // 4) záloha
  out.title ??= decode(attr(html, /<title[^>]*>([^<]+)<\/title>/i)?.trim() ?? null);

  out.images = unique(out.images.map((src) => absolutize(src, pageUrl)).filter(isStr));
  out.currency = normalizeCurrency(out.currency, pageUrl);
  return out;
}

/* ---------------- pomocné funkcie ---------------- */

type Json = Record<string, unknown>;

function readJsonLd(html: string): Json[] {
  const nodes: Json[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const flat = toArray(parsed).flatMap((n) => (n && typeof n === "object" && "@graph" in n ? toArray((n as Json)["@graph"]) : [n]));
      for (const n of flat) if (n && typeof n === "object" && isListingType((n as Json)["@type"])) nodes.push(n as Json);
    } catch {
      /* poškodený JSON-LD ignorujeme */
    }
  }
  return nodes;
}

function isListingType(t: unknown): boolean {
  return toArray(t).some(
    (x) => typeof x === "string" && /^(Product|Offer|Vehicle|Car|IndividualProduct|Accommodation|Residence|Apartment|House|RealEstateListing)$/i.test(x),
  );
}

function pickOffer(node: Json): Json | null {
  if (/Offer/i.test(String(node["@type"]))) return node;
  const offers = toArray(node.offers)[0];
  return offers && typeof offers === "object" ? (offers as Json) : null;
}

/** "15 000 Kč", "5.400,00 €", "1,299.99" → číslo */
export function parsePrice(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  let s = raw.replace(/[^\d.,]/g, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : ".";
  const decimals = s.length - Math.max(lastComma, lastDot) - 1;
  if (Math.max(lastComma, lastDot) === -1 || decimals === 3) {
    s = s.replace(/[.,]/g, "");
  } else {
    s = s.replace(decimalSep === "," ? /\./g : /,/g, "").replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeCurrency(c: string | null, url: URL): string | null {
  if (c) {
    const t = c.trim().toUpperCase();
    if (t === "€" || t === "EUR") return "EUR";
    if (t === "KČ" || t === "CZK") return "CZK";
    if (/^[A-Z]{3}$/.test(t)) return t;
  }
  // odhad podľa domény, ak mena chýba
  if (url.hostname.endsWith(".cz")) return "CZK";
  if (url.hostname.endsWith(".sk")) return "EUR";
  return null;
}

function meta(html: string, name: string): string | null {
  const esc = name.replace(/[:.]/g, "\\$&");
  return decode(
    attr(html, new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]*content=["']([^"']*)["']`, "i")) ??
      attr(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${esc}["']`, "i")),
  );
}

function attr(html: string, re: RegExp): string | null {
  return html.match(re)?.[1] ?? null;
}

function decode(s: string | null): string | null {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function imageUrl(x: unknown): string | null {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") return str((x as Json).url) ?? str((x as Json).contentUrl);
  return null;
}

function absolutize(src: string, base: URL): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

const str = (x: unknown): string | null => (typeof x === "string" && x.trim() ? x.trim() : null);
const isStr = (x: unknown): x is string => typeof x === "string";
const toArray = (x: unknown): unknown[] => (Array.isArray(x) ? x : x == null ? [] : [x]);
const unique = <T>(a: T[]) => Array.from(new Set(a));
