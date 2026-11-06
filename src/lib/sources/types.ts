import type { Currency, SourceSupport } from "@/lib/types";

/**
 * Výsledok načítania jedného inzerátu z ľubovoľného webu.
 * Každé pole môže chýbať – vtedy ho používateľ doplní ručne v kroku 2.
 */
export interface ExtractedListing {
  title: string | null;
  description: string | null;
  images: string[];
  price: number | null;
  currency: Currency | null;
  location: string | null;
  /** inzerát už na webe neexistuje (404, „inzerát bol zmazaný“ a pod.) */
  removed: boolean;
}

export interface ExtractResult {
  support: SourceSupport;
  sourceName: string;
  domain: string;
  data: ExtractedListing;
  /** ktoré dôležité polia chýbajú – podľa toho UI ukáže upozornenie */
  missing: Array<"title" | "price" | "images">;
}

/**
 * Načítavač pre konkrétny web. Pridať nový web = pridať jeden adaptér
 * do `registry.ts`. Weby bez adaptéra spracuje všeobecný načítavač.
 */
export interface SourceAdapter {
  id: string;
  name: string;
  /** vráti true, ak adaptér vie spracovať danú adresu */
  matches(url: URL): boolean;
  /** z HTML stránky vytiahne údaje; volá sa na serveri (krok 3) */
  extract(html: string, url: URL): ExtractedListing;
}
