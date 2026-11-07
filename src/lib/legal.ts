/**
 * Údaje o prevádzkovateľovi pre právne stránky a kontakt.
 * Hodnoty v hranatých zátvorkách treba doplniť pred verejným spustením
 * (a texty nechať skontrolovať právnikom).
 */
export const OPERATOR = {
  name: "[meno a priezvisko / obchodné meno]",
  address: "[adresa sídla / miesta podnikania]",
  ico: "[IČO]",
  register: "[zápis v živnostenskom / obchodnom registri]",
  email: "podpora@teodo.sk",
};

/** Dátum účinnosti aktuálnych textov. */
export const LEGAL_UPDATED = "7. 11. 2026";

/** Verzia zásad cookies – pri zmene sa súhlas pýta znova. */
export const COOKIE_POLICY_VERSION = 1;

/** Súhlas platí 12 mesiacov, potom sa lišta ukáže znova. */
export const CONSENT_MAX_AGE_DAYS = 365;

/** Doba platnosti analytických cookies (nastavujeme kratšiu ako predvolené 2 roky). */
export const GA_COOKIE_MONTHS = 13;

export const isPlaceholder = (s: string) => s.startsWith("[");
