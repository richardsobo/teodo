"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/Icon";
import { FieldError } from "@/components/ui";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { OperatorBox } from "../OperatorBox";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  const { user } = useStore();
  const [form, setForm] = useState({ name: "", email: "", message: "", topic: "Otázka", website: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const email = form.email || user?.email || "";
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: typeof errors = {};
    if (!form.name.trim()) er.name = "Napíš, ako ťa máme osloviť.";
    if (!email.trim()) er.email = "Zadaj e-mail, aby sme ti mohli odpovedať.";
    else if (!EMAIL_RE.test(email.trim())) er.email = "Tento e-mail nevyzerá správne.";
    if (form.message.trim().length < 10) er.message = "Správa je príliš krátka – napíš nám aspoň pár slov.";
    setErrors(er);
    if (Object.keys(er).length) return;
    // pole „website“ vidia len roboty – ak je vyplnené, správu ticho zahodíme
    if (form.website) return setState("sent");
    setState("sending");
    await new Promise((r) => setTimeout(r, 900)); // krok 2: odoslanie cez Resend
    setState("sent");
  }

  return (
    <AnimatePresence mode="wait">
      {state === "sent" ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}
        >
          <span className="how-icon" style={{ background: "rgba(70,222,158,.16)", color: "var(--mint-text)" }}>
            <Icon name="check" />
          </span>
          <h1 className="display" style={{ fontSize: 30 }}>
            Ďakujeme, správa je na ceste
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Odpovieme ti na {email} zvyčajne do dvoch pracovných dní.
          </p>
          <button
            className="btn btn-soft"
            onClick={() => {
              setForm({ name: "", email: "", message: "", topic: "Otázka", website: "" });
              setState("idle");
            }}
          >
            Napísať ďalšiu správu
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <h1 className="display" style={{ fontSize: 30 }}>
              Napíš nám
            </h1>
            <p className="muted" style={{ margin: "12px 0 0" }}>
              Máš nápad na zlepšenie alebo potrebuješ pomôcť? Ozvi sa cez formulár alebo na{" "}
              <a className="link" href="mailto:podpora@teodo.sk">
                podpora@teodo.sk
              </a>
              . Odpovedáme zvyčajne do dvoch pracovných dní.
            </p>
          </div>
          <div>
            <span className="label">Téma</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Otázka", "Problém s webom", "Nápad na zlepšenie", "Osobné údaje"].map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`pill${form.topic === t ? " on" : ""}`}
                  aria-pressed={form.topic === t}
                  onClick={() => setForm((f) => ({ ...f, topic: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="c-web">Web</label>
            <input id="c-web" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="c-name">
              Meno
            </label>
            <div className={`field${errors.name ? " error" : ""}`}>
              <input id="c-name" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} />
            </div>
            <FieldError>{errors.name}</FieldError>
          </div>
          <div>
            <label className="label" htmlFor="c-mail">
              E-mail
            </label>
            <div className={`field${errors.email ? " error" : ""}`}>
              <input
                id="c-mail"
                type="email"
                autoComplete="email"
                value={form.email}
                placeholder={user?.email}
                onChange={set("email")}
                aria-invalid={!!errors.email}
              />
            </div>
            <FieldError>{errors.email}</FieldError>
          </div>
          <div>
            <label className="label" htmlFor="c-msg">
              Správa
            </label>
            <div className={`field textarea${errors.message ? " error" : ""}`}>
              <textarea id="c-msg" rows={6} value={form.message} onChange={set("message")} aria-invalid={!!errors.message} />
            </div>
            <FieldError>{errors.message}</FieldError>
          </div>
          <button className="btn btn-primary btn-lg" style={{ alignSelf: "flex-start" }} disabled={state === "sending"}>
            {state === "sending" ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Icon name="send" size="s" />}
            Odoslať správu
          </button>
          <p className="faint" style={{ margin: "-8px 0 0", fontSize: 12.5, lineHeight: 1.6 }}>
            Meno, e-mail a správu použijeme len na odpoveď a uchováme ich 12 mesiacov. Viac v{" "}
            <Link className="link" href="/ochrana-udajov">
              ochrane osobných údajov
            </Link>
            .
          </p>
          <div style={{ marginTop: 12 }}>
            <h2 className="h3" style={{ marginBottom: 10 }}>
              Prevádzkovateľ
            </h2>
            <OperatorBox />
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
