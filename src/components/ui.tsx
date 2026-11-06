"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { useToast } from "@/lib/store";

/* ---------------- media query ---------------- */
export function useMediaQuery(q: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [q]);
  return match;
}
export const useIsMobile = () => useMediaQuery("(max-width: 719px)");

/* ---------------- zámok scrollovania ---------------- */
let locks = 0;
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sb > 0) document.body.style.paddingRight = `${sb}px`;
    return () => {
      locks--;
      if (locks === 0) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    };
  }, [active]);
}

export function useEscape(active: boolean, fn: () => void) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && ref.current();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [active]);
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portál až po pripojení v prehliadači
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/* ---------------- Dialóg: v strede na desktope, panel zdola na mobile ---------------- */
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** skryje nadpis vizuálne, ale ponechá ho pre čítačky */
  hideTitle?: boolean;
  width?: number;
  children: React.ReactNode;
  /** z-index vrstvy (panely nad detailom potrebujú vyššiu) */
  z?: number;
  closeLabel?: string;
}

export function Dialog({ open, onClose, title, hideTitle, width = 440, children, z = 60, closeLabel = "Zavrieť" }: DialogProps) {
  const mobile = useIsMobile();
  const id = useId();
  const drag = useDragControls();
  useScrollLock(open);
  useEscape(open, onClose);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div style={{ position: "fixed", inset: 0, zIndex: z }}>
            <motion.div
              className="scrim"
              style={{ position: "absolute", inset: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? id : undefined}
              className={mobile ? "pop" : "float"}
              style={
                mobile
                  ? {
                      position: "absolute",
                      left: 8,
                      right: 8,
                      bottom: 8,
                      maxHeight: "calc(100dvh - 24px)",
                      overflowY: "auto",
                      borderRadius: 28,
                      padding: "10px 20px 22px",
                    }
                  : {
                      position: "absolute",
                      left: "50%",
                      top: "max(6vh, 40px)",
                      x: "-50%",
                      width: `min(${width}px, calc(100% - 32px))`,
                      maxHeight: "calc(100dvh - max(6vh, 40px) - 24px)",
                      overflowY: "auto",
                      borderRadius: 24,
                      padding: 28,
                    }
              }
              initial={mobile ? { y: "105%" } : { opacity: 0, y: 18, scale: 0.98 }}
              animate={mobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={mobile ? { y: "105%" } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", damping: 32, stiffness: 380 }}
              drag={mobile ? "y" : false}
              dragListener={false}
              dragControls={drag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 600) onClose();
              }}
            >
              {mobile && (
                <div
                  aria-hidden="true"
                  onPointerDown={(e) => drag.start(e)}
                  style={{ margin: "-10px -20px 6px", padding: "10px 0 8px", touchAction: "none", cursor: "grab" }}
                >
                  <span style={{ display: "block", margin: "0 auto", width: 36, height: 5, borderRadius: 999, background: "rgba(255,255,255,.22)" }} />
                </div>
              )}
              {title && (
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}
                  className={hideTitle ? "sr-only" : undefined}
                >
                  <h2 id={id} className="h2">
                    {title}
                  </h2>
                  <button className="btn btn-ghost btn-icon btn-sm" aria-label={closeLabel} onClick={onClose}>
                    <Icon name="close" size="s" />
                  </button>
                </div>
              )}
              {children}
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/* ---------------- Rozbaľovacie okno pri tlačidle (desktop) ---------------- */
export function Popover({
  open,
  onClose,
  children,
  style,
  label,
  className = "float",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(open, onClose);
  useEffect(() => {
    if (!open) return;
    const on = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current?.contains(t) || t.closest("[data-popover-trigger]")) return;
      onClose();
    };
    const id = setTimeout(() => document.addEventListener("click", on), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", on);
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.section
          ref={ref}
          aria-label={label}
          className={className}
          style={{ position: "absolute", zIndex: 50, transformOrigin: "top right", ...style }}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Prepínač ---------------- */
export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={disabled ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
    />
  );
}

/* ---------------- Pole formulára s chybou ---------------- */
export function FieldError({ id, children }: { id?: string; children?: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.p
          id={id}
          role="alert"
          className="field-error"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon name="alert" size="s" style={{ width: 14, height: 14 }} />
          {children}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------------- Hlásenia (toast) ---------------- */
export function Toasts() {
  const { toasts, dismiss } = useToast();
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
        width: "min(440px, calc(100% - 32px))",
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            className="float"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            style={{
              pointerEvents: "auto",
              borderRadius: 14,
              padding: "10px 10px 10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 14,
              width: "100%",
            }}
          >
            <span style={{ flex: 1 }}>{t.text}</span>
            {t.action && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--link)" }}
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button className="btn btn-ghost btn-icon btn-sm" aria-label="Zavrieť hlásenie" onClick={() => dismiss(t.id)}>
              <Icon name="close" size="s" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Obrázok s náhradou ---------------- */
export function Img({ src, alt, className, style }: { src?: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-2)", color: "var(--faint)", ...style }}
      >
        <Icon name="image" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- fotky sú z cudzích webov, optimalizáciu rieši krok 2 (Supabase Storage)
  return <img src={src} alt={alt} className={className} style={style} onError={() => setBroken(true)} loading="lazy" />;
}
