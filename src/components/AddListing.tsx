"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon";
import { NewCategoryInline } from "./Categories";
import { Dialog, FieldError, Img, Switch } from "./ui";
import { useStore, useToast } from "@/lib/store";
import { useUI } from "@/lib/ui-state";
import { currencySymbol, formatPrice, parseUserNumber } from "@/lib/format";
import { parseListingUrl } from "@/lib/sources/registry";
import { mockFetchListing } from "@/lib/sources/mock-fetch";
import type { ExtractResult } from "@/lib/sources/types";
import type { Listing } from "@/lib/types";

type Step = "link" | "loading" | "review" | "error";

/** Z textu zdieľaného z inej aplikácie vytiahne prvý odkaz. */
function firstUrl(s: string | null): string {
  if (!s) return "";
  return s.match(/https?:\/\/\S+/)?.[0] ?? s;
}

export function AddListing() {
  const store = useStore();
  const ui = useUI();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const initialUrl = firstUrl(params.get("url") ?? params.get("text"));

  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<Step>("link");
  const [url, setUrl] = useState(initialUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [dupId, setDupId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>(() => (ui.category !== "all" && ui.category !== "none" ? ui.category : (store.categories[0]?.id ?? "")));
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [form, setForm] = useState({ title: "", price: "", currency: "EUR", location: "", targetOn: false, target: "" });
  const [errors, setErrors] = useState<{ title?: string; price?: string; target?: string }>({});
  const reqId = useRef(0);
  const autoStarted = useRef(false);

  const close = () => {
    setOpen(false);
    setTimeout(() => router.push("/prehlad", { scroll: false }), 220);
  };

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    const r = parseListingUrl(url);
    if (!r.ok) {
      setUrlError(r.error);
      return;
    }
    const existing = store.listings.find((l) => l.url.replace(/\/$/, "") === r.url.href.replace(/\/$/, ""));
    if (existing) {
      setDupId(existing.id);
      setUrlError("Tento inzerát už sleduješ.");
      return;
    }
    setStep("loading");
    const id = ++reqId.current;
    try {
      const res = await mockFetchListing(r.url);
      if (id !== reqId.current) return;
      setResult(res);
      setForm({
        title: res.data.title ?? "",
        price: res.data.price != null ? String(res.data.price) : "",
        currency: res.data.currency ?? "EUR",
        location: res.data.location ?? "",
        targetOn: false,
        target: "",
      });
      setErrors({});
      setStep("review");
    } catch (err) {
      if (id !== reqId.current) return;
      setFetchError(err instanceof Error ? err.message : "Niečo sa pokazilo.");
      setStep("error");
    }
  }

  // odkaz zo zdieľania alebo z úvodnej stránky načítame hneď
  useEffect(() => {
    if (initialUrl && !autoStarted.current && store.ready) {
      autoStarted.current = true;
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- spustiť iba raz po načítaní
  }, [store.ready]);

  async function paste() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) {
        setUrl(firstUrl(t.trim()));
        setUrlError(null);
        setDupId(null);
      }
    } catch {
      document.getElementById("add-url")?.focus();
      setUrlError("Prehliadač nedovolil prečítať schránku. Vlož odkaz ručne (Ctrl+V / podržať a Vložiť).");
    }
  }

  function save() {
    if (!result) return;
    const er: typeof errors = {};
    if (!form.title.trim()) er.title = "Doplň názov, aby si inzerát spoznal.";
    const price = parseUserNumber(form.price);
    if (form.price && price == null) er.price = "Zadaj cenu číslom, napr. 5 900.";
    if (!form.price && result.data.price == null) er.price = "Doplň cenu, inak nebude s čím porovnávať.";
    const target = form.targetOn ? parseUserNumber(form.target) : null;
    if (form.targetOn && form.target && target == null) er.target = "Zadaj cieľovú cenu číslom.";
    setErrors(er);
    if (Object.keys(er).length) return;

    const now = new Date().toISOString();
    const manual = result.data.price == null;
    const parsed = parseListingUrl(url);
    const listing: Listing = {
      id: `${slug(form.title)}-${Math.random().toString(36).slice(2, 6)}`,
      url: parsed.ok ? parsed.url.href : url,
      source: { domain: result.domain, name: result.sourceName, support: manual ? "manual" : result.support },
      title: form.title.trim(),
      description: result.data.description ?? "",
      images: result.data.images,
      price,
      currency: form.currency,
      location: form.location.trim() || null,
      categoryId: categoryId || null,
      status: "active",
      addedAt: now,
      lastCheckedAt: manual ? null : now,
      history: price != null ? [{ at: now, price }] : [],
      notify: { onChange: true, target },
      note: "",
    };
    store.addListing(listing);
    if (categoryId && ui.category !== "all" && ui.category !== categoryId) ui.setCategory(categoryId);
    if (!categoryId && ui.category !== "all") ui.setCategory("all");
    ui.setStateFilter("all");
    toast.show({
      text: manual ? "Inzerát je uložený. Cenu meníš ručne." : "Hotovo! Cenu postrážime dvakrát denne.",
      action: { label: "Otvoriť", onClick: () => router.push(`/inzerat/${listing.id}`, { scroll: false }) },
    });
    close();
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const title = step === "link" ? "Nový inzerát" : step === "loading" ? "Načítavame inzerát" : step === "error" ? "Inzerát sa nenačítal" : "Skontroluj údaje";

  return (
    <Dialog open={open} onClose={close} title={title} width={460}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === "link" && (
            <form onSubmit={load} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p className="muted" style={{ margin: "-8px 0 0", fontSize: 14 }}>
                Vlož odkaz na inzerát a vyber kategóriu.
              </p>
              <div>
                <label className="label" htmlFor="add-url">
                  Odkaz na inzerát
                </label>
                <div className={`field${urlError ? " error" : ""}`} style={{ paddingRight: 6 }}>
                  <Icon name="link" size="s" />
                  <input
                    id="add-url"
                    autoFocus
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://…"
                    value={url}
                    aria-invalid={!!urlError}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setUrlError(null);
                      setDupId(null);
                    }}
                  />
                  {!url && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={paste}>
                      Vložiť
                    </button>
                  )}
                  {url && (
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Vymazať odkaz" onClick={() => setUrl("")}>
                      <Icon name="close" size="s" />
                    </button>
                  )}
                </div>
                <FieldError>
                  {urlError}
                  {dupId && (
                    <button
                      type="button"
                      className="link"
                      style={{ marginLeft: 4, fontSize: 13 }}
                      onClick={() => router.push(`/inzerat/${dupId}`, { scroll: false })}
                    >
                      Otvoriť
                    </button>
                  )}
                </FieldError>
                {!urlError && <p className="field-hint">Najlepšie funguje s bazos.sk, bazos.cz a autobazar.eu. Ostatné weby skúsime načítať automaticky.</p>}
              </div>
              <div>
                <span className="label">Kategória</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {store.categories.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className={`pill${categoryId === c.id ? " on" : ""}`}
                      aria-pressed={categoryId === c.id}
                      onClick={() => setCategoryId(categoryId === c.id ? "" : c.id)}
                    >
                      {c.name}
                    </button>
                  ))}
                  <NewCategoryInline asPill onCreated={setCategoryId} />
                </div>
              </div>
              <button className="btn btn-primary btn-lg btn-block" type="submit">
                Načítať inzerát
              </button>
              <p className="faint only-mobile" style={{ margin: 0, fontSize: 12, textAlign: "center", lineHeight: 1.5 }}>
                Na Androide môžeš inzerát poslať rovno z bazára cez Zdieľať → Teodo.
              </p>
            </form>
          )}

          {step === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }} aria-busy="true">
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div className="skeleton" style={{ width: 92, height: 70, borderRadius: 12, flex: "none" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <span className="muted" style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Sťahujeme názov, fotky a cenu…
                  </span>
                  <span className="faint" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {safeHost(url)}
                  </span>
                </div>
              </div>
              <div className="skeleton" style={{ height: 48 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="skeleton" style={{ height: 48 }} />
                <div className="skeleton" style={{ height: 48 }} />
              </div>
              <button
                className="btn btn-ghost btn-block"
                onClick={() => {
                  reqId.current++;
                  setStep("link");
                }}
              >
                Zrušiť
              </button>
            </div>
          )}

          {step === "error" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="notice notice-warn">
                <Icon name="alert" size="s" style={{ color: "var(--peach-text)", marginTop: 2 }} />
                <span>{fetchError}</span>
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => load()}>
                <Icon name="refresh" size="s" />
                Skúsiť znova
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => setStep("link")}>
                Upraviť odkaz
              </button>
            </div>
          )}

          {step === "review" && result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {result.data.images[0] ? (
                  <Img src={result.data.images[0]} alt="" style={{ width: 92, height: 70, objectFit: "cover", borderRadius: 12, flex: "none" }} />
                ) : (
                  <div
                    style={{
                      width: 92,
                      height: 70,
                      borderRadius: 12,
                      border: "1px dashed rgba(255,255,255,.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--faint)",
                      flex: "none",
                    }}
                  >
                    <Icon name="image" />
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  {result.missing.length === 0 ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--mint-text)", fontSize: 14, fontWeight: 600 }}>
                      <Icon name="check" size="s" />
                      Našli sme všetko
                    </span>
                  ) : (
                    <span style={{ color: "var(--peach-text)", fontSize: 14, fontWeight: 600 }}>
                      {result.missing.includes("price") ? "Cenu sme nenašli" : "Niektoré údaje chýbajú"}
                    </span>
                  )}
                  <span className="faint" style={{ fontSize: 13 }}>
                    {result.domain}
                    {result.data.images.length > 0 &&
                      ` · ${result.data.images.length} ${result.data.images.length === 1 ? "fotka" : result.data.images.length < 5 ? "fotky" : "fotiek"}`}
                    {result.support === "generic" && " · všeobecné načítanie"}
                  </span>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="a-title">
                  Názov
                </label>
                <div className={`field${errors.title ? " error" : ""}`}>
                  <input id="a-title" value={form.title} onChange={set("title")} />
                </div>
                <FieldError>{errors.title}</FieldError>
              </div>

              <div className="add-grid">
                <div>
                  <label className="label" htmlFor="a-price">
                    Cena
                  </label>
                  <div className={`field${errors.price ? " error" : result.data.price == null ? " warn" : ""}`}>
                    <input
                      id="a-price"
                      className="num"
                      inputMode="decimal"
                      placeholder={result.data.price == null ? "Doplň cenu" : undefined}
                      value={form.price}
                      onChange={set("price")}
                    />
                    {result.data.currency ? (
                      <span>{currencySymbol(form.currency)}</span>
                    ) : (
                      <select aria-label="Mena" value={form.currency} onChange={set("currency")} style={{ flex: "0 0 auto", width: 44 }}>
                        <option value="EUR">€</option>
                        <option value="CZK">Kč</option>
                      </select>
                    )}
                  </div>
                  <FieldError>{errors.price}</FieldError>
                </div>
                <div>
                  <label className="label" htmlFor="a-loc">
                    Lokalita
                  </label>
                  <div className="field">
                    <input id="a-loc" placeholder="Nepovinné" value={form.location} onChange={set("location")} />
                  </div>
                </div>
              </div>

              {result.data.price == null && (
                <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                  Inzerát uložíme, no zmeny ceny na tomto webe zatiaľ nevieme sledovať automaticky. Cenu môžeš neskôr upraviť ručne.
                </p>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: form.targetOn ? 8 : 0 }}>
                  <span className="label" style={{ margin: 0 }}>
                    Cieľová cena{" "}
                    <span className="faint" style={{ fontWeight: 500 }}>
                      (nepovinné)
                    </span>
                  </span>
                  <Switch checked={form.targetOn} onChange={(v) => setForm((f) => ({ ...f, targetOn: v }))} label="Nastaviť cieľovú cenu" />
                </div>
                <AnimatePresence initial={false}>
                  {form.targetOn && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className={`field${errors.target ? " error" : ""}`}>
                        <input
                          aria-label="Cieľová cena"
                          className="num"
                          inputMode="decimal"
                          autoFocus
                          placeholder={parseUserNumber(form.price) ? String(Math.round(parseUserNumber(form.price)! * 0.9)) : ""}
                          value={form.target}
                          onChange={set("target")}
                        />
                        <span>{currencySymbol(form.currency)}</span>
                      </div>
                      {errors.target ? (
                        <FieldError>{errors.target}</FieldError>
                      ) : (
                        <p className="field-hint">
                          Ozveme sa ti, keď cena klesne na túto sumu
                          {parseUserNumber(form.price) ? ` (teraz ${formatPrice(parseUserNumber(form.price), form.currency)})` : ""}.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="btn btn-primary btn-lg btn-block" onClick={save}>
                {result.data.price == null ? "Uložiť inzerát" : "Uložiť a sledovať"}
              </button>
              <button className="btn btn-ghost btn-block" style={{ marginTop: -8 }} onClick={() => setStep("link")}>
                Späť
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Dialog>
  );
}

function slug(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "inzerat"
  );
}

function safeHost(u: string) {
  try {
    return new URL(/^https?:/i.test(u) ? u : `https://${u}`).hostname;
  } catch {
    return u;
  }
}
