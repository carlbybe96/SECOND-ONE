"use client";

import {
  BadgeCheck,
  Bell,
  CircleAlert,
  CircleCheck,
  Crown,
  Eye,
  Heart,
  HeartHandshake,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { NotificationKind } from "@/lib/types";

export type ToastKind = "success" | "error" | "warn" | "info" | NotificationKind;

type ToastItem = { id: number; title: string; body?: string; kind: ToastKind; href?: string };

const ICONS: Record<ToastKind, LucideIcon> = {
  success: CircleCheck,
  error: CircleAlert,
  warn: ShieldAlert,
  info: Bell,
  interest: Heart,
  match: HeartHandshake,
  message: MessageCircle,
  visit: Eye,
  system: Bell,
  payment: Crown,
  verification: BadgeCheck,
  safety: ShieldCheck,
};

let items: ToastItem[] = [];
let counter = 0;
const subs = new Set<() => void>();
const EMPTY: ToastItem[] = [];

function emit() {
  subs.forEach((s) => s());
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function toast(t: { title: string; body?: string; kind?: ToastKind; href?: string }) {
  const id = ++counter;
  items = [...items, { id, title: t.title, body: t.body, href: t.href, kind: t.kind ?? "success" }].slice(-3);
  emit();
  window.setTimeout(() => dismissToast(id), t.kind === "error" || t.kind === "warn" ? 6500 : 4800);
}

export function Toaster() {
  const router = useRouter();
  const list = useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => {
        subs.delete(cb);
      };
    },
    () => items,
    () => EMPTY,
  );
  return (
    <div className="toaster" aria-live="polite">
      {list.map((t) => {
        const Icon = ICONS[t.kind] ?? Bell;
        const tone = t.kind === "error" ? " error" : t.kind === "warn" ? " warn" : "";
        return (
          <button
            type="button"
            key={t.id}
            className={`toast${tone}`}
            onClick={() => {
              dismissToast(t.id);
              if (t.href) router.push(t.href);
            }}
          >
            <span className="t-ico">
              <Icon size={18} />
            </span>
            <span>
              <strong>{t.title}</strong>
              {t.body && <span className="t-body">{t.body}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
