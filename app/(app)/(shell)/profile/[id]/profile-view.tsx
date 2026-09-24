"use client";

import {
  ArrowLeft,
  Ban,
  Baby,
  BookOpen,
  Briefcase,
  Check,
  Clock,
  Flag,
  GraduationCap,
  Heart,
  Languages,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Star,
  UserX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BlockModal, MatchModal, PaywallModal, ReportModal, SuperInterestModal } from "@/components/dialogs";
import { Empty, PremiumBadge, Skeleton, Verified } from "@/components/ui/bits";
import ProfilePhoto from "@/components/ui/photo";
import { CategoryBars, CompatPoints, ScoreRing } from "@/components/ui/score";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { INTENTIONS } from "@/lib/config";
import { presence, timeAgo } from "@/lib/format";
import { useQuery, useSession } from "@/lib/hooks";
import { childrenLabel, educationLabel, kidsProjectLabel, maritalLabel, practiceLabel, religionLine } from "@/lib/profile-utils";

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const me = session?.profile;
  const { data: card, loading } = useQuery(`profile:${id}`, () => api.getProfile(id));
  const { data: quota } = useQuery("quota", api.getQuota);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [block, setBlock] = useState(false);
  const [superOpen, setSuperOpen] = useState(false);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const visited = useRef(false);

  useEffect(() => {
    if (me && id === me.id) router.replace("/profile");
  }, [me, id, router]);

  useEffect(() => {
    if (!card || visited.current) return;
    visited.current = true;
    api.recordVisit(card.profile.id);
  }, [card]);

  if (!me) return null;
  if (loading && !card)
    return (
      <div className="page">
        <Skeleton h={420} r={24} />
      </div>
    );
  if (!card)
    return (
      <div className="page">
        <div className="panel">
          <Empty icon={UserX} title="Profil indisponible" text="Ce profil n'existe plus, n'est pas encore validé, ou vous vous êtes bloqués mutuellement.">
            <Link href="/discover" className="btn btn-primary">
              Retour à la découverte
            </Link>
          </Empty>
        </div>
      </div>
    );

  const p = card.profile;
  const premium = quota?.plan !== "free";
  const status = presence(p.lastActiveAt, p.gender);

  async function interest() {
    setBusy(true);
    const res = await api.sendInterest(p.id, "interest");
    setBusy(false);
    if (!res.ok) {
      if (res.code === "quota" || res.code === "premium") return setPaywall(res.error ?? "");
      return toast({ title: "Action impossible", body: res.error, kind: "error" });
    }
    if (res.matchId) setMatchId(res.matchId);
    else toast({ title: `Intérêt envoyé à ${p.firstName}`, body: "Tu seras prévenu(e) dès qu'il y a une réponse.", kind: "interest" });
  }

  async function respond(accept: boolean) {
    if (!card?.received) return;
    setBusy(true);
    const res = await api.respondInterest(card.received.id, accept);
    setBusy(false);
    if (!res.ok) return toast({ title: "Action impossible", body: res.error, kind: "error" });
    if (accept && res.matchId) setMatchId(res.matchId);
    else toast({ title: "Demande déclinée", body: `${p.firstName} ne pourra pas te renvoyer de demande.`, kind: "info" });
  }

  function openSuper() {
    if (!quota) return;
    if (quota.supers.limit === 0) return setPaywall("Le super-intérêt, avec message, est réservé aux membres Premium.");
    if (quota.supers.used >= quota.supers.limit) return setPaywall("Tu as utilisé tous tes super-intérêts du jour.");
    setSuperOpen(true);
  }

  let actions: React.ReactNode;
  if (card.matchId) {
    actions = (
      <Link href={`/messages/${card.matchId}`} className="btn btn-primary btn-lg">
        <MessageCircle size={18} /> Écrire à {p.firstName}
      </Link>
    );
  } else if (card.received?.status === "pending") {
    actions = (
      <>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => respond(true)} disabled={busy}>
          <Check size={18} /> Accepter sa demande
        </button>
        <button type="button" className="btn btn-outline btn-lg" onClick={() => respond(false)} disabled={busy}>
          <X size={18} /> Décliner
        </button>
      </>
    );
  } else if (card.sent) {
    actions = (
      <button type="button" className="btn btn-outline btn-lg" disabled>
        {card.sent.status === "declined" ? (
          "Demande déclinée"
        ) : (
          <>
            <Clock size={18} /> Intérêt envoyé {timeAgo(card.sent.createdAt)}
          </>
        )}
      </button>
    );
  } else {
    actions = (
      <>
        <button type="button" className="btn btn-primary btn-lg" onClick={interest} disabled={busy}>
          <Heart size={18} fill="currentColor" /> Je suis intéressé{me.gender === "femme" ? "e" : ""}
        </button>
        <button type="button" className="btn btn-outline btn-lg" onClick={openSuper} disabled={busy}>
          <Star size={18} color="var(--gold)" /> Super-intérêt
        </button>
      </>
    );
  }

  return (
    <div className="page profile-page">
      <button type="button" className="btn btn-ghost btn-sm back-btn" onClick={() => router.back()}>
        <ArrowLeft size={16} /> Retour
      </button>

      <section className="pf-hero panel">
        <ProfilePhoto profile={p} locked={card.photoLocked} className="pf-photo" />
        <div className="pf-main">
          <div className="pf-top">
            <div>
              <div className="pf-name">
                <h2>
                  {p.firstName}, {p.age} ans
                </h2>
                <Verified profile={p} />
                <PremiumBadge plan={p.plan} />
              </div>
              <div className="pf-presence">
                {status.online ? (
                  <>
                    <span className="online-dot" /> En ligne
                  </>
                ) : (
                  status.label
                )}
              </div>
            </div>
            <div className="pf-menu">
              <button type="button" className="icon-btn" onClick={() => setMenu((m) => !m)} aria-label="Plus d'actions" aria-expanded={menu}>
                <MoreHorizontal size={18} />
              </button>
              {menu && (
                <div className="dropdown" onMouseLeave={() => setMenu(false)}>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setReport(true);
                    }}
                  >
                    <Flag size={16} /> Signaler
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      setMenu(false);
                      setBlock(true);
                    }}
                  >
                    <Ban size={16} /> Bloquer
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="pf-facts">
            <span>
              <MapPin size={15} /> {p.city}, {p.country}
            </span>
            <span>
              <Briefcase size={15} /> {p.profession}
            </span>
            <span>
              <GraduationCap size={15} /> {educationLabel(p)}
            </span>
          </div>
          <div className="d-tags">
            <span className="badge badge-green">{religionLine(p)}</span>
            <span className="badge badge-gray">{practiceLabel(p)}</span>
            <span className="badge badge-gray">{maritalLabel(p)}</span>
            <span className="badge badge-gray">{INTENTIONS[p.intention]}</span>
            {p.verification.phone === "verified" && <span className="badge badge-blue">Téléphone vérifié</span>}
          </div>
          {card.received?.status === "pending" && card.received.message && (
            <blockquote className="pf-message">
              <Star size={15} /> « {card.received.message} »
            </blockquote>
          )}
          <div className="pf-actions">{actions}</div>
          {card.photoLocked && (
            <p className="tiny muted" style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10 }}>
              <Lock size={13} /> {p.firstName} a choisi de ne montrer ses photos qu&apos;après un match.
            </p>
          )}
        </div>
      </section>

      <div className="pf-grid">
        <div className="pf-col">
          <section className="panel panel-pad">
            <h3 className="sec-title">
              <BookOpen size={18} /> À propos
            </h3>
            <p className="pf-bio">{p.bio}</p>
          </section>
          <section className="panel panel-pad">
            <h3 className="sec-title">
              <Baby size={18} /> Projet familial
            </h3>
            <dl className="facts">
              <div>
                <dt>Enfants</dt>
                <dd>{childrenLabel(p)}</dd>
              </div>
              <div>
                <dt>Projet</dt>
                <dd>{kidsProjectLabel(p)}</dd>
              </div>
              <div>
                <dt>Après le mariage</dt>
                <dd>{p.family.work === "oui" ? "Souhaite travailler" : p.family.work === "choix" ? "Travail : au choix du couple" : "Ne souhaite pas travailler"}</dd>
              </div>
              <div>
                <dt>Déménager</dt>
                <dd>{p.family.relocate === "oui" ? "Oui, même à l'étranger" : p.family.relocate === "ville" ? "Oui, dans le pays" : "Non"}</dd>
              </div>
              <div>
                <dt>Vie avec les parents</dt>
                <dd>{p.family.parents === "elargie" ? "En famille élargie" : p.family.parents === "proximite" ? "À proximité" : "En couple"}</dd>
              </div>
              <div>
                <dt>Place de la famille</dt>
                <dd>{p.family.importance === "tres" ? "Très importante" : p.family.importance === "importante" ? "Importante" : "Mesurée"}</dd>
              </div>
            </dl>
          </section>
          <section className="panel panel-pad">
            <h3 className="sec-title">
              <Languages size={18} /> Langues
            </h3>
            <div className="chip-row">
              {p.languages.map((l) => (
                <span key={l} className="badge badge-gray" style={{ fontSize: ".82rem", padding: "6px 12px" }}>
                  {l}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="panel panel-pad pf-compat">
          <div className="d-score">
            <ScoreRing score={card.compat.score} size={104} stroke={9} />
            <div>
              <b>{card.compat.label}</b>
              <p className="muted tiny">Entre {p.firstName} et toi, sur 8 dimensions.</p>
            </div>
          </div>
          <div className="divider" />
          {premium ? (
            <CategoryBars categories={card.compat.categories} />
          ) : (
            <div className="locked-bars">
              <CategoryBars categories={card.compat.categories} />
              <Link href="/subscription" className="locked-over">
                <Lock size={16} /> Détail par domaine avec Premium
              </Link>
            </div>
          )}
          <div className="divider" />
          <CompatPoints compat={card.compat} max={5} />
        </aside>
      </div>

      <ReportModal profile={p} open={report} onClose={() => setReport(false)} onDone={() => router.push("/discover")} />
      <BlockModal profile={p} open={block} onClose={() => setBlock(false)} onDone={() => router.push("/discover")} />
      <PaywallModal open={!!paywall} onClose={() => setPaywall(null)} reason={paywall ?? ""} />
      <SuperInterestModal
        profile={p}
        open={superOpen}
        onClose={() => setSuperOpen(false)}
        onSent={(mid) => {
          setSuperOpen(false);
          if (mid) setMatchId(mid);
          else toast({ title: "Super-intérêt envoyé ⭐", body: `${p.firstName} verra ton message en priorité.`, kind: "interest" });
        }}
      />
      <MatchModal me={me} other={p} matchId={matchId} onClose={() => setMatchId(null)} />
    </div>
  );
}
