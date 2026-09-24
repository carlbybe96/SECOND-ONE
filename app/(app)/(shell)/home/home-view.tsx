"use client";

import { ArrowRight, Clock, Crown, Eye, Heart, HeartHandshake, Lightbulb, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import InstallHint from "@/components/install-hint";
import { Skeleton, Verified } from "@/components/ui/bits";
import ProfilePhoto from "@/components/ui/photo";
import { ScoreChip, ScoreRing } from "@/components/ui/score";
import { api } from "@/lib/api";
import { STAGES } from "@/lib/config";
import { useQuery, useSession } from "@/lib/hooks";
import { completion, dailyQuestion } from "@/lib/profile-utils";

function greeting() {
  const h = new Date().getHours();
  return h < 5 || h >= 18 ? "Bonsoir" : "Bonjour";
}

export default function HomeView() {
  const { data: session } = useSession();
  const me = session?.profile;
  const { data: reco } = useQuery("home-reco", () => api.discover(api.DEFAULT_FILTERS));
  const { data: received } = useQuery("home-received", api.interestsReceived);
  const { data: matches } = useQuery("home-matches", api.listMatches);
  const { data: visits } = useQuery("home-visits", api.visitors);
  const { data: sub } = useQuery("home-sub", api.subscriptionState);
  if (!me) return null;

  const comp = completion(me);
  const unread = matches?.reduce((s, m) => s + m.unread, 0) ?? 0;
  const advanced = matches?.filter((m) => m.match.stage > 0).sort((a, b) => b.match.stage - a.match.stage)[0];
  const top = reco?.items.slice(0, 3) ?? [];
  const avg = reco?.items.length ? Math.round(reco.items.slice(0, 10).reduce((s, c) => s + c.compat.score, 0) / Math.min(10, reco.items.length)) : null;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="hello">
            {greeting()} {me.firstName} 👋
          </h2>
          <p className="muted">Voici où en est ta recherche aujourd&apos;hui.</p>
        </div>
      </div>

      <InstallHint />

      {me.status === "pending" && (
        <div className="alert alert-info" style={{ marginBottom: 18 }}>
          <Clock size={18} />
          <span>
            <b>Ton profil est en cours de validation.</b> Notre équipe vérifie chaque inscription à la main (moins de 24 h). Tu peux déjà découvrir des profils et
            manifester ton intérêt.
          </span>
        </div>
      )}

      <div className="stat-grid">
        <Link href="/matches?tab=recus" className="stat">
          <span className="s-ico" style={{ background: "#fdecef", color: "#be185d" }}>
            <Heart size={18} />
          </span>
          <strong>{received?.length ?? "–"}</strong>
          <span>Intérêts reçus</span>
        </Link>
        <Link href="/matches?tab=matchs" className="stat">
          <span className="s-ico">
            <HeartHandshake size={18} />
          </span>
          <strong>{matches?.length ?? "–"}</strong>
          <span>Matchs</span>
        </Link>
        <Link href="/messages" className="stat">
          <span className="s-ico" style={{ background: "var(--info-soft)", color: "var(--info)" }}>
            <MessageCircle size={18} />
          </span>
          <strong>{matches ? unread : "–"}</strong>
          <span>Messages non lus</span>
        </Link>
        <Link href="/matches?tab=visites" className="stat">
          <span className="s-ico" style={{ background: "var(--gold-soft)", color: "#8a6508" }}>
            <Eye size={18} />
          </span>
          <strong>{visits?.length ?? "–"}</strong>
          <span>Visites de ton profil</span>
        </Link>
      </div>

      <div className="home-grid">
        <section className="panel panel-pad">
          <div className="panel-head">
            <h3>Tes meilleures recommandations</h3>
            <Link href="/discover" className="link">
              Tout voir <ArrowRight size={15} />
            </Link>
          </div>
          {!reco ? (
            <div className="reco-list">
              <Skeleton h={250} />
              <Skeleton h={250} />
              <Skeleton h={250} />
            </div>
          ) : top.length === 0 ? (
            <p className="muted small">Aucune nouvelle recommandation pour le moment. Élargis tes critères depuis la page Découvrir.</p>
          ) : (
            <div className="reco-list">
              {top.map((c) => (
                <Link key={c.profile.id} href={`/profile/${c.profile.id}`} className="reco">
                  <ProfilePhoto profile={c.profile} locked={c.photoLocked} className="reco-photo" lockLabel={false} />
                  <div className="reco-body">
                    <div className="reco-name">
                      <b>
                        {c.profile.firstName}, {c.profile.age}
                      </b>
                      <Verified profile={c.profile} />
                    </div>
                    <span className="muted tiny">
                      {c.profile.city} · {c.profile.profession}
                    </span>
                    <div className="reco-foot">
                      <ScoreChip score={c.compat.score} />
                    </div>
                    {c.compat.strengths.length > 0 && (
                      <span className="reco-why">{c.compat.strengths.find((s) => !s.startsWith("Même")) ?? c.compat.strengths[0]}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {avg !== null && (
            <div className="avg-line">
              <Sparkles size={16} /> Compatibilité moyenne de tes 10 meilleures recommandations : <b>{avg}%</b>
            </div>
          )}
        </section>

        <div className="home-side">
          <section className="panel panel-pad">
            <div className="panel-head">
              <h3>Ton profil</h3>
              <Link href="/profile" className="link">
                Modifier
              </Link>
            </div>
            <div className="completion">
              <ScoreRing score={comp.pct} size={76} stroke={7} />
              <div>
                <b>{comp.pct === 100 ? "Profil complet, bravo !" : "Complète ton profil"}</b>
                <p className="muted tiny">Un profil complet et vérifié inspire confiance et attire des personnes sérieuses.</p>
              </div>
            </div>
            {comp.missing.length > 0 && (
              <ul className="todo">
                {comp.missing.slice(0, 3).map((m) => (
                  <li key={m.label}>
                    <Link href={m.href}>
                      {m.label} <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {advanced && (
            <section className="panel panel-pad">
              <div className="panel-head">
                <h3>Ta relation avec {advanced.other.firstName}</h3>
              </div>
              <div className="mini-stages">
                {STAGES.map((s, i) => (
                  <span key={s.label} className={i <= advanced.match.stage ? "on" : ""} title={s.label}>
                    {s.icon}
                  </span>
                ))}
              </div>
              <p className="small" style={{ marginTop: 10 }}>
                Étape actuelle : <b>{STAGES[advanced.match.stage].label}</b>
              </p>
              <Link href={`/messages/${advanced.match.id}`} className="btn btn-outline btn-sm btn-block" style={{ marginTop: 12 }}>
                Continuer la conversation
              </Link>
            </section>
          )}

          <section className="panel panel-pad daily">
            <div className="daily-ico">
              <Lightbulb size={18} />
            </div>
            <div className="tiny" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--primary-700)" }}>
              Question du jour
            </div>
            <p className="daily-q">« {dailyQuestion()} »</p>
            <Link href="/messages" className="link">
              La poser à un match <ArrowRight size={15} />
            </Link>
          </section>

          {sub && sub.plan === "free" && (
            <Link href="/subscription" className="panel panel-pad upsell">
              <Crown size={22} />
              <div>
                <b>Passe Premium</b>
                <p className="tiny">Intérêts illimités, super-intérêts, visiteurs de ton profil et score détaillé.</p>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
