"use client";

import { Check, Clock, Crown, Eye, Heart, HeartHandshake, MessageCircle, Send, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MatchModal } from "@/components/dialogs";
import { Empty, Skeleton, Verified } from "@/components/ui/bits";
import ProfilePhoto from "@/components/ui/photo";
import { ScoreChip } from "@/components/ui/score";
import { toast } from "@/components/ui/toaster";
import { api, type ProfileCard } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useNow, useQuery, useSession } from "@/lib/hooks";
import type { Profile } from "@/lib/types";

const TABS = [
  { key: "recus", label: "Intérêts reçus", icon: Heart },
  { key: "matchs", label: "Matchs", icon: HeartHandshake },
  { key: "envoyes", label: "Envoyés", icon: Send },
  { key: "visites", label: "Visites", icon: Eye },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MatchesView() {
  const search = useSearchParams();
  const router = useRouter();
  const requested = search.get("tab") as TabKey | null;
  const tab: TabKey = TABS.some((t) => t.key === requested) ? (requested as TabKey) : "recus";
  const { data: session } = useSession();
  const { data: badges } = useQuery("badges", api.badges);
  const me = session?.profile;
  if (!me) return null;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Tes rencontres</h2>
          <p className="muted small">Les intérêts réciproques deviennent des matchs, et ouvrent la conversation.</p>
        </div>
      </div>
      <div className="tabs" role="tablist" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`tab${tab === t.key ? " active" : ""}`} onClick={() => router.replace(`/matches?tab=${t.key}`)}>
            <t.icon size={16} /> {t.label}
            {t.key === "recus" && !!badges?.interests && <span className="count-dot">{badges.interests}</span>}
          </button>
        ))}
      </div>
      {tab === "recus" && <Received me={me} />}
      {tab === "matchs" && <Matches />}
      {tab === "envoyes" && <Sent />}
      {tab === "visites" && <Visits />}
    </div>
  );
}

function PersonCard({ card, children, note }: { card: ProfileCard; children?: React.ReactNode; note?: React.ReactNode }) {
  const p = card.profile;
  return (
    <article className="person">
      <Link href={`/profile/${p.id}`} className="person-photo">
        <ProfilePhoto profile={p} locked={card.photoLocked} lockLabel={false} />
      </Link>
      <div className="person-body">
        <div className="person-head">
          <Link href={`/profile/${p.id}`} className="person-name">
            {p.firstName}, {p.age}
          </Link>
          <Verified profile={p} />
          <span style={{ marginLeft: "auto" }}>
            <ScoreChip score={card.compat.score} />
          </span>
        </div>
        <span className="muted tiny">
          {p.city} · {p.profession}
        </span>
        {note}
        {children && <div className="person-actions">{children}</div>}
      </div>
    </article>
  );
}

