import type { Metadata } from "next";
import Link from "next/link";
import { OperatorBox } from "../OperatorBox";
import { LEGAL_UPDATED, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Obchodné podmienky" };

export default function Terms() {
  return (
    <article className="prose">
      <header>
        <h1 className="display" style={{ fontSize: 30 }}>
          Obchodné podmienky
        </h1>
        <p className="faint" style={{ fontSize: 13 }}>
          Účinné od {LEGAL_UPDATED}
        </p>
        <p>Tieto podmienky upravujú používanie webu Teodo. Vytvorením účtu s nimi súhlasíš.</p>
      </header>

      <section>
        <h2 className="h3">1. Prevádzkovateľ</h2>
        <OperatorBox />
      </section>

      <section>
        <h2 className="h3">2. Čo Teodo robí</h2>
        <ul>
          <li>Umožňuje uložiť si odkazy na inzeráty z verejne dostupných webov, triediť ich do kategórií a pridávať k nim poznámky.</li>
          <li>Približne dvakrát denne kontroluje ceny uložených inzerátov a upozorní ťa na zlacnenie, zdraženie alebo zmazanie inzerátu.</li>
          <li>Údaje načítava automaticky; pri weboch, ktoré to neumožňujú, ich doplníš ručne a ceny sa nesledujú automaticky.</li>
          <li>
            Služba je zatiaľ bezplatná. Ak by sme v budúcnosti zaviedli spoplatnené funkcie alebo limity, vopred ťa o tom informujeme a nič ti nebudeme účtovať
            bez tvojho súhlasu.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="h3">3. Účet</h2>
        <ul>
          <li>Účet si môže založiť osoba staršia ako 16 rokov. Jeden účet patrí jednej osobe.</li>
          <li>Zodpovedáš za bezpečnosť svojho hesla a za to, čo sa v účte deje. Ak máš podozrenie na zneužitie, daj nám vedieť.</li>
          <li>
            Účet môžeš kedykoľvek zrušiť v{" "}
            <Link className="link" href="/nastavenia#zmazat">
              nastaveniach
            </Link>
            . Zrušením sa natrvalo zmažú aj všetky tvoje inzeráty a história cien.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="h3">4. Inzeráty a obsah tretích strán</h2>
        <ul>
          <li>
            Inzeráty, ich texty a fotky patria ich autorom alebo prevádzkovateľom inzertných portálov. Teodo si ukladá ich kópiu výlučne pre tvoje súkromné
            použitie.
          </li>
          <li>Teodo nie je stranou žiadneho obchodu medzi tebou a predajcom a neručí za stav, pôvod ani dostupnosť ponúkaného tovaru.</li>
          <li>
            Weby navštevujeme šetrne – každý inzerát najviac dvakrát denne a v súlade s ich pravidlami pre automatický prístup (robots.txt). Ak to web
            neumožňuje, inzerát nesledujeme automaticky.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="h3">5. Pravidlá používania</h2>
        <p>
          Teodo nesmieš používať na nezákonnú činnosť, na hromadný automatizovaný zber dát, na obchádzanie obmedzení iných webov ani spôsobom, ktorý by
          preťažoval službu alebo weby, z ktorých inzeráty pochádzajú.
        </p>
        <p>Pri porušení týchto pravidiel môžeme účet po predchádzajúcom upozornení obmedziť alebo zrušiť; pri závažnom porušení aj bez upozornenia.</p>
      </section>

      <section>
        <h2 className="h3">6. Dostupnosť a zodpovednosť</h2>
        <ul>
          <li>Snažíme sa, aby Teodo fungovalo spoľahlivo, no službu poskytujeme tak, ako je, a nevieme zaručiť jej nepretržitú dostupnosť.</li>
          <li>
            Ceny a ďalšie údaje preberáme z cudzích webov, preto nezodpovedáme za ich presnosť a aktuálnosť. Medzi zmenou na webe a upozornením môže byť
            oneskorenie až niekoľko hodín.
          </li>
          <li>
            Nezodpovedáme za ušlé príležitosti ani škody vzniknuté oneskoreným alebo nedoručeným upozornením, pokiaľ nám zákon neukladá inak. Tvoje zákonné
            práva spotrebiteľa tým nie sú dotknuté.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="h3">7. Osobné údaje</h2>
        <p>
          Ako spracúvame tvoje údaje, popisujú zásady{" "}
          <Link className="link" href="/ochrana-udajov">
            ochrany osobných údajov
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="h3">8. Podnety, reklamácie a spory</h2>
        <p>
          Podnety a sťažnosti nám pošli na{" "}
          <a className="link" href={`mailto:${OPERATOR.email}`}>
            {OPERATOR.email}
          </a>
          ; vybavíme ich najneskôr do 30 dní. Ak nie si s vybavením spokojný, môžeš sa ako spotrebiteľ obrátiť na subjekt alternatívneho riešenia sporov,
          napríklad Slovenskú obchodnú inšpekciu (soi.sk).
        </p>
      </section>

      <section>
        <h2 className="h3">9. Zmeny podmienok a záverečné ustanovenia</h2>
        <ul>
          <li>Podmienky môžeme zmeniť. O podstatných zmenách ťa upozorníme e-mailom aspoň 14 dní vopred; ak so zmenou nesúhlasíš, môžeš účet zrušiť.</li>
          <li>Tieto podmienky sa riadia právom Slovenskej republiky.</li>
        </ul>
      </section>
    </article>
  );
}
