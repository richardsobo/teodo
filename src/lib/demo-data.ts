import type { AppNotification, Category, Listing, PricePoint } from "./types";
import { lastCheckTime } from "./schedule";

/** Ukážkové dáta pre krok 1 (frontend bez databázy). Dátumy sú relatívne k dnešku. */

const imgs = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `/demo/${slug}-${i + 1}.svg`);

function at(daysAgo: number, hour: number, minute = 12, base = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const DEMO_CATEGORIES: Category[] = [
  { id: "c-auta", name: "Autá" },
  { id: "c-bicykle", name: "Bicykle" },
  { id: "c-elektronika", name: "Elektronika" },
];

export function buildDemoListings(now = new Date()): Listing[] {
  const check = lastCheckTime(now).toISOString();
  const h = (pts: Array<[number, number, number]>): PricePoint[] => pts.map(([d, hr, p]) => ({ at: at(d, hr, 12, now), price: p }));

  return [
    {
      id: "toyota-camry-2006",
      url: "https://auto.bazos.sk/inzerat/172449812/toyota-camry-24-vvt-i-2006.php",
      source: { domain: "auto.bazos.sk", name: "Bazoš", support: "adapter" },
      title: "Toyota Camry 2.4 VVT-i, 2006, 198 000 km",
      description:
        "Predám Toyota Camry 2.4 VVT-i, rok 2006, najazdených 198 000 km. Automatická prevodovka, kožený interiér, servisná knižka. STK a EK do 2027. Auto je v dobrom technickom stave, pravidelne servisované, nefajčiarske. Pri rýchlom jednaní dohoda možná.",
      images: imgs("camry", 6),
      price: 5400,
      currency: "EUR",
      location: "Nitra",
      categoryId: "c-auta",
      status: "active",
      addedAt: at(14, 19, 40, now),
      lastCheckedAt: check,
      history: [
        ...h([
          [14, 19, 5900],
          [6, 6, 5650],
        ]),
        { at: check, price: 5400 },
      ],
      notify: { onChange: true, target: 5500 },
      note: "",
    },
    {
      id: "trek-domane-al",
      url: "https://www.bazos.cz/inzerat/183311207/trek-domane-al.php",
      source: { domain: "bazos.cz", name: "Bazoš", support: "adapter" },
      title: "Trek Domane AL cestný bicykel, karbónová vidlica",
      description:
        "Cestný bicykel Trek Domane AL, karbónová vidlica, 11-prevodové radenie Shimano 105. Rám veľkosť 56, veľmi dobrý stav, pár najazdených kilometrov, pravidelne servisovaný. Nové plášte Continental GP5000, pedále Shimano SPD-SL v cene. Pri rýchlom jednaní zľava.",
      images: imgs("domane", 6),
      price: 15000,
      currency: "CZK",
      location: "Brno",
      categoryId: "c-bicykle",
      status: "active",
      addedAt: at(39, 18, 2, now),
      lastCheckedAt: check,
      history: h([
        [39, 18, 16500],
        [37, 6, 15900],
        [4, 18, 15000],
      ]),
      notify: { onChange: true, target: 14000 },
      note: "Predajca hovoril, že pri osobnom odbere spustí ešte 500 Kč.",
    },
    {
      id: "bmw-520d-touring",
      url: "https://www.autobazar.eu/detail/bmw-rad-5-touring-520d-m-paket/31128876/",
      source: { domain: "autobazar.eu", name: "Autobazar.eu", support: "adapter" },
      title: "BMW 520d Touring M-paket, 2018",
      description:
        "BMW 520d xDrive Touring, M-paket, 140 kW, automat, 2018, 146 000 km. Panoráma, head-up displej, ťažné zariadenie, LED svetlá. Kúpené na Slovensku, prvý majiteľ, kompletná servisná história v BMW.",
      images: imgs("bmw", 5),
      price: 21900,
      currency: "EUR",
      location: "Žilina",
      categoryId: "c-auta",
      status: "active",
      addedAt: at(20, 6, 30, now),
      lastCheckedAt: check,
      history: h([
        [20, 6, 21780],
        [5, 6, 21900],
      ]),
      notify: { onChange: true, target: null },
      note: "",
    },
    {
      id: "skoda-octavia-combi",
      url: "https://www.autobazar.eu/detail/skoda-octavia-combi-2-0-tdi-style/31201543/",
      source: { domain: "autobazar.eu", name: "Autobazar.eu", support: "adapter" },
      title: "Škoda Octavia Combi 2.0 TDI Style, 2019",
      description:
        "Škoda Octavia Combi 2.0 TDI 110 kW, DSG, Style, 2019, 121 000 km. Virtuálny kokpit, Canton, adaptívny tempomat, zimné pneumatiky na diskoch. Garážované, nehavarované.",
      images: imgs("octavia", 5),
      price: 16900,
      currency: "EUR",
      location: "Trnava",
      categoryId: "c-auta",
      status: "active",
      addedAt: at(9, 21, 5, now),
      lastCheckedAt: check,
      history: h([[9, 21, 16900]]),
      notify: { onChange: true, target: 15500 },
      note: "",
    },
    {
      id: "trek-marlin",
      url: "https://www.bazos.sk/inzerat/171988021/trek-marlin-horsky-bicykel-m.php",
      source: { domain: "bazos.sk", name: "Bazoš", support: "adapter" },
      title: "Trek Marlin horský bicykel, veľkosť M",
      description: 'Horský bicykel Trek Marlin 5, veľkosť M, 29" kolesá, hydraulické brzdy. Používaný jednu sezónu.',
      images: imgs("marlin", 4),
      price: 320,
      currency: "EUR",
      location: "Bratislava",
      categoryId: "c-bicykle",
      status: "removed",
      addedAt: at(30, 18, 40, now),
      lastCheckedAt: check,
      removedAt: at(16, 6, 12, now),
      history: h([
        [30, 18, 360],
        [22, 18, 320],
      ]),
      notify: { onChange: true, target: null },
      note: "",
    },
    {
      id: "sony-wh-1000xm5",
      url: "https://elektro.bazos.sk/inzerat/173002118/sony-wh-1000xm5.php",
      source: { domain: "elektro.bazos.sk", name: "Bazoš", support: "adapter" },
      title: "Sony WH-1000XM5 bezdrôtové slúchadlá, čierne",
      description: "Slúchadlá Sony WH-1000XM5 s aktívnym potlačením hluku. Kúpené v máji, záruka do 2028, kompletné balenie aj s puzdrom.",
      images: imgs("sony", 4),
      price: 219,
      currency: "EUR",
      location: "Košice",
      categoryId: "c-elektronika",
      status: "active",
      addedAt: at(11, 18, 20, now),
      lastCheckedAt: at(1, 18, 12, now),
      checkError: "Web pri poslednej kontrole neodpovedal.",
      history: h([
        [11, 18, 240],
        [3, 6, 219],
      ]),
      notify: { onChange: true, target: 190 },
      note: "",
    },
    {
      id: "lenovo-legion-5",
      url: "https://www.sbazar.cz/uzivatel/herni-notebook-lenovo-legion-5",
      source: { domain: "sbazar.cz", name: "sbazar.cz", support: "manual" },
      title: "Herný notebook Lenovo Legion 5, RTX 3060",
      description: "Lenovo Legion 5, Ryzen 7 5800H, RTX 3060 6 GB, 16 GB RAM, 1 TB SSD, displej 165 Hz.",
      images: imgs("legion", 3),
      price: 18500,
      currency: "CZK",
      location: "Praha",
      categoryId: "c-elektronika",
      status: "active",
      addedAt: at(2, 20, 41, now),
      lastCheckedAt: null,
      history: h([[2, 20, 18500]]),
      notify: { onChange: true, target: null },
      note: "",
    },
    {
      id: "iphone-15-pro",
      url: "https://mobil.bazos.sk/inzerat/173554001/iphone-15-pro-256-gb.php",
      source: { domain: "mobil.bazos.sk", name: "Bazoš", support: "adapter" },
      title: "iPhone 15 Pro 256 GB",
      description: "",
      images: imgs("iphone", 1),
      price: null,
      currency: "EUR",
      location: null,
      categoryId: "c-elektronika",
      status: "pending",
      addedAt: new Date(now.getTime() - 60_000).toISOString(),
      lastCheckedAt: null,
      history: [],
      notify: { onChange: true, target: null },
      note: "",
    },
    {
      id: "apple-watch-se",
      url: "https://mobil.bazos.sk/inzerat/170111882/apple-watch-se-44mm.php",
      source: { domain: "mobil.bazos.sk", name: "Bazoš", support: "adapter" },
      title: "Apple Watch SE 44 mm, 2. generácia",
      description: "Hodinky Apple Watch SE 2. gen, 44 mm, GPS, batéria 96 %. Ako nové.",
      images: imgs("watch", 3),
      price: 150,
      currency: "EUR",
      location: "Prešov",
      categoryId: "c-elektronika",
      status: "archived",
      archiveReason: "bought",
      addedAt: at(45, 18, 5, now),
      lastCheckedAt: at(25, 6, 12, now),
      history: h([
        [45, 18, 180],
        [33, 6, 165],
        [27, 18, 150],
      ]),
      notify: { onChange: true, target: 150 },
      note: "Kúpené, odovzdanie na stanici.",
    },
  ];
}

export function buildDemoNotifications(listings: Listing[]): AppNotification[] {
  const byId = (id: string) => listings.find((l) => l.id === id)!;
  const camry = byId("toyota-camry-2006");
  const domane = byId("trek-domane-al");
  const bmw = byId("bmw-520d-touring");
  const marlin = byId("trek-marlin");
  const sony = byId("sony-wh-1000xm5");
  return [
    { id: "n1", listingId: camry.id, kind: "target", at: camry.history.at(-1)!.at, price: 5400, previous: 5650, read: false },
    { id: "n2", listingId: domane.id, kind: "down", at: domane.history.at(-1)!.at, price: 15000, previous: 15900, read: false },
    { id: "n3", listingId: bmw.id, kind: "up", at: bmw.history.at(-1)!.at, price: 21900, previous: 21780, read: true },
    { id: "n4", listingId: sony.id, kind: "down", at: sony.history.at(-1)!.at, price: 219, previous: 240, read: true },
    { id: "n5", listingId: marlin.id, kind: "removed", at: marlin.removedAt!, read: true },
  ].sort((a, b) => b.at.localeCompare(a.at)) as AppNotification[];
}

/** Ukážkový účet pre prihlásenie e-mailom. */
export const DEMO_ACCOUNT = { email: "demo@teodo.sk", password: "Teodo2026", name: "Demo" };

export function daysAgoIso(days: number, now = new Date()): string {
  return new Date(now.getTime() - days * 86_400_000).toISOString();
}
