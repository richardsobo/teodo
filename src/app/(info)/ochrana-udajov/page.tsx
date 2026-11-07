import type { Metadata } from "next";
import Link from "next/link";
import { OperatorBox } from "../OperatorBox";
import { CookieSettingsButton } from "../CookieSettingsButton";
import { GA_COOKIE_MONTHS, LEGAL_UPDATED, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Ochrana osobných údajov" };

export default function Gdpr() {
  return (
    <article className="prose">
      <header>
        <h1 className="display" style={{ fontSize: 30 }}>
          Ochrana osobných údajov
        </h1>
        <p className="faint" style={{ fontSize: 13 }}>
          Účinné od {LEGAL_UPDATED}
        </p>
        <p>
          Tu nájdeš, aké údaje o tebe Teodo spracúva, prečo, ako dlho a aké máš práva. Píšeme to čo najjednoduchšie – ak by ti niečo nebolo jasné, napíš nám na{" "}
          <a className="link" href={`mailto:${OPERATOR.email}`}>
            {OPERATOR.email}
          </a>
          .
        </p>
      </header>

      <section>
        <h2 className="h3">1. Kto údaje spracúva</h2>
        <p>Prevádzkovateľom osobných údajov podľa nariadenia (EÚ) 2016/679 (GDPR) a zákona č. 18/2018 Z. z. je:</p>
        <OperatorBox />
        <p>Zodpovednú osobu (DPO) sme nevymenovali, pretože to rozsah spracúvania nevyžaduje. Vo všetkých otázkach sa obráť priamo na nás.</p>
      </section>

      <section>
        <h2 className="h3">2. Aké údaje spracúvame</h2>
        <ul>
          <li>
            <strong>Údaje o účte</strong> – e-mail, pri prihlásení cez Google aj meno a profilová fotka z účtu Google. Heslo ukladáme len v zašifrovanej
            (hašovanej) podobe.
          </li>
          <li>
            <strong>Tvoje inzeráty</strong> – odkazy, ktoré pridáš, a údaje z nich (názov, cena, fotky, lokalita, popis), história cien, kategórie, poznámky a
            cieľové ceny.
          </li>
          <li>
            <strong>Nastavenia</strong> – ako a kedy ti máme posielať upozornenia.
          </li>
          <li>
            <strong>Technické údaje</strong> – IP adresa, typ prehliadača a čas prístupu v záznamoch servera (na zabezpečenie a riešenie chýb).
          </li>
          <li>
            <strong>Analytika</strong> – len s tvojím súhlasom: anonymizované údaje o návštevnosti a používaní webu cez Google Analytics.
          </li>
          <li>
            <strong>Správy</strong> – keď nám napíšeš cez kontaktný formulár alebo e-mail, meno, e-mail a obsah správy.
          </li>
        </ul>
        <p>
          Inzeráty pochádzajú z verejne dostupných webov. Ak inzerát obsahuje údaje predajcu (napr. meno alebo telefón v popise), uložíme ich len ako súčasť
          tvojej súkromnej kópie inzerátu a ďalej ich nepoužívame. Predajca nás môže požiadať o ich odstránenie.
        </p>
      </section>

      <section>
        <h2 className="h3">3. Na čo údaje používame a na akom základe</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Účel</th>
                <th>Právny základ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vytvorenie a správa účtu, ukladanie inzerátov, kontrola cien a posielanie upozornení</td>
                <td>plnenie zmluvy – podmienok používania (čl. 6 ods. 1 písm. b) GDPR)</td>
              </tr>
              <tr>
                <td>Zabezpečenie služby, ochrana pred zneužitím, riešenie chýb</td>
                <td>oprávnený záujem (čl. 6 ods. 1 písm. f) GDPR)</td>
              </tr>
              <tr>
                <td>Odpovede na tvoje otázky a podnety</td>
                <td>oprávnený záujem, prípadne plnenie zmluvy</td>
              </tr>
              <tr>
                <td>Meranie návštevnosti (Google Analytics)</td>
                <td>súhlas (čl. 6 ods. 1 písm. a) GDPR), ktorý môžeš kedykoľvek odvolať</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Údaje nepredávame, nepoužívame ich na reklamu a nerobíme na ich základe automatizované rozhodnutia ani profilovanie s právnymi účinkami.</p>
      </section>

      <section>
        <h2 className="h3">4. Komu údaje odovzdávame</h2>
        <p>
          Na prevádzku používame overených poskytovateľov (sprostredkovateľov), ktorí spracúvajú údaje len podľa našich pokynov a na základe zmluvy o
          spracúvaní:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Poskytovateľ</th>
                <th>Na čo</th>
                <th>Kde</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase</td>
                <td>databáza, prihlásenie, ukladanie fotiek</td>
                <td>EÚ (dátové centrum vo Frankfurte)</td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>hosting webu</td>
                <td>EÚ a USA</td>
              </tr>
              <tr>
                <td>Resend</td>
                <td>odosielanie e-mailov s upozorneniami</td>
                <td>USA</td>
              </tr>
              <tr>
                <td>Google</td>
                <td>prihlásenie cez Google; Google Analytics (len so súhlasom)</td>
                <td>EÚ a USA</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Pri prenose do USA sa spoliehame na rozhodnutie Európskej komisie o primeranosti (EU-US Data Privacy Framework) u certifikovaných spoločností a
          doplnkovo na štandardné zmluvné doložky schválené Komisiou. Údaje môžeme poskytnúť aj orgánom verejnej moci, ak nám to ukladá zákon.
        </p>
      </section>

      <section>
        <h2 className="h3">5. Ako dlho údaje uchovávame</h2>
        <ul>
          <li>Údaje o účte, inzeráty a nastavenia – kým máš účet. Po jeho zmazaní ich vymažeme do 30 dní (zo záloh najneskôr do ďalších 30 dní).</li>
          <li>Záznamy servera – najviac 30 dní.</li>
          <li>Správy z kontaktného formulára – 12 mesiacov od vybavenia.</li>
          <li>Údaje v Google Analytics – 14 mesiacov.</li>
        </ul>
      </section>

      <section>
        <h2 className="h3">6. Tvoje práva</h2>
        <p>Máš právo:</p>
        <ul>
          <li>vedieť, aké údaje o tebe máme, a dostať ich kópiu,</li>
          <li>dať opraviť nesprávne údaje,</li>
          <li>
            na vymazanie – účet aj všetky údaje zmažeš sám v{" "}
            <Link className="link" href="/nastavenia#zmazat">
              nastaveniach účtu
            </Link>
            ,
          </li>
          <li>na obmedzenie spracúvania a na prenosnosť údajov,</li>
          <li>namietať proti spracúvaniu na základe oprávneného záujmu,</li>
          <li>kedykoľvek odvolať súhlas s analytikou – bez vplyvu na zákonnosť spracúvania pred odvolaním.</li>
        </ul>
        <p>
          Stačí napísať na{" "}
          <a className="link" href={`mailto:${OPERATOR.email}`}>
            {OPERATOR.email}
          </a>
          . Odpovieme najneskôr do jedného mesiaca. Ak si myslíš, že s údajmi zaobchádzame nesprávne, môžeš podať sťažnosť Úradu na ochranu osobných údajov SR
          (Hraničná 12, 820 07 Bratislava, dataprotection.gov.sk).
        </p>
      </section>

      <section id="cookies">
        <h2 className="h3">7. Cookies</h2>
        <p>
          Cookies sú malé súbory, ktoré si web ukladá v tvojom prehliadači. Nevyhnutné používame vždy, analytické len s tvojím súhlasom. Svoju voľbu môžeš
          kedykoľvek zmeniť: <CookieSettingsButton />.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Názov</th>
                <th>Účel</th>
                <th>Platnosť</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>sb-*-auth-token</code>
                </td>
                <td>nevyhnutné – udržanie prihlásenia (Supabase)</td>
                <td>do odhlásenia</td>
              </tr>
              <tr>
                <td>
                  <code>teodo:*</code> (úložisko prehliadača)
                </td>
                <td>nevyhnutné – tvoja voľba cookies a nastavenia zobrazenia</td>
                <td>12 mesiacov / do vymazania</td>
              </tr>
              <tr>
                <td>
                  <code>_ga</code>
                </td>
                <td>analytické – rozlíšenie návštevníkov (Google Analytics)</td>
                <td>{GA_COOKIE_MONTHS} mesiacov</td>
              </tr>
              <tr>
                <td>
                  <code>_ga_&lt;ID&gt;</code>
                </td>
                <td>analytické – udržanie relácie (Google Analytics)</td>
                <td>{GA_COOKIE_MONTHS} mesiacov</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Google Analytics načítame až po udelení súhlasu. Reklamné funkcie a Google Signals máme vypnuté a údaje nezdieľame na reklamné účely. Súhlas sa ťa
          opýtame znova po 12 mesiacoch alebo pri zmene týchto zásad.
        </p>
      </section>

      <section>
        <h2 className="h3">8. Vek a zmeny zásad</h2>
        <p>Teodo je určené ľuďom od 16 rokov. Ak tieto zásady zmeníme, upozorníme ťa na webe a pri podstatnej zmene aj e-mailom.</p>
      </section>
    </article>
  );
}
