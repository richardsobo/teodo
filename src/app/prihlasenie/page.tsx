"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GoogleIcon, Icon } from "@/components/Icon";
import { FieldError } from "@/components/ui";
import { PasswordField, PasswordRules, passwordValid } from "@/components/PasswordField";
import { useStore } from "@/lib/store";
import { DEMO_ACCOUNT } from "@/lib/demo-data";

type Step = "email" | "password" | "create" | "google" | "reset";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

function Login() {
  const store = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "form" | "google">("");
  const [touchedRules, setTouchedRules] = useState(false);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (store.ready && store.user) router.replace(next);
  }, [store.ready, store.user, next, router]);

  useEffect(() => {
    if (step === "password" || step === "create") setTimeout(() => pwRef.current?.focus(), 250);
  }, [step]);

  const go = (s: Step) => {
    setError(null);
    setConfirmError(null);
    setPassword("");
    setConfirm("");
    setTouchedRules(false);
    setStep(s);
  };

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim();
    if (!v) return setError("Zadaj svoj e-mail.");
    if (!EMAIL_RE.test(v)) return setError("Tento e-mail nevyzerá správne. Skontroluj, či obsahuje @ a doménu.");
    setBusy("form");
    const r = await store.checkEmail(v);
    setBusy("");
    go(r === "existing" ? "password" : r === "google" ? "google" : "create");
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return setError("Zadaj heslo.");
    setBusy("form");
    const r = await store.signIn(email, password);
    setBusy("");
    if (!r.ok) return setError(r.error);
    router.replace(next);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setTouchedRules(true);
    let bad = false;
    if (!passwordValid(password)) {
      setError("Heslo ešte nespĺňa podmienky nižšie.");
      bad = true;
    }
    if (confirm !== password) {
      setConfirmError(confirm ? "Heslá sa nezhodujú." : "Zopakuj heslo pre kontrolu.");
      bad = true;
    }
    if (bad) return;
    setBusy("form");
    await store.signUp(email, password);
    setBusy("");
    router.replace(next);
  }

  async function google() {
    setBusy("google");
    await store.signInWithGoogle();
    setBusy("");
    router.replace(next);
  }

  return (
    <main className="t-main" style={{ minHeight: "100dvh" }}>
      {/* rozmazaný náznak aplikácie v pozadí */}
      <div className="t-wrap only-desktop" aria-hidden="true" style={{ paddingTop: 24, display: "flex", gap: 28, filter: "blur(2px)" }}>
        <div style={{ flex: "0 0 236px" }} />
        <div style={{ flex: 1 }}>
          <div className="h1">Všetky inzeráty</div>
          <div style={{ marginTop: 24, height: 420, border: "1px dashed rgba(255,255,255,.12)", borderRadius: 20 }} />
        </div>
      </div>
      <div className="scrim" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 45 }} />

      <motion.section
        className="float login-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
      >
        <Link className="btn btn-ghost btn-icon btn-sm" href="/" aria-label="Zavrieť" style={{ position: "absolute", top: 14, right: 14 }}>
          <Icon name="close" size="s" />
        </Link>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === "email" ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === "email" ? 24 : -24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {step === "email" && (
              <>
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                  <h1 id="login-title" className="display" style={{ fontSize: 24, lineHeight: 1.25 }}>
                    Začni sledovať ceny
                    <br />
                    inzerátov <span style={{ color: "var(--link)" }}>ešte dnes!</span>
                  </h1>
                  <p className="muted" style={{ margin: 0 }}>
                    Prihlás sa a stráženie cien nechaj na nás.
                  </p>
                </div>
                <form onSubmit={submitEmail} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label className="label" htmlFor="login-mail">
                      E-mail
                    </label>
                    <div className={`field${error ? " error" : ""}`}>
                      <Icon name="mail" size="s" style={{ width: 18, height: 18 }} />
                      <input
                        id="login-mail"
                        type="email"
                        autoComplete="email"
                        placeholder="tvoj@email.sk"
                        autoFocus
                        value={email}
                        aria-invalid={!!error}
                        aria-describedby={error ? "login-err" : undefined}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                      />
                    </div>
                    <FieldError id="login-err">{error}</FieldError>
                  </div>
                  <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={!!busy}>
                    {busy === "form" ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <span>Pokračovať</span>}
                    {busy !== "form" && <Icon name="arrowRight" size="s" />}
                  </button>
                </form>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="faint">
                  <hr className="divider" style={{ flex: 1 }} />
                  <span style={{ fontSize: 13 }}>alebo</span>
                  <hr className="divider" style={{ flex: 1 }} />
                </div>
                <button className="btn btn-soft btn-lg btn-block" onClick={google} disabled={!!busy}>
                  {busy === "google" ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <GoogleIcon />}
                  <span>Pokračovať cez Google</span>
                </button>
                <p className="faint" style={{ margin: "4px 0 0", fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>
                  Pokračovaním súhlasíš s{" "}
                  <Link className="link" href="/podmienky">
                    obchodnými podmienkami
                  </Link>{" "}
                  a{" "}
                  <Link className="link" href="/ochrana-udajov">
                    ochranou osobných údajov
                  </Link>
                  .
                </p>
                <p className="faint" style={{ margin: 0, fontSize: 11.5, textAlign: "center" }}>
                  Ukážkový režim: účet {DEMO_ACCOUNT.email}, heslo {DEMO_ACCOUNT.password}. Iný e-mail založí nový účet.
                </p>
              </>
            )}

            {step === "password" && (
              <form onSubmit={submitPassword} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <StepHead title="Zadaj heslo" email={email} onBack={() => go("email")} />
                <div>
                  <label className="label" htmlFor="login-pw">
                    Heslo
                  </label>
                  <PasswordField
                    ref={pwRef}
                    id="login-pw"
                    autoComplete="current-password"
                    value={password}
                    invalid={!!error}
                    aria-describedby={error ? "pw-err" : undefined}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                  />
                  <FieldError id="pw-err">{error}</FieldError>
                  <button type="button" className="link" style={{ marginTop: 10, fontSize: 13 }} onClick={() => go("reset")}>
                    Zabudol som heslo
                  </button>
                </div>
                <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={!!busy}>
                  {busy ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Prihlásiť sa"}
                </button>
              </form>
            )}

            {step === "create" && (
              <form onSubmit={submitCreate} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <StepHead
                  title="Vytvor si heslo"
                  email={email}
                  onBack={() => go("email")}
                  sub="Tento e-mail u nás ešte nemá účet. Nastav si heslo a môžeš začať."
                />
                <div>
                  <label className="label" htmlFor="new-pw">
                    Nové heslo
                  </label>
                  <PasswordField
                    ref={pwRef}
                    id="new-pw"
                    autoComplete="new-password"
                    value={password}
                    invalid={!!error}
                    aria-describedby="pw-rules"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setTouchedRules(true);
                      setError(null);
                    }}
                  />
                  <FieldError>{error}</FieldError>
                  <div id="pw-rules">{(touchedRules || password) && <PasswordRules value={password} />}</div>
                </div>
                <div>
                  <label className="label" htmlFor="new-pw2">
                    Zopakuj heslo
                  </label>
                  <PasswordField
                    id="new-pw2"
                    autoComplete="new-password"
                    value={confirm}
                    invalid={!!confirmError}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setConfirmError(null);
                    }}
                  />
                  <FieldError>{confirmError}</FieldError>
                </div>
                <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={!!busy}>
                  {busy ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Vytvoriť účet"}
                </button>
              </form>
            )}

            {step === "google" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <StepHead
                  title="Prihlás sa cez Google"
                  email={email}
                  onBack={() => go("email")}
                  sub="Tento účet si vytvoril cez Google, preto nemá heslo. Pokračuj tlačidlom nižšie."
                />
                <button className="btn btn-soft btn-lg btn-block" onClick={google} disabled={!!busy}>
                  {busy ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <GoogleIcon />}
                  <span>Pokračovať cez Google</span>
                </button>
              </div>
            )}

            {step === "reset" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <StepHead
                  title="Skontroluj e-mail"
                  email={email}
                  onBack={() => go("password")}
                  sub="Poslali sme ti odkaz na nastavenie nového hesla. Platí 1 hodinu."
                />
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(42,99,219,.12)",
                    fontSize: 14,
                  }}
                >
                  <Icon name="mail" />
                  <span>Nevidíš ho? Pozri aj priečinok Spam alebo Promo akcie.</span>
                </div>
                <button className="btn btn-ghost btn-block" onClick={() => go("password")}>
                  Späť na prihlásenie
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>
    </main>
  );
}

function StepHead({ title, email, onBack, sub }: { title: string; email: string; onBack: () => void; sub?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onBack} style={{ alignSelf: "flex-start", marginLeft: -10 }}>
        <Icon name="back" size="s" />
        Zmeniť e-mail
      </button>
      <h1 id="login-title" className="display" style={{ fontSize: 24 }}>
        {title}
      </h1>
      <div className="chip chip-soft" style={{ alignSelf: "flex-start", height: 28, fontSize: 13 }}>
        <Icon name="mail" size="s" style={{ width: 14, height: 14 }} />
        {email.trim()}
      </div>
      {sub && (
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function safeNext(n: string | null): string {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/prehlad";
}
