"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { GoogleIcon, Icon } from "@/components/Icon";
import { CategoryEditor } from "@/components/Categories";
import { PasswordField, PasswordRules, passwordValid } from "@/components/PasswordField";
import { Dialog, FieldError, Switch } from "@/components/ui";
import { useStore, useToast } from "@/lib/store";
import { CHECK_HOURS } from "@/lib/schedule";

const SECTIONS = [
  ["ucet", "Účet"],
  ["heslo", "Heslo"],
  ["upozornenia", "Upozornenia"],
  ["kategorie", "Kategórie"],
  ["zmazat", "Zmazanie účtu"],
] as const;

export default function SettingsPage() {
  const store = useStore();
  const [active, setActive] = useState("ucet");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    const on = () => {
      let cur: string = SECTIONS[0][0];
      for (const [id] of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = id;
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = SECTIONS[SECTIONS.length - 1][0];
      setActive(cur);
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (!store.user) return null;

  return (
    <>
      <main className="t-main">
        <div className="t-wrap settings">
          <nav className="settings-nav" aria-label="Sekcie nastavení">
            <h1 className="h1" style={{ padding: "0 12px 12px" }}>
              Nastavenia
            </h1>
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={`nav-item${active === id ? " active" : ""}`}>
                <span>{label}</span>
              </a>
            ))}
          </nav>
          <div className="settings-body">
            <AccountSection />
            <PasswordSection />
            <NotificationSection />
            <section id="kategorie" className="settings-card rise">
              <h2 className="h2">Kategórie</h2>
              <p className="muted settings-sub">Premenuj, presuň alebo zmaž kategórie. Inzeráty zo zmazanej kategórie ostanú medzi všetkými inzerátmi.</p>
              <div style={{ maxWidth: 420 }}>
                <CategoryEditor />
              </div>
            </section>
            <DeleteSection />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function AccountSection() {
  const { user, signOut, resetDemo } = useStore();
  const router = useRouter();
  const toast = useToast();
  if (!user) return null;
  return (
    <section id="ucet" className="settings-card rise">
      <h2 className="h2">Účet</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
        <span className="avatar" style={{ width: 48, height: 48, fontSize: 18 }}>
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
          <div className="faint" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {user.provider === "google" ? (
              <>
                <GoogleIcon /> Prihlásenie cez Google
              </>
            ) : (
              <>
                <Icon name="mail" size="s" /> Prihlásenie e-mailom a heslom
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
        <button
          className="btn btn-soft"
          onClick={() => {
            signOut();
            router.push("/");
          }}
        >
          <Icon name="logout" size="s" />
          Odhlásiť sa
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            resetDemo();
            toast.show({ text: "Ukážkové dáta sú obnovené." });
          }}
          title="Len v ukážkovom režime (krok 1)"
        >
          <Icon name="refresh" size="s" />
          Obnoviť ukážkové dáta
        </button>
      </div>
    </section>
  );
}

function PasswordSection() {
  const { user, changePassword } = useStore();
  const toast = useToast();
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [errors, setErrors] = useState<{ cur?: string; pw?: string; pw2?: string }>({});
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  if (user.provider === "google") {
    return (
      <section id="heslo" className="settings-card rise">
        <h2 className="h2">Heslo</h2>
        <p className="muted settings-sub">Prihlasuješ sa cez Google, takže heslo u nás nemáš. Zmeníš ho priamo vo svojom účte Google.</p>
      </section>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: typeof errors = {};
    if (!cur) er.cur = "Zadaj súčasné heslo.";
    if (!passwordValid(pw)) er.pw = "Nové heslo ešte nespĺňa podmienky.";
    else if (pw === cur) er.pw = "Nové heslo je rovnaké ako súčasné.";
    if (pw2 !== pw) er.pw2 = "Heslá sa nezhodujú.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const r = await changePassword(cur, pw);
    setBusy(false);
    if (!r.ok) return setErrors({ cur: r.error });
    setCur("");
    setPw("");
    setPw2("");
    toast.show({ text: "Heslo je zmenené." });
  }

  return (
    <section id="heslo" className="settings-card rise">
      <h2 className="h2">Zmeniť heslo</h2>
      <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420, marginTop: 16 }}>
        <div>
          <label className="label" htmlFor="s-cur">
            Súčasné heslo
          </label>
          <PasswordField
            id="s-cur"
            autoComplete="current-password"
            value={cur}
            invalid={!!errors.cur}
            onChange={(e) => (setCur(e.target.value), setErrors((x) => ({ ...x, cur: undefined })))}
          />
          <FieldError>{errors.cur}</FieldError>
        </div>
        <div>
          <label className="label" htmlFor="s-new">
            Nové heslo
          </label>
          <PasswordField
            id="s-new"
            autoComplete="new-password"
            value={pw}
            invalid={!!errors.pw}
            onChange={(e) => (setPw(e.target.value), setErrors((x) => ({ ...x, pw: undefined })))}
          />
          <FieldError>{errors.pw}</FieldError>
          {pw && <PasswordRules value={pw} />}
        </div>
        <div>
          <label className="label" htmlFor="s-new2">
            Zopakuj nové heslo
          </label>
          <PasswordField
            id="s-new2"
            autoComplete="new-password"
            value={pw2}
            invalid={!!errors.pw2}
            onChange={(e) => (setPw2(e.target.value), setErrors((x) => ({ ...x, pw2: undefined })))}
          />
          <FieldError>{errors.pw2}</FieldError>
        </div>
        <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={busy}>
          {busy ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Uložiť nové heslo"}
        </button>
      </form>
    </section>
  );
}

function NotificationSection() {
  const { settings, updateSettings } = useStore();
  const mode = settings.emailDigest ? "digest" : settings.emailInstant ? "instant" : "off";
  const options = [
    ["instant", "Hneď pri zmene", `Po každej kontrole (${CHECK_HOURS.map((h) => `${h}:00`).join(" a ")}), pri ktorej sa niečo zmenilo.`],
    ["digest", "Denný súhrn", "Jeden e-mail večer po kontrole o 18:00 so všetkými zmenami za deň."],
    ["off", "Nechcem e-maily", "Zmeny uvidíš len v aplikácii pod zvončekom."],
  ] as const;
  return (
    <section id="upozornenia" className="settings-card rise">
      <h2 className="h2">Upozornenia</h2>
      <p className="muted settings-sub">
        Ceny kontrolujeme dvakrát denne, ráno o {CHECK_HOURS[0]}:00 a večer o {CHECK_HOURS[1]}:00. Predvolene ťa upozorníme pri každej zmene – zlacnení,
        zdražení aj zmazaní inzerátu. Cieľovú cenu si nastavíš pri konkrétnom inzeráte.
      </p>
      <fieldset style={{ border: 0, padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <legend className="label">E-mailové upozornenia</legend>
        {options.map(([k, title, desc]) => (
          <label key={k} className={`radio-card${mode === k ? " on" : ""}`}>
            <input
              type="radio"
              name="email-mode"
              checked={mode === k}
              onChange={() => updateSettings({ emailInstant: k === "instant", emailDigest: k === "digest" })}
            />
            <span>
              <span style={{ fontWeight: 600, display: "block" }}>{title}</span>
              <span className="faint" style={{ fontSize: 13 }}>
                {desc}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 20, maxWidth: 560 }}>
        <span>
          <span style={{ fontWeight: 600, display: "block" }}>Upozorniť aj na zdraženie</span>
          <span className="faint" style={{ fontSize: 13 }}>
            Zlacnenie a zmazanie inzerátu ti oznámime vždy.
          </span>
        </span>
        <Switch checked={settings.notifyIncrease} onChange={(v) => updateSettings({ notifyIncrease: v })} label="Upozorniť aj na zdraženie" />
      </div>
    </section>
  );
}

function DeleteSection() {
  const { user, deleteAccount, listings } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  return (
    <section id="zmazat" className="settings-card rise" style={{ borderColor: "rgba(255,122,122,.18)" }}>
      <h2 className="h2">Zmazanie účtu</h2>
      <p className="muted settings-sub">
        Natrvalo zmažeme tvoj účet, všetky sledované inzeráty ({listings.length}), históriu cien, kategórie a poznámky. Toto sa nedá vrátiť.
      </p>
      <button className="btn btn-soft btn-danger" style={{ marginTop: 16 }} onClick={() => setOpen(true)}>
        <Icon name="trash" size="s" />
        Zmazať účet
      </button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setText("");
          setError(null);
        }}
        title="Naozaj zmazať účet?"
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim().toUpperCase() !== "ZMAZAŤ") return setError("Pre potvrdenie napíš ZMAZAŤ.");
            deleteAccount();
            router.push("/");
          }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Zmažeme účet <strong style={{ color: "var(--text)" }}>{user.email}</strong> so všetkými údajmi. Ak to myslíš vážne, napíš{" "}
            <strong style={{ color: "var(--text)" }}>ZMAZAŤ</strong>.
          </p>
          <div>
            <div className={`field${error ? " error" : ""}`}>
              <input aria-label="Potvrdenie zmazania" value={text} autoFocus onChange={(e) => (setText(e.target.value), setError(null))} placeholder="ZMAZAŤ" />
            </div>
            <FieldError>{error}</FieldError>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Ponechať účet
            </button>
            <button className="btn btn-soft btn-danger">Natrvalo zmazať</button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
