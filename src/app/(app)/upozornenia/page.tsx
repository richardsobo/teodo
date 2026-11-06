"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { NotificationsList } from "@/components/NotificationsList";
import { useStore } from "@/lib/store";
import { CHECK_HOURS } from "@/lib/schedule";

export default function NotificationsPage() {
  const { notifications, markAllRead, settings } = useStore();
  const router = useRouter();
  const unread = notifications.some((n) => !n.read);
  return (
    <>
      <main className="t-main">
        <div className="t-wrap rise" style={{ maxWidth: 720, paddingTop: 16, paddingBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginLeft: -10 }}>
            <button className="btn btn-ghost btn-icon" aria-label="Späť" onClick={() => (history.length > 1 ? router.back() : router.push("/prehlad"))}>
              <Icon name="back" />
            </button>
            {unread && (
              <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                Označiť ako prečítané
              </button>
            )}
          </div>
          <h1 className="h1" style={{ fontSize: 22, margin: "6px 0 4px" }}>
            Upozornenia
          </h1>
          <NotificationsList />
          <div className="notice notice-blue" style={{ marginTop: 24, alignItems: "center" }}>
            <Icon name="clock" size="s" style={{ color: "var(--link)" }} />
            <span className="muted" style={{ flex: 1 }}>
              Ceny kontrolujeme o {CHECK_HOURS.map((h) => `${h}:00`).join(" a ")}. E-mail:{" "}
              {settings.emailDigest ? "denný súhrn" : settings.emailInstant ? "hneď pri zmene" : "vypnutý"}.
            </span>
            <Link className="link" href="/nastavenia#upozornenia" style={{ fontSize: 13 }}>
              Nastaviť
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
