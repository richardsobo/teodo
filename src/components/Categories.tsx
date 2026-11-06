"use client";

import { Reorder, AnimatePresence, motion, useDragControls } from "motion/react";
import { useState } from "react";
import { Icon } from "./Icon";
import { Dialog, FieldError } from "./ui";
import { useStore, useToast } from "@/lib/store";
import { useUI } from "@/lib/ui-state";
import { plural } from "@/lib/format";
import type { Category } from "@/lib/types";

export function useCategoryCounts() {
  const { listings, categories } = useStore();
  const active = listings.filter((l) => l.status !== "archived");
  return {
    all: active.length,
    archive: listings.filter((l) => l.status === "archived").length,
    none: active.filter((l) => !l.categoryId || !categories.some((c) => c.id === l.categoryId)).length,
    by: (id: string) => active.filter((l) => l.categoryId === id).length,
  };
}

export function validateCategoryName(name: string, categories: Category[], exceptId?: string): string | null {
  const n = name.trim();
  if (!n) return "Napíš názov kategórie.";
  if (n.length > 40) return "Názov je príliš dlhý (max. 40 znakov).";
  if (categories.some((c) => c.id !== exceptId && c.name.toLocaleLowerCase("sk") === n.toLocaleLowerCase("sk"))) return "Takú kategóriu už máš.";
  return null;
}

/* ---------------- Bočná navigácia (desktop) ---------------- */
export function CategoryNav() {
  const { categories } = useStore();
  const ui = useUI();
  const counts = useCategoryCounts();
  const [editing, setEditing] = useState(false);

  const item = (key: string, label: React.ReactNode, n: number, extra?: React.ReactNode) => (
    <button
      key={key}
      className={`nav-item${ui.category === key ? " active" : ""}`}
      onClick={() => ui.setCategory(key)}
      aria-current={ui.category === key ? "true" : undefined}
    >
      <span>
        {extra}
        {label}
      </span>
      <span className="count">{n}</span>
    </button>
  );

  return (
    <nav aria-label="Kategórie" className="board-side">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 8px 12px", minHeight: 40 }}>
        <span className="cap">Kategórie</span>
        <button
          className={`btn btn-ghost btn-sm${editing ? "" : " btn-icon"}`}
          aria-label={editing ? "Hotovo" : "Upraviť kategórie"}
          aria-pressed={editing}
          onClick={() => setEditing((e) => !e)}
          style={editing ? { color: "var(--link)" } : undefined}
        >
          {editing ? "Hotovo" : <Icon name="edit" size="s" />}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <CategoryEditor />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {item("all", "Všetky inzeráty", counts.all)}
            {categories.map((c) => item(c.id, c.name, counts.by(c.id)))}
            {counts.none > 0 && item("none", "Bez kategórie", counts.none)}
            <NewCategoryInline />
            {counts.archive > 0 && (
              <>
                <hr className="divider" style={{ margin: "10px 12px", width: "auto" }} />
                {item("archive", "Archív", counts.archive, <Icon name="archive" size="s" />)}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ---------------- Pridanie kategórie (inline) ---------------- */
export function NewCategoryInline({ onCreated, asPill }: { onCreated?: (id: string) => void; asPill?: boolean }) {
  const { categories, addCategory } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const err = validateCategoryName(name, categories);
    if (err) return setError(err);
    const id = addCategory(name);
    setName("");
    setOpen(false);
    onCreated?.(id);
  };

  if (!open) {
    return asPill ? (
      <button type="button" className="pill dashed" onClick={() => setOpen(true)}>
        + Nová
      </button>
    ) : (
      <button type="button" className="nav-item" style={{ color: "var(--link)", marginTop: 6 }} onClick={() => setOpen(true)}>
        <span>
          <Icon name="plus" size="s" />
          Nová kategória
        </span>
      </button>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: asPill ? 0 : 6, width: asPill ? "100%" : undefined }}>
      <div className={`field${error ? " error" : ""}`} style={{ height: 40, paddingRight: 4 }}>
        <input
          autoFocus
          placeholder="Názov kategórie"
          aria-label="Názov novej kategórie"
          value={name}
          maxLength={40}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
            if (e.key === "Escape") {
              e.stopPropagation();
              setOpen(false);
              setName("");
            }
          }}
        />
        <button type="button" className="btn btn-primary btn-sm" style={{ height: 30 }} onClick={submit}>
          Pridať
        </button>
      </div>
      <FieldError>{error}</FieldError>
    </motion.div>
  );
}