function Received({ me }: { me: Profile }) {
  const { data, loading } = useQuery("interests-received", api.interestsReceived);
  const [matched, setMatched] = useState<{ other: Profile; matchId: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(id: string, other: Profile, accept: boolean) {
    setBusy(id);
    const res = await api.respondInterest(id, accept);
    setBusy(null);
    if (!res.ok) return toast({ title: "Action impossible", body: res.error, kind: "error" });
    if (accept && res.matchId) setMatched({ other, matchId: res.matchId });
    else toast({ title: "Demande déclinée", body: "Elle ne pourra pas être renvoyée. Merci pour ta franchise.", kind: "info" });
  }

  if (loading && !data) return <GridSkeleton />;
  if (!data?.length)
    return (
      <div className="panel">
        <Empty icon={Heart} title="Aucun intérêt en attente" text="Complète ton profil et fais-le vérifier : les profils vérifiés inspirent davantage confiance.">
          <Link href="/discover" className="btn btn-primary">
            Découvrir des profils
          </Link>
        </Empty>
      </div>
    );
  return (
    <>
      <div className="person-grid">
        {data.map(({ interest, card }) => (
          <PersonCard
            key={interest.id}
            card={card}
            note={
              <>
                {interest.kind === "super" && (
                  <span className="badge badge-gold" style={{ alignSelf: "flex-start", marginTop: 8 }}>
                    <Star size={12} /> Super-intérêt
                  </span>
                )}
                {interest.message && (
                  <p className="person-msg">
                    <span>« {interest.message} »</span>
                  </p>
                )}
                <span className="tiny muted" style={{ marginTop: 6 }}>
                  Reçu {timeAgo(interest.createdAt)}
                </span>
              </>
            }
          >
            <button type="button" className="btn btn-primary btn-sm" disabled={busy === interest.id} onClick={() => respond(interest.id, card.profile, true)}>
              <Check size={15} /> Accepter
            </button>
            <button type="button" className="btn btn-outline btn-sm" disabled={busy === interest.id} onClick={() => respond(interest.id, card.profile, false)}>
              <X size={15} /> Décliner
            </button>
          </PersonCard>
        ))}
      </div>
      {matched && <MatchModal me={me} other={matched.other} matchId={matched.matchId} onClose={() => setMatched(null)} />}
    </>
  );
}

function Matches() {
  const now = useNow();
  const { data, loading } = useQuery("matches-list", api.listMatches);
  if (loading && !data) return <GridSkeleton />;
  if (!data?.length)
    return (
      <div className="panel">
        <Empty icon={HeartHandshake} title="Pas encore de match" text="Quand un intérêt est réciproque, vous pouvez échanger. Manifeste ton intérêt aux profils qui te correspondent.">
          <Link href="/discover" className="btn btn-primary">
            Découvrir des profils
          </Link>
        </Empty>
      </div>
    );
  return (
    <div className="person-grid">
      {data.map((m) => (
        <PersonCard
          key={m.match.id}
          card={{ profile: m.other, compat: m.compat, photoLocked: false, online: false, boosted: false }}
          note={
            <p className="person-last">
              {m.isNew ? (
                <span className="badge badge-green">Nouveau match · {timeAgo(m.match.createdAt, now)}</span>
              ) : (
                <>
                  <MessageCircle size={13} /> {m.last?.text}
                </>
              )}
            </p>
          }
        >
          <Link href={`/messages/${m.match.id}`} className="btn btn-primary btn-sm">
            <MessageCircle size={15} /> {m.isNew ? "Écrire en premier" : "Ouvrir"}
            {m.unread > 0 && <span className="count-dot">{m.unread}</span>}
          </Link>
        </PersonCard>
      ))}
    </div>
  );
}

function Sent() {
  const { data, loading } = useQuery("interests-sent", api.interestsSent);
  if (loading && !data) return <GridSkeleton />;
  if (!data?.length)
    return (
      <div className="panel">
        <Empty icon={Send} title="Aucun intérêt envoyé" text="Les profils qui t'intéressent apparaîtront ici avec leur réponse." />
      </div>
    );
  return (
    <div className="person-grid">
      {data.map(({ interest, card }) => (
        <PersonCard
          key={interest.id}
          card={card}
          note={
            <span style={{ marginTop: 8 }}>
              {interest.status === "pending" && (
                <span className="badge badge-amber">
                  <Clock size={12} /> En attente · {timeAgo(interest.createdAt)}
                </span>
              )}
              {interest.status === "accepted" && (
                <span className="badge badge-green">
                  <Check size={12} /> Accepté
                </span>
              )}
              {interest.status === "declined" && <span className="badge badge-gray">Décliné</span>}
            </span>
          }
        >
          {card.matchId && (
            <Link href={`/messages/${card.matchId}`} className="btn btn-primary btn-sm">
              <MessageCircle size={15} /> Écrire
            </Link>
          )}
        </PersonCard>
      ))}
    </div>
  );
}

function Visits() {
  const { data: quota } = useQuery("quota", api.getQuota);
  const { data, loading } = useQuery("visitors", api.visitors);
  const premium = quota && quota.plan !== "free";
  if ((loading && !data) || !quota) return <GridSkeleton />;
  if (!data?.length)
    return (
      <div className="panel">
        <Empty icon={Eye} title="Pas encore de visite" text="Les membres qui consultent ton profil apparaîtront ici." />
      </div>
    );
  if (!premium)
    return (
      <div className="panel visits-locked">
        <div className="visits-blur">
          {data.slice(0, 6).map((v) => (
            <ProfilePhoto key={v.card.profile.id} profile={v.card.profile} locked size={78} round lockLabel={false} />
          ))}
        </div>
        <div className="visits-cta">
          <h3>
            {data.length} {data.length > 1 ? "personnes ont" : "personne a"} consulté ton profil
          </h3>
          <p className="muted small">Passe Premium pour savoir qui s&apos;intéresse à toi et faire le premier pas.</p>
          <Link href="/subscription" className="btn btn-gold">
            <Crown size={16} /> Voir qui m&apos;a rendu visite
          </Link>
        </div>
      </div>
    );
  return (
    <div className="person-grid">
      {data.map((v) => (
        <PersonCard key={v.card.profile.id} card={v.card} note={<span className="tiny muted" style={{ marginTop: 6 }}>A consulté ton profil {timeAgo(v.at)}</span>}>
          <Link href={`/profile/${v.card.profile.id}`} className="btn btn-outline btn-sm">
            Voir son profil
          </Link>
        </PersonCard>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="person-grid">
      <Skeleton h={150} />
      <Skeleton h={150} />
      <Skeleton h={150} />
    </div>
  );
}
