import type { Metadata } from "next";

export const metadata: Metadata = { title: "Obchodné podmienky" };

export default function Terms() {
  return (
    <article className="prose">
      <h1 className="display" style={{ fontSize: 30 }}>
        Obchodné podmienky
      </h1>
      <div>
        <h2 className="h3">Úvodné ustanovenia</h2>
        <p>Teodo slúži na súkromné ukladanie a sledovanie zmien na verejne dostupných inzertných portáloch. Služba sa poskytuje tak, ako je (as-is).</p>
      </div>
      <div>
        <h2 className="h3">Zodpovednosť za údaje</h2>
        <p>
          Prevádzkovateľ nezodpovedá za presnosť, aktuálnosť ani dostupnosť inzerátov a cien zobrazených v aplikácii. Zmeny sa sledujú automaticky dvakrát denne
          a môže dôjsť k technickému oneskoreniu. Prevádzkovateľ nezodpovedá za ušlé príležitosti ani finančné straty vzniknuté pre oneskorenú notifikáciu.
        </p>
      </div>
      <div>
        <h2 className="h3">Pravidlá používania</h2>
        <p>Používateľ sa zaväzuje, že aplikáciu nebude využívať na nezákonnú činnosť ani na hromadný automatizovaný zber dát.</p>
      </div>
    </article>
  );
}
