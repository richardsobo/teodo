/**
 * Dátový model Teoda. Je zámerne nezávislý od konkrétneho bazára:
 * inzerát môže pochádzať z akéhokoľvek webu, rozdiel je len v tom,
 * ako spoľahlivo vieme jeho údaje načítať (pozri `SourceSupport`).
 */

/** ISO 4217 kód meny tak, ako je v inzeráte. Neprepočítavame. */
export type Currency = string;

/**
 * Ako dobre poznáme web, z ktorého inzerát je.
 * - `adapter`: máme pre web vlastný načítavač (napr. Bazoš, Autobazar.eu)
 * - `generic`: všeobecné načítanie zo štruktúrovaných dát (schema.org, Open Graph, microdata)
 * - `manual`: cenu sme nenašli, používateľ ju doplnil ručne – nevieme ju sledovať automaticky
 */
export type SourceSupport = "adapter" | "generic" | "manual";

export interface ListingSource {
  /** napr. "auto.bazos.sk" */
  domain: string;
  /** zobrazovaný názov, napr. "Bazoš" */
  name: string;
  support: SourceSupport;
}

export interface PricePoint {
  /** ISO dátum a čas kontroly, pri ktorej sa cena zistila */
  at: string;
  price: number;
  /** cenu zadal používateľ ručne (oprava v úprave inzerátu) */
  manual?: boolean;
}

export type ListingStatus = "pending" | "active" | "removed";

export interface ListingNotify {
  /** upozorniť pri každej zmene ceny a pri zmazaní (predvolene áno) */
  onChange: boolean;
  /** voliteľná cieľová cena v mene inzerátu */
  target: number | null;
}

export interface Listing {
  id: string;
  url: string;
  source: ListingSource;
  title: string;
  description: string;
  images: string[];
  /** aktuálna (posledná známa) cena; null = cenu nepoznáme */
  price: number | null;
  currency: Currency;
  location: string | null;
  categoryId: string | null;
  status: ListingStatus;
  addedAt: string;
  lastCheckedAt: string | null;
  removedAt?: string;
  /** chyba pri poslednej kontrole (web nedostupný a pod.) */
  checkError?: string;
  /** história cien od pridania, zoradená od najstaršej */
  history: PricePoint[];
  notify: ListingNotify;
  note: string;
}

export interface Category {
  id: string;
  name: string;
}

export type NotificationKind = "down" | "up" | "removed" | "target";

export interface AppNotification {
  id: string;
  listingId: string;
  kind: NotificationKind;
  at: string;
  price?: number;
  previous?: number;
  read: boolean;
}

export type AuthProvider = "email" | "google";

export interface User {
  email: string;
  name: string;
  provider: AuthProvider;
}

export interface NotificationSettings {
  /** e-mail hneď po kontrole, pri ktorej sa niečo zmenilo */
  emailInstant: boolean;
  /** namiesto jednotlivých e-mailov jeden denný súhrn */
  emailDigest: boolean;
  /** upozorniť aj na zdraženie (pokles a zmazanie sú vždy) */
  notifyIncrease: boolean;
}
