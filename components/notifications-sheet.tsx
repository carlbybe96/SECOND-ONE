"use client";

import { BadgeCheck, Bell, Crown, Eye, Heart, HeartHandshake, MessageCircle, ShieldCheck, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/modal";
import { Empty } from "@/components/ui/bits";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useNow, useQuery } from "@/lib/hooks";
import type { NotificationKind } from "@/lib/types";

const ICONS: Record<NotificationKind, LucideIcon> = {
  interest: Heart,
  match: HeartHandshake,
  message: MessageCircle,
  visit: Eye,
  system: Bell,
  payment: Crown,
  verification: BadgeCheck,
  safety: ShieldCheck,
};

export default function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const now = useNow(30_000);
  const { data } = useQuery("notifications", api.listNotifications);
  const list = data ?? [];
  const unread = list.filter((n) => !n.read).length;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Notifications"
      actions={
        unread > 0 ? (
          <button type="button" className="link" onClick={() => api.markAllNotificationsRead()}>
            Tout marquer comme lu
          </button>
        ) : null
      }
    >
      {list.length === 0 ? (
        <Empty icon={Bell} title="Aucune notification" text="Tes nouveaux intérêts, matchs et messages apparaîtront ici." />
      ) : (
        <ul className="notif-list">
          {list.map((n) => {
            const Icon = ICONS[n.kind] ?? Bell;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  className={`notif${n.read ? "" : " unread"}`}
                  onClick={() => {
                    onClose();
                    if (n.href) router.push(n.href);
                  }}
                >
                  <span className={`n-ico k-${n.kind}`}>
                    <Icon size={17} />
                  </span>
                  <span className="n-txt">
                    <strong>{n.title}</strong>
                    <span>{n.body}</span>
                    <small>{timeAgo(n.createdAt, now)}</small>
                  </span>
                  {!n.read && <span className="n-dot" aria-label="Non lue" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
