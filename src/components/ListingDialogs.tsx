"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { NewCategoryInline } from "./Categories";
import { Dialog, FieldError, Switch } from "./ui";
import { useStore, useToast } from "@/lib/store";
import { currencySymbol, formatPrice, parseUserNumber } from "@/lib/format";
import { parseListingUrl } from "@/lib/sources/registry";
import type { Listing } from "@/lib/types";

/* ---------------- Upozornenia pre jeden inzerát ---------------- */
export function NotifySettings({ l, onDone }: { l: Listing; onDone?: () => void }) {
  const { updateListing } = useStore();
  const [targetOn, setTargetOn] = useState(l.notify.target != null);
  const [target, setTarget] = useState(l.notify.target != null ? String(l.notify.target) : "");
  const [error, setError] = useState<string | null>(null);

  const saveTarget = (raw: string, on = targetOn) => {
    if (!on) return updateListing(l.id, { notify: { ...l.notify, target: null } });
    const n = parseUserNumber(raw);
    if (raw && n == null) return setError("Zadaj cenu číslom, napr. 14 000.");
    if (n != null && l.price != null && n >= l.price) setError(`Aktuálna cena je ${formatPrice(l.price, l.currency)} – cieľ by už bol splnený.`);
    else setError(null);
    updateListing(l.id, { notify: { ...l.notify, target: n } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 14, lineHeight: 1.45 }}>
          Pri zmene ceny a zmazaní inzerátu
          <span className="faint" style={{ display: "block", fontSize: 12 }}>
            E-mail a upozornenie v aplikácii
          </span>
        </span>
        <Switch
          checked={l.notify.onChange}
          onChange={(v) => updateListing(l.id, { notify: { ...l.notify, onChange: v } })}
          label="Upozornenie pri zmene ceny a zmazaní"
        />
      </div>
      <hr className="divider" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 14 }}>
          Cieľová cena
          <span className="faint" style={{ display: "block", fontSize: 12 }}>
            Nepovinné – ozveme sa zvlášť
          </span>
        </span>
        <Switch
          checked={targetOn}
          onChange={(v) => {
            setTargetOn(v);
            saveTarget(target, v);
          }}
          label="Cieľová cena"
        />
      </div>
      {targetOn && (
        <div style={{ marginTop: -4 }}>
          <div className={`field${error ? " warn" : ""}`} style={{ height: 44 }}>
            <input
              aria-label="Cieľová cena"
              className="num"
              inputMode="decimal"
              placeholder={l.price != null ? String(Math.round(l.price * 0.9)) : "napr. 1 000"}
              value={target}
              autoFocus={l.notify.target == null}
              onChange={(e) => setTarget(e.target.value)}
              onBlur={() => saveTarget(target)}
              onKeyDown={(e) => e.key === "Enter" && saveTarget(target)}
            />
            <span>{currencySymbol(l.currency)}</span>
          </div>
          {error ? <FieldError>{error}</FieldError> : <p className="field-hint">Dáme vedieť, keď cena klesne na túto sumu alebo pod ňu.</p>}
        </div>
      )}
      {onDone && (
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={() => {
            saveTarget(target);
            onDone();
          }}
        >
          Hotovo
        </button>
      )}
    </div>
  );
}

