"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { FieldError } from "./ui";
import { parseListingUrl } from "@/lib/sources/registry";

/** Prázdny stav / úvod pre neprihláseného: vloženie odkazu a tri kroky. */
export function EmptyHero({ guest }: { guest: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parseListingUrl(url);
    if (!r.ok) return setError(r.error);
    const target = `/pridat?url=${encodeURIComponent(r.url.href)}`;
    router.push(guest ? `/prihlasenie?next=${encodeURIComponent(target)}` : target, { scroll: false });
  };

  return (
    <div className="empty-hero rise">
      <h2 className="display" style={{ fontSize: "clamp(22px, 3vw, 28px)", maxWidth: 640 }}>
        Zatiaľ nesleduješ žiadny inzerát
      </h2>
      <p className="muted" style={{ margin: 0, maxWidth: 520 }}>
        Vlož odkaz na inzerát z bazára. Postrážime jeho cenu a dáme ti vedieť, keď zlacnie, zdražie alebo zmizne.
      </p>
      <form onSubmit={submit} noValidate style={{ marginTop: 14, width: "100%", maxWidth: 620 }}>
        <div className="hero-form">
          <label className={`field${error ? " error" : ""}`} style={{ flex: 1, height: 50 }}>
            <Icon name="link" />
            <input
              placeholder="https://www.bazos.sk/inzerat/…"
              aria-label="Odkaz na inzerát"
              aria-invalid={!!error}
              aria-describedby={error ? "hero-err" : undefined}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              inputMode="url"
              autoComplete="off"
            />
          </label>
          <button className="btn btn-primary btn-lg" type="submit">
            Sledovať
          </button>
        </div>
        <div style={{ textAlign: "left" }}>
          <FieldError id="hero-err">{error}</FieldError>
        </div>
      </form>
      <p className="faint" style={{ margin: 0, fontSize: 13 }}>
        Funguje s väčšinou webov s inzerátmi · zadarmo
      </p>

      <ol className="hero-steps">
        {[
          ["link", "Vložíš odkaz"],
          ["trend", "Dvakrát denne strážime cenu"],
          ["bell", "Pri zmene ti dáme vedieť"],
        ].map(([icon, text], i) => (
          <li key={text} className="rise" style={{ animationDelay: `${200 + i * 90}ms` }}>
            <span className="hero-step-icon">
              <Icon name={icon as "link"} size="s" />
            </span>
            {text}
          </li>
        ))}
      </ol>
      <Link className="link" href="/ako-to-funguje" style={{ marginTop: 18, fontSize: 14 }}>
        Ako to funguje?
      </Link>
    </div>
  );
}
