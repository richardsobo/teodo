import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Icon, type IconName } from "@/components/Icon";
import { HowCta } from "./HowCta";
import { Faq } from "./Faq";

export const metadata: Metadata = { title: "Ako to funguje?" };

const steps: Array<{ icon: IconName; title: string; text: string; demo?: React.ReactNode }> = [
  {
    icon: "user",
    title: "Prihlás sa",
    text: "Aby sme mali kam ukladať tvoje inzeráty, vytvor si profil. Stačí e-mail s heslom alebo účet Google, zaberie to len chvíľu.",
  },
  {
    icon: "link",
    title: "Vlož odkaz",
    text: "Našiel si niečo zaujímavé? Skopíruj adresu inzerátu a vlož ju sem. Názov, fotky, cenu aj lokalitu načítame sami z väčšiny webov s inzerátmi. Keď niečo nenájdeme, doplníš to ručne.",
    demo: (
      <div className="field" style={{ marginTop: 10, maxWidth: 460, paddingRight: 5, height: 46 }}>
        <span style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", color: "var(--text)" }}>
          https://www.bazos.sk/inzerat/bicykel…
        </span>
        <span className="btn btn-primary btn-sm">Pridať</span>
      </div>
    ),
  },
  {
    icon: "folder",
    title: "Trieď do kategórií",
    text: "Vytvor si vlastné kategórie a maj prehľad o všetkom, čo sleduješ. Kategórie môžeš kedykoľvek premenovať, presúvať alebo zmazať. Ku každému inzerátu si môžeš napísať poznámku.",
    demo: (
      <div style={{ marginTop: 10, maxWidth: 300, display: "flex", flexDirection: "column" }}>
        <span className="nav-item active">
          <span>Autá</span>
          <span className="count">4</span>
        </span>
        <span className="nav-item">
          <span>Byty</span>
          <span className="count">2</span>
        </span>
        <span className="nav-item">
          <span>Bicykle</span>
          <span className="count">7</span>
        </span>
      </div>
    ),
  },
  {
    icon: "trend",
    title: "Sleduj ceny",
    text: "Ceny kontrolujeme dvakrát denne – ráno okolo 6:00 a večer okolo 18:00. Weby tak nezaťažujeme a ty máš prehľad dvakrát za deň. História ceny ukáže, či ide o skutočnú zľavu.",
    demo: (
      <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/marlin-1.svg" alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Horský bicykel</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
            <span className="num" style={{ fontWeight: 700 }}>
              420 €
            </span>
            <span className="old num" style={{ fontSize: 13 }}>
              480 €
            </span>
            <span className="chip chip-down">↓ 60 €</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: "bell",
    title: "Dostaneš upozornenie",
    text: "Pri každej zmene – zlacnení, zdražení aj zmazaní inzerátu – ti pošleme e-mail a upozornenie uvidíš aj v aplikácii. Ak chceš, nastav si cieľovú cenu a ozveme sa zvlášť, keď cena klesne tam, kde ju chceš. Ak ti chodí e-mailov priveľa, prepni si v nastaveniach denný súhrn.",
    demo: (
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        <span className="chip chip-down">↓ Zlacnenie</span>
        <span className="chip chip-up">↑ Zdraženie</span>
        <span className="chip chip-off">Odstránený</span>
        <span className="chip chip-target">Cieľ dosiahnutý</span>
      </div>
    ),
  },
];

const faq: Array<[string, string]> = [
  ["Je Teodo zadarmo?", "Áno. Teodo je zatiaľ zadarmo."],
  [
    "Z ktorých webov to funguje?",
    "Z väčšiny webov s inzerátmi – bazárov, autobazárov aj e-shopov. Čítame štandardné údaje, ktoré stránky zverejňujú pre vyhľadávače, a pri známych weboch aj viac. Ak niečo nenájdeme, doplníš to ručne. Facebook zatiaľ nepodporujeme.",
  ],
  [
    "Čo keď inzerát zmizne?",
    "Dáme ti vedieť. Inzerát ostane v tvojom zozname sivý, so všetkými fotkami a históriou ceny. Ak ho predajca pridá znova, stačí v úprave vložiť nový odkaz.",
  ],
  [
    "Prečo len dvakrát denne?",
    "Bazáry nemajú radi časté automatické návštevy. Každý inzerát stiahneme len raz pri kontrole a rešpektujeme pravidlá webu (robots.txt). Pri ojazdenom aute či bicykli to na zachytenie zľavy úplne stačí.",
  ],
  ["V akej mene sú ceny?", "Vždy v tej, ktorá je v inzeráte – € alebo Kč. Nič neprepočítavame, aby ceny presne sedeli s bazárom."],
  [
    "Čo robíte s mojimi údajmi?",
    "Ukladáme len to, čo Teodo potrebuje na fungovanie – tvoj e-mail, inzeráty a nastavenia. Nič nepredávame a nepoužívame na reklamu. Účet aj všetky údaje si môžeš kedykoľvek zmazať v nastaveniach.",
  ],
];

export default function HowItWorks() {
  return (
    <>
      <main className="t-main">
        <div className="t-wrap how">
          <div className="how-intro rise">
            <h1 className="display" style={{ fontSize: 32 }}>
              Ako to funguje?
            </h1>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Zbav sa neprehľadných záložiek a ulož si inzeráty z rôznych webov na jedno miesto. Ceny postrážime za teba a dáme ti vedieť, keď sa niečo zmení.
            </p>
            <HowCta />
          </div>

          <ol className="how-steps">
            <li aria-hidden="true" className="how-line" />
            {steps.map((s, i) => (
              <li key={s.title} className="how-step rise" style={{ animationDelay: `${120 + i * 90}ms` }}>
                <span className="how-icon">
                  <Icon name={s.icon} />
                </span>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, paddingTop: 2, minWidth: 0 }}>
                  <span className="cap" style={{ color: "var(--link)" }}>
                    Krok {i + 1}
                  </span>
                  <h2 className="h2">{s.title}</h2>
                  <p className="muted" style={{ margin: 0 }}>
                    {s.text}
                  </p>
                  {s.demo}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="t-wrap" style={{ paddingBottom: 96 }}>
          <Faq items={faq} />
        </div>
      </main>
      <Footer />
    </>
  );
}