/* ---------------- Úprava inzerátu ---------------- */
export function EditListingDialog({ l, open, onClose }: { l: Listing; open: boolean; onClose: () => void }) {
  const { categories, updateListing, archiveListing, restoreListing, removeListing } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [title, setTitle] = useState(l.title);
  const [url, setUrl] = useState(l.url);
  const [categoryId, setCategoryId] = useState(l.categoryId ?? "");
  const [price, setPrice] = useState(l.price != null ? String(l.price) : "");
  const [errors, setErrors] = useState<{ title?: string; url?: string; price?: string }>({});
  const [confirm, setConfirm] = useState<"" | "archive" | "delete">("");
  const manual = l.source.support === "manual";

  const save = () => {
    const er: typeof errors = {};
    if (!title.trim()) er.title = "Názov nemôže byť prázdny.";
    const u = parseListingUrl(url);
    if (!u.ok) er.url = u.error;
    const p = parseUserNumber(price);
    if (manual && price && p == null) er.price = "Zadaj cenu číslom.";
    setErrors(er);
    if (Object.keys(er).length || !u.ok) return;
    const urlChanged = u.url.href !== l.url;
    const patch: Partial<Listing> = { title: title.trim(), url: u.url.href, categoryId: categoryId || null };
    if (manual && p != null && p !== l.price) {
      patch.price = p;
      patch.history = [...l.history, { at: new Date().toISOString(), price: p }];
    }
    if (urlChanged && l.status === "removed") {
      patch.status = "active";
      patch.removedAt = undefined;
    }
    updateListing(l.id, patch);
    onClose();
    toast.show({ text: urlChanged ? "Uložené. Nový odkaz skontrolujeme pri najbližšej kontrole, história ostáva." : "Zmeny sú uložené." });
  };

  return (
    <>
      <Dialog open={open && !confirm} onClose={onClose} title="Upraviť inzerát" z={70}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label className="label" htmlFor="e-name">
              Názov
            </label>
            <div className={`field${errors.title ? " error" : ""}`}>
              <input id="e-name" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <FieldError>{errors.title}</FieldError>
          </div>
          {manual && (
            <div>
              <label className="label" htmlFor="e-price">
                Cena
              </label>
              <div className={`field${errors.price ? " error" : ""}`}>
                <input id="e-price" className="num" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
                <span>{currencySymbol(l.currency)}</span>
              </div>
              {errors.price ? (
                <FieldError>{errors.price}</FieldError>
              ) : (
                <p className="field-hint">Tento web nevieme sledovať automaticky – zmenu ceny zapíšeme do histórie.</p>
              )}
            </div>
          )}
          <div>
            <label className="label" htmlFor="e-url">
              Odkaz na inzerát
            </label>
            <div className={`field${errors.url ? " error" : ""}`}>
              <input id="e-url" value={url} inputMode="url" onChange={(e) => setUrl(e.target.value)} />
            </div>
            {errors.url ? (
              <FieldError>{errors.url}</FieldError>
            ) : (
              <p className="field-hint">Ak predajca inzerát pridal znova, vlož nový odkaz. História ceny ostane zachovaná.</p>
            )}
          </div>
          <div>
            <span className="label">Kategória</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button type="button" className={`pill${!categoryId ? " on" : ""}`} onClick={() => setCategoryId("")}>
                Bez kategórie
              </button>
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`pill${categoryId === c.id ? " on" : ""}`}
                  onClick={() => setCategoryId(c.id)}
                  aria-pressed={categoryId === c.id}
                >
                  {c.name}
                </button>
              ))}
              <NewCategoryInline asPill onCreated={setCategoryId} />
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-block" onClick={save}>
            Uložiť zmeny
          </button>
          <hr className="divider" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {l.status === "archived" ? (
              <button
                className="btn btn-ghost btn-block"
                onClick={() => {
                  restoreListing(l.id);
                  onClose();
                  toast.show({ text: "Inzerát je späť medzi sledovanými." });
                }}
              >
                <Icon name="refresh" size="s" />
                Obnoviť z archívu
              </button>
            ) : (
              <button className="btn btn-ghost btn-block" onClick={() => setConfirm("archive")}>
                <Icon name="archive" size="s" />
                Presunúť do archívu
              </button>
            )}
            <button className="btn btn-ghost btn-block btn-danger" onClick={() => setConfirm("delete")}>
              <Icon name="trash" size="s" />
              Prestať sledovať inzerát
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog open={open && confirm === "archive"} onClose={() => setConfirm("")} title="Prečo ho archivuješ?" z={72}>
        <p className="muted" style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.6 }}>
          V archíve ostane s fotkami aj históriou ceny, no cenu už nebudeme kontrolovať.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(
            [
              ["bought", "Kúpil som", "bag"],
              ["not-interested", "Nemám záujem", "close"],
            ] as const
          ).map(([reason, label, icon]) => (
            <button
              key={reason}
              className="btn btn-soft btn-lg btn-block"
              style={{ justifyContent: "flex-start" }}
              onClick={() => {
                archiveListing(l.id, reason);
                setConfirm("");
                onClose();
                toast.show({
                  text: reason === "bought" ? "Gratulujeme ku kúpe! Inzerát je v archíve." : "Inzerát je v archíve.",
                  action: { label: "Späť", onClick: () => restoreListing(l.id) },
                });
              }}
            >
              <Icon name={icon} size="s" />
              {label}
            </button>
          ))}
          <button className="btn btn-ghost btn-block" onClick={() => setConfirm("")}>
            Zrušiť
          </button>
        </div>
      </Dialog>

      <Dialog open={open && confirm === "delete"} onClose={() => setConfirm("")} title="Prestať sledovať?" z={72}>
        <p className="muted" style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6 }}>
          Inzerát „{l.title}“ zmažeme z tvojho zoznamu aj s históriou ceny a poznámkou. Toto sa nedá vrátiť. Ak ho chceš len odložiť, presuň ho radšej do
          archívu.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => setConfirm("")}>
            Ponechať
          </button>
          <button
            className="btn btn-soft btn-danger"
            onClick={() => {
              setConfirm("");
              onClose();
              router.push("/prehlad", { scroll: false });
              setTimeout(() => removeListing(l.id), 250);
              toast.show({ text: "Inzerát už nesledujeme." });
            }}
          >
            <Icon name="trash" size="s" />
            Prestať sledovať
          </button>
        </div>
      </Dialog>
    </>
  );
}
