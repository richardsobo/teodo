/**
 * Kontrola cien prebieha dvakrát denne (šetrne k bazárom):
 *  - ráno o 6:00 – zachytí zmeny z večera a noci, upozornenie príde pred prácou
 *  - večer o 18:00 – zachytí zmeny cez deň, upozornenie príde vo večernom „bazárovom“ čase
 * Na serveri sa jednotlivé inzeráty rozložia do okna ±30 min, aby
 * sme na jeden web neposlali všetky požiadavky naraz.
 */
export const CHECK_HOURS = [6, 18] as const;
export const CHECK_TIMEZONE = "Europe/Bratislava";

/** Posledný plánovaný čas kontroly pred `now` (pre ukážkové dáta a texty). */
export function lastCheckTime(now = new Date()): Date {
  const d = new Date(now);
  const h = d.getHours();
  const past = [...CHECK_HOURS].reverse().find((x) => x <= h);
  if (past !== undefined) {
    d.setHours(past, 12, 0, 0);
    if (d > now) d.setHours(past, 0, 0, 0);
    return d;
  }
  d.setDate(d.getDate() - 1);
  d.setHours(CHECK_HOURS[CHECK_HOURS.length - 1], 12, 0, 0);
  return d;
}

export function nextCheckTime(now = new Date()): Date {
  const d = new Date(now);
  const next = CHECK_HOURS.find((x) => x > d.getHours());
  if (next !== undefined) d.setHours(next, 0, 0, 0);
  else {
    d.setDate(d.getDate() + 1);
    d.setHours(CHECK_HOURS[0], 0, 0, 0);
  }
  return d;
}
