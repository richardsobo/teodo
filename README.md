# Teodo

Web na sledovanie cien inzerátov. Používateľ vloží odkaz z bazára (alebo z akéhokoľvek iného webu), Teodo načíta názov, fotky, cenu, lokalitu a popis. Potom 2× denne kontroluje cenu a dá vedieť, keď inzerát zlacnie, zdražie alebo zmizne.

## Stav: krok 1 – frontend s ukážkovými dátami

| Krok | Obsah | Stav |
| --- | --- | --- |
| 1 | Frontend (Next.js) s ukážkovými dátami v prehliadači | ✅ hotovo |
| 2 | Supabase: prihlásenie (e-mail + heslo, Google), databáza, fotky | ⏳ |
| 3 | Sťahovanie a kontrola cien, e-maily (Resend), plánovač | ⏳ |

### Spustenie

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # produkčný build
```

Ukážkový účet: **demo@teodo.sk / Teodo2026**. Akýkoľvek iný e-mail založí nový účet (krok „Vytvor si heslo“). „Pokračovať cez Google“ prihlási ukážkového Google používateľa. Dáta sa ukladajú do `localStorage`, v Nastaveniach ich obnovíš tlačidlom „Obnoviť ukážkové dáta“.

Pri pridávaní inzerátu sa dajú vyskúšať všetky stavy:

- odkaz z bazos.sk / bazos.cz / autobazar.eu → „Našli sme všetko“
- odkaz z iného webu → všeobecné načítanie
- odkaz obsahujúci `bez-ceny` → cenu treba doplniť ručne
- odkaz obsahujúci `chyba` → inzerát sa nepodarí načítať

## Obrazovky

| URL | Čo tam je |
| --- | --- |
| `/` | Úvod pre neprihláseného (vloženie odkazu, cookie lišta) |
| `/prihlasenie` | Prihlásenie v krokoch: e-mail → heslo / nové heslo / Google, zabudnuté heslo, validácia |
| `/prehlad` | Prehľad inzerátov: kategórie, vyhľadávanie, filter a zoradenie, archív, „od poslednej návštevy“ |
| `/inzerat/[id]` | Detail – panel vysúvajúci sa sprava s vlastnou URL (galéria, graf ceny, história, poznámka, upozornenia, úprava, archív) |
| `/pridat` | Pridanie inzerátu v dvoch krokoch; podporuje `?url=` a `?text=` (Zdieľať → Teodo) |
| `/upozornenia` | Zoznam upozornení (na mobile; na desktope rozbaľovacie okno pod zvončekom) |
| `/nastavenia` | Účet, zmena hesla (len pri e-mailovom účte), e-mailové upozornenia, kategórie, zmazanie účtu |
| `/ako-to-funguje`, `/ochrana-udajov`, `/podmienky`, `/kontakt` | Informačné stránky |

Všetko je responzívne (mobil / tablet / desktop). Na mobile: plávajúce „+“, panely zdola, vyhľadávanie pod lupou, v detaile plávajúce „Zobraziť inzerát“.

## Rozhodnutia

- **Kontrola cien 2× denne: o 6:00 a 18:00** (Europe/Bratislava), na serveri rozložená do okna ±30 min, aby sme na jeden web neposlali všetky požiadavky naraz. Ranná kontrola zachytí zmeny z večera, upozornenie príde pred prácou; večerná zachytí zmeny cez deň. Konštanty sú v `src/lib/schedule.ts`.
- **Upozornenia**: predvolene e-mail hneď po kontrole, pri ktorej sa niečo zmenilo. V nastaveniach sa dá prepnúť na denný súhrn alebo e-maily vypnúť. Cieľová cena je voliteľná pri každom inzeráte.
- **Filter** nemá rozsah cien – inzeráty môžu byť v rôznych menách a neprepočítavame ich. Filtruje sa podľa stavu ceny (zlacnené, zdražené, bez zmeny, odstránené) a zoraďuje.
- **Detekciu znovu pridaných inzerátov nerobíme.** Ak predajca inzerát pridá znova, používateľ vloží nový odkaz v úprave a história ceny ostane.
- **Heslo**: pri prihlásení e-mailom je druhý krok heslo (existujúci účet) alebo vytvorenie hesla (nový účet). Pri účte cez Google sa heslo nemení.

## Akýkoľvek web, nielen Bazoš

Dátový model (`src/lib/types.ts`) nie je viazaný na konkrétny bazár. Každý inzerát má `source.support`:

- `adapter` – web, pre ktorý máme vlastný načítavač (`src/lib/sources/registry.ts`; zatiaľ Bazoš a Autobazar.eu),
- `generic` – ostatné weby; načítame ich všeobecne zo štruktúrovaných dát (`src/lib/sources/generic.ts`: schema.org JSON-LD → microdata → Open Graph → `<title>`),
- `manual` – cenu sme nenašli, používateľ ju doplnil ručne a mení ju ručne.

Pridanie podpory nového webu = jeden adaptér v `registry.ts`. Weby bez adaptéra fungujú cez všeobecný načítavač. Facebook zatiaľ nie.

## Štruktúra

```
src/
  app/                    stránky (App Router, Next.js 16)
    (app)/                len pre prihlásených
      (board)/            prehľad + okná nad ním (detail, pridanie)
    (info)/               právne stránky a kontakt
  components/             UI komponenty
  lib/
    store.tsx             ukážkový „backend“ (localStorage) – v kroku 2 ho nahradí Supabase
    sources/              načítanie inzerátov (všeobecné + adaptéry), simulácia pre krok 1
    format.ts             ceny, dátumy, zmeny ceny
    schedule.ts           časy kontrol
scripts/gen-demo-images.mjs   ukážkové ilustrácie do public/demo
```

## Dizajn

Podľa odsúhlaseného plátna „Teodo – návrh webu“: tmavé pozadie `#101217` s jemnou modrou žiarou, primárna modrá `#2A63DB`, odkazy `#4D7FEE`, iba font Plus Jakarta Sans, štítky mätová (pokles) / broskyňová (nárast) / sivá (odstránený). Sklo a rozmazanie len na plávajúcich prvkoch. Hlavička je na vrchu bez pozadia, pri scrollovaní nadol sa skryje a pri scrollovaní nahor sa vráti s tmavým rozmazaným prechodom.

## Neskôr

- texty podmienok a ochrany údajov prejde pred spustením právnik,
- limit inzerátov + malý poplatok alebo reklamy,
- doména (zatiaľ nie je).
