import { OPERATOR, isPlaceholder } from "@/lib/legal";

/** Identifikácia prevádzkovateľa. Nevyplnené údaje sú zvýraznené, aby sa nezabudli doplniť. */
export function OperatorBox() {
  const rows: Array<[string, string]> = [
    ["Prevádzkovateľ", OPERATOR.name],
    ["Adresa", OPERATOR.address],
    ["IČO", OPERATOR.ico],
    ["Registrácia", OPERATOR.register],
    ["E-mail", OPERATOR.email],
  ];
  return (
    <dl className="operator-box">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd className={isPlaceholder(v) ? "placeholder" : undefined}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
