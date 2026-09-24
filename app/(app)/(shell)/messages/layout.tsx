"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Empty, Skeleton } from "@/components/ui/bits";
import ProfilePhoto from "@/components/ui/photo";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useNow, useQuery, useSession } from "@/lib/hooks";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const openId = useSelectedLayoutSegment();
  const now = useNow();
  const { data: session } = useSession();
  const { data, loading } = useQuery("conversations", api.listMatches);
  const meId = session?.profile?.id;

  return (
    <div className={`msg-layout${openId ? " has-open" : ""}`}>
      <aside className="conv-list panel">
        <div className="conv-head">
          <h2>Messages</h2>
        </div>
        {loading && !data ? (
          <div style={{ padding: 16, display: "grid", gap: 10 }}>
            <Skeleton h={58} />
            <Skeleton h={58} />
            <Skeleton h={58} />
          </div>
        ) : !data?.length ? (
          <Empty icon={MessageCircle} title="Aucune conversation" text="Tes conversations apparaissent ici dès qu'un intérêt devient réciproque.">
            <Link href="/discover" className="btn btn-primary btn-sm">
              Découvrir des profils
            </Link>
          </Empty>
        ) : (
          <ul>
            {data.map((m) => (
              <li key={m.match.id}>
                <Link href={`/messages/${m.match.id}`} className={`conv${openId === m.match.id ? " active" : ""}${m.unread ? " unread" : ""}`}>
                  <ProfilePhoto profile={m.other} size={48} round />
                  <span className="conv-txt">
                    <span className="conv-top">
                      <b>{m.other.firstName}</b>
                      <small>{timeAgo(m.last?.createdAt ?? m.match.createdAt, now)}</small>
                    </span>
                    <span className="conv-last">
                      {m.isNew ? (
                        <em>Nouveau match, dis bonjour 👋</em>
                      ) : (
                        <>
                          {m.last?.from === meId ? "Toi : " : ""}
                          {m.last?.text}
                        </>
                      )}
                    </span>
                  </span>
                  {m.unread > 0 && <span className="count-dot" style={{ background: "var(--primary)" }}>{m.unread}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <section className="conv-pane">{children}</section>
    </div>
  );
}
