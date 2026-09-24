"use client";

import { ArrowRight, BadgeCheck, Crown, Flag, HeartHandshake, MessageCircle, UserCheck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { Columns, HBars } from "@/components/admin/charts";
import { RiskBadge } from "@/components/admin/risk";
import { Skeleton } from "@/components/ui/bits";
import ProfilePhoto from "@/components/ui/photo";
import { api } from "@/lib/api";
import { fcfa, longDate, nombre, timeAgo } from "@/lib/format";
import { useQuery } from "@/lib/hooks";

export default function DashboardView() {
  const { data: s } = useQuery("admin-stats", api.adminStats);
  const { data: members } = useQuery("admin-members", api.adminMembers);
  const { data: reports } = useQuery("admin-reports", api.adminReports);

  if (!s)
    return (
      <div className="adm-page">
        <Skeleton h={120} />
      </div>
    );

  const pending = members?.filter((m) => m.profile.status === "pending" && m.profile.onboarded).slice(0, 4) ?? [];
  const openReports = reports?.filter((r) => r.open > 0).slice(0, 4) ?? [];
  const tiles = [
    { label: "Membres inscrits", value: nombre(s.members), sub: `+${s.newThisWeek} cette semaine`, icon: Users },
    { label: "En attente de validation", value: nombre(s.pending), sub: "À valider sous 24 h", icon: UserCheck, href: "/admin/validations", alert: s.pending > 0 },
    { label: "Profils vérifiés (selfie)", value: nombre(s.verified), sub: `${Math.round((s.verified / Math.max(1, s.members)) * 100)} % des membres`, icon: BadgeCheck },
    { label: "Abonnés Premium", value: nombre(s.premium), sub: `${Math.round((s.premium / Math.max(1, s.members)) * 100)} % de conversion`, icon: Crown },
    { label: "Matchs", value: nombre(s.matches), sub: "Intérêts réciproques", icon: HeartHandshake },
    { label: "Conversations actives", value: nombre(s.activeConversations), sub: `${nombre(s.messages)} messages au total`, icon: MessageCircle },
    { label: "Signalements ouverts", value: nombre(s.openReports), sub: "Délai cible : 24 h", icon: Flag, href: "/admin/signalements", alert: s.openReports > 0 },
    { label: "Revenus sur 30 jours", value: fcfa(s.revenueMonth), sub: `${fcfa(s.revenueTotal)} depuis le lancement`, icon: Wallet },
  ];

  return (
    <div className="adm-page">
      <div className="adm-head">
        <div>
          <h1>Tableau de bord</h1>
          <p className="muted small">Situation au {longDate(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="kpis">
        {tiles.map((t) => {
          const body = (
            <>
              <span className="kpi-ico">
                <t.icon size={17} />
              </span>
              <span className="kpi-label">{t.label}</span>
              <strong className="kpi-value">{t.value}</strong>
              <span className="kpi-sub">{t.sub}</span>
            </>
          );
          return t.href ? (
            <Link key={t.label} href={t.href} className={`kpi${t.alert ? " alert" : ""}`}>
              {body}
            </Link>
          ) : (
            <div key={t.label} className="kpi">
              {body}
            </div>
          );
        })}
      </div>

      <div className="adm-grid two">
        <section className="panel panel-pad">
          <h3 className="chart-title">Inscriptions par jour</h3>
          <p className="chart-sub">14 derniers jours</p>
          <Columns
            data={s.signups.map((d) => {
              const date = new Date(`${d.day}T12:00:00`);
              return { label: String(date.getDate()), hint: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }), value: d.count };
            })}
            format={(n) => `${n} inscription${n > 1 ? "s" : ""}`}
          />
        </section>
        <section className="panel panel-pad">
          <h3 className="chart-title">Revenus par semaine</h3>
          <p className="chart-sub">Abonnements et boosts encaissés (FCFA)</p>
          <Columns data={s.revenueByWeek.map((w) => ({ label: w.label, value: w.amount }))} format={(n) => fcfa(n)} />
        </section>
      </div>

      <div className="adm-grid three">
        <section className="panel panel-pad">
          <h3 className="chart-title">Membres par religion</h3>
          <HBars data={s.religions} />
        </section>
        <section className="panel panel-pad">
          <h3 className="chart-title">Villes principales</h3>
          <HBars data={s.cities} />
        </section>
        <section className="panel panel-pad">
          <h3 className="chart-title">Moyens de paiement</h3>
          <p className="chart-sub">Transactions réussies</p>
          <HBars data={s.methods} />
        </section>
      </div>

      <div className="adm-grid two">
        <section className="panel panel-pad">
          <div className="panel-head">
            <h3>Profils à valider</h3>
            <Link href="/admin/validations" className="link">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="small muted">Aucun profil en attente. 👍</p>
          ) : (
            <ul className="adm-list">
              {pending.map(({ profile: p }) => (
                <li key={p.id}>
                  <ProfilePhoto profile={p} size={40} round />
                  <span>
                    <b>
                      {p.firstName}, {p.age} ans
                    </b>
                    <small>
                      {p.city} · inscrit(e) {timeAgo(p.createdAt)}
                    </small>
                  </span>
                  <Link href="/admin/validations" className="btn btn-outline btn-sm">
                    Examiner
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel panel-pad">
          <div className="panel-head">
            <h3>Signalements prioritaires</h3>
            <Link href="/admin/signalements" className="link">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          {openReports.length === 0 ? (
            <p className="small muted">Aucun signalement ouvert.</p>
          ) : (
            <ul className="adm-list">
              {openReports.map((g) => (
                <li key={g.target.id}>
                  <ProfilePhoto profile={g.target} size={40} round />
                  <span>
                    <b>
                      {g.target.firstName}, {g.target.age} ans
                    </b>
                    <small>
                      {g.open} signalement{g.open > 1 ? "s" : ""} ouvert{g.open > 1 ? "s" : ""}
                    </small>
                  </span>
                  <RiskBadge risk={g.risk} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
