import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ochrana osobných údajov" };

export default function Gdpr() {
  return (
    <article className="prose">
      <h1 className="display" style={{ fontSize: 30 }}>
        Ochrana osobných údajov
      </h1>
      <div>
        <h2 className="h3">Aké údaje zbierame?</h2>
        <p>
          Pri registrácii a používaní služby spracúvame tvoje meno, e-mailovú adresu a IP adresu, a to aj pri prihlásení cez Google. Ďalej ukladáme odkazy na
          inzeráty, ktoré si pridáš, ich kategórie a poznámky.
        </p>
      </div>
      <div>
        <h2 className="h3">Na aký účel údaje používame?</h2>
        <p>Na správu tvojho účtu, uloženie tvojich inzerátov a posielanie upozornení o zmenách cien.</p>
      </div>
      <div>
        <h2 className="h3">Tvoje práva</h2>
        <p>
          Údaje uchovávame počas existencie účtu. Účet a všetky súvisiace údaje môžeš kedykoľvek natrvalo zmazať v nastaveniach účtu. Údaje nepredávame tretím
          stranám.
        </p>
      </div>
      <div>
        <h2 className="h3">Analytika a cookies</h2>
        <p>
          Používame Google Analytics. Údaje sú anonymizované a ukladajú sa až po tvojom výslovnom súhlase v cookie lište. Nevyhnutné cookies (prihlásenie,
          nastavenia) používame vždy.
        </p>
      </div>
    </article>
  );
}