/* ---------------- Správa kategórií: premenovať, zmazať, presunúť ---------------- */
export function CategoryEditor() {
  const { categories, reorderCategories } = useStore();
  const [order, setOrder] = useState(categories.map((c) => c.id));
  const [syncedFrom, setSyncedFrom] = useState(categories);
  if (syncedFrom !== categories) {
    setSyncedFrom(categories);
    setOrder(categories.map((c) => c.id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {categories.length === 0 && (
        <p className="faint" style={{ margin: "4px 12px 8px", fontSize: 13 }}>
          Zatiaľ nemáš žiadne kategórie.
        </p>
      )}
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}
      >
        {order.map((id, i) => {
          const c = categories.find((x) => x.id === id);
          return c ? (
            <EditableCategory
              key={id}
              category={c}
              onDrop={() => reorderCategories(order)}
              onMove={(dir) => {
                const j = i + dir;
                if (j < 0 || j >= order.length) return;
                const next = [...order];
                [next[i], next[j]] = [next[j], next[i]];
                setOrder(next);
                reorderCategories(next);
              }}
              first={i === 0}
              last={i === order.length - 1}
            />
          ) : null;
        })}
      </Reorder.Group>
      <NewCategoryInline />
      <p className="faint" style={{ margin: "10px 12px 0", fontSize: 12, lineHeight: 1.5 }}>
        Poradie zmeníš potiahnutím za úchyt. Zmazaním kategórie sa inzeráty nezmažú.
      </p>
    </div>
  );
}

function EditableCategory({
  category,
  onDrop,
  onMove,
  first,
  last,
}: {
  category: Category;
  onDrop: () => void;
  onMove: (d: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  const { categories, renameCategory, deleteCategory } = useStore();
  const ui = useUI();
  const toast = useToast();
  const counts = useCategoryCounts();
  const controls = useDragControls();
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const n = counts.by(category.id);

  const commit = () => {
    if (name.trim() === category.name) return;
    const err = validateCategoryName(name, categories, category.id);
    if (err) {
      setError(err);
      return;
    }
    renameCategory(category.id, name);
  };

  return (
    <Reorder.Item
      value={category.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      style={{ position: "relative" }}
      whileDrag={{ scale: 1.02, zIndex: 2 }}
    >
      <div className={`field${error ? " error" : ""}`} style={{ height: 42, padding: "0 4px 0 2px", gap: 2, background: "rgba(255,255,255,.035)" }}>
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          aria-label={`Presunúť kategóriu ${category.name}. Šípkami hore a dole zmeníš poradie.`}
          onPointerDown={(e) => controls.start(e)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" && !first) {
              e.preventDefault();
              onMove(-1);
            }
            if (e.key === "ArrowDown" && !last) {
              e.preventDefault();
              onMove(1);
            }
          }}
          style={{ width: 28, cursor: "grab", touchAction: "none" }}
        >
          <Icon name="grip" size="s" />
        </button>
        <input
          aria-label={`Názov kategórie ${category.name}`}
          value={name}
          maxLength={40}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setName(category.name);
              setError(null);
            }
          }}
          style={{ fontSize: 14 }}
        />
        <span className="count" style={{ padding: "0 4px" }}>
          {n}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm btn-danger"
          aria-label={`Zmazať kategóriu ${category.name}`}
          onClick={() => setConfirm(true)}
          style={{ width: 30 }}
        >
          <Icon name="trash" size="s" />
        </button>
      </div>
      <FieldError>{error}</FieldError>

      <Dialog open={confirm} onClose={() => setConfirm(false)} title={`Zmazať kategóriu „${category.name}“?`} z={80}>
        <p className="muted" style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6 }}>
          {n > 0
            ? `${n} ${plural(n, "inzerát", "inzeráty", "inzerátov")} z tejto kategórie nezmažeme – nájdeš ${plural(n, "ho", "ich", "ich")} vo Všetkých inzerátoch medzi inzerátmi bez kategórie.`
            : "Kategória je prázdna."}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => setConfirm(false)}>
            Ponechať
          </button>
          <button
            className="btn btn-soft btn-danger"
            onClick={() => {
              deleteCategory(category.id);
              if (ui.category === category.id) ui.setCategory("all");
              setConfirm(false);
              toast.show({ text: `Kategória „${category.name}“ je zmazaná.` });
            }}
          >
            <Icon name="trash" size="s" />
            Zmazať kategóriu
          </button>
        </div>
      </Dialog>
    </Reorder.Item>
  );
}

/* ---------------- Kategórie ako „pilulky“ (mobil, tablet) ---------------- */
export function CategoryPills() {
  const { categories } = useStore();
  const ui = useUI();
  const counts = useCategoryCounts();
  const [manage, setManage] = useState(false);
  const pill = (key: string, label: string) => (
    <button key={key} className={`pill${ui.category === key ? " on" : ""}`} onClick={() => ui.setCategory(key)} aria-pressed={ui.category === key}>
      {label}
    </button>
  );
  return (
    <>
      <div className="cat-pills scroll-x" role="group" aria-label="Kategórie">
        {pill("all", "Všetky")}
        {categories.map((c) => pill(c.id, c.name))}
        {counts.none > 0 && pill("none", "Bez kategórie")}
        {counts.archive > 0 && pill("archive", `Archív · ${counts.archive}`)}
        <button className="pill dashed" onClick={() => setManage(true)}>
          <Icon name="edit" size="s" style={{ width: 14, height: 14 }} />
          Upraviť
        </button>
      </div>
      <Dialog open={manage} onClose={() => setManage(false)} title="Kategórie">
        <CategoryEditor />
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 18 }} onClick={() => setManage(false)}>
          Hotovo
        </button>
      </Dialog>
    </>
  );
}
