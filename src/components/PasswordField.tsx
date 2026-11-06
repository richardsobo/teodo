"use client";

import { forwardRef, useState } from "react";
import { Icon } from "./Icon";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField({ invalid, ...rest }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className={`field${invalid ? " error" : ""}`} style={{ paddingRight: 6 }}>
      <Icon name="lock" size="s" style={{ width: 18, height: 18 }} />
      <input ref={ref} type={show ? "text" : "password"} aria-invalid={invalid} {...rest} />
      <button
        type="button"
        className="btn btn-ghost btn-icon btn-sm"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Skryť heslo" : "Zobraziť heslo"}
        aria-pressed={show}
      >
        <Icon name={show ? "eyeOff" : "eye"} size="s" />
      </button>
    </div>
  );
});

export const PASSWORD_RULES = [
  { id: "len", text: "Aspoň 8 znakov", test: (p: string) => p.length >= 8 },
  { id: "num", text: "Aspoň jedna číslica", test: (p: string) => /\d/.test(p) },
  { id: "let", text: "Aspoň jedno písmeno", test: (p: string) => /\p{L}/u.test(p) },
];

export function passwordValid(p: string) {
  return PASSWORD_RULES.every((r) => r.test(p));
}

export function PasswordRules({ value }: { value: string }) {
  return (
    <ul style={{ listStyle: "none", margin: "10px 2px 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 12.5 }}>
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(value);
        return (
          <li key={r.id} style={{ display: "flex", alignItems: "center", gap: 6, color: ok ? "var(--mint-text)" : "var(--faint)", transition: "color .2s" }}>
            <Icon name="check" size="s" style={{ width: 14, height: 14, opacity: ok ? 1 : 0.4 }} />
            {r.text}
          </li>
        );
      })}
    </ul>
  );
}
