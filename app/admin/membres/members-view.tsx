"use client";

import { BadgeCheck, Ban, Crown, Eye, PauseCircle, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/admin/risk";
import { Modal } from "@/components/ui/modal";
import ProfilePhoto from "@/components/ui/photo";
import { toast } from "@/components/ui/toaster";
import { api, type AdminMember } from "@/lib/api";
import { PLANS } from "@/lib/config";
import { fcfa, shortDate } from "@/lib/format";
import { useQuery } from "@/lib/hooks";
import { childrenLabel, educationLabel, kidsProjectLabel, maritalLabel, practiceLabel, religionLine } from "@/lib/profile-utils";

type Filter = "all" | "pending" | "verified" | "premium" | "sanctioned";

const FILTERS: [Filter, string][] = [
  ["all", "Tous"],
  ["pending", "En attente"],
  ["verified", "Vérifiés"],
  ["premium", "Premium"],
  ["sanctioned", "Suspendus / bannis"],
];

export default function MembersView() {
  const { data } = useQuery("admin-members", api.adminMembers);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [viewing, setViewing] = useState<AdminMember | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? []).filter((m) => {
      const p = m.profile;
      if (filter === "pending" && p.status !== "pending") return false;
      if (filter === "verified" && p.verification.photo !== "verified") return false;
      if (filter === "premium" && p.plan === "free") return false;
      if (filter === "sanctioned" && p.status !== "suspended" && p.status !== "banned") return false;
      if (!needle) return true;
      return `${p.firstName} ${p.city} ${p.profession} ${m.email}`.toLowerCase().includes(needle);
    });
  }, [data, q, filter]);

  async function setStatus(m: AdminMember, status: AdminMember["profile"]["status"]) {
    await api.adminSetStatus(m.profile.id, status);
    const label = status === "approved" ? "restauré" : status === "suspended" ? "suspendu" : "banni";
    toast({ title: `Compte de ${m.profile.firstName} ${label}`, kind: status === "approved" ? "info" : "safety" });
  }

  return (
    <div className="adm-page">
      <div className="adm-head">
        <div>
          <h1>Membres</h1>
          <p className="muted small">{data ? `${data.length} comptes au total` : "Chargement…"}</p>
        </div>
      </div>

      <div className="adm-toolbar">
        <label className="search">
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom, une ville, un e-mail…" aria-label="Rechercher un membre" />
        </label>
        <div className="chip-row">
          {FILTERS.map(([k, label]) => (
            <button key={k} type="button" className={`chip${filter === k ? " sel" : ""}`} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel table-wrap">
        <table className="table adm-table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Ville</th>
              <th>Religion</th>
              <th>Statut</th>
              <th>Offre</th>
              <th>Inscription</th>
              <th style={{ textAlign: "right" }}>Payé</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const p = m.profile;
              return (
                <tr key={p.id}>
                  <td>
                    <span className="m-cell">
                      <ProfilePhoto profile={p} size={36} round />
                      <span>
                        <b>
                          {p.firstName}, {p.age} {p.verification.photo === "verified" && <BadgeCheck size={14} color="var(--primary)" style={{ verticalAlign: "-2px" }} />}
                        </b>
                        <small>{m.email}</small>
                      </span>
                    </span>
                  </td>
                  <td>{p.city}</td>
                  <td>{religionLine(p)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                    {m.reports > 0 && <span className="badge badge-red" style={{ marginLeft: 6 }}>{m.reports} signal.</span>}
                  </td>
                  <td>
                    {p.plan === "free" ? (
                      <span className="muted">Gratuit</span>
                    ) : (
                      <span className="badge badge-gold">
                        <Crown size={11} /> {PLANS[p.plan].name}
                      </span>
                    )}
                  </td>
                  <td>{shortDate(p.createdAt)}</td>
                  <td style={{ textAlign: "right" }}>{m.payments ? fcfa(m.payments) : "–"}</td>
                  <td>
                    <span className="row-actions">
                      <button type="button" className="icon-btn plain" onClick={() => setViewing(m)} aria-label={`Voir ${p.firstName}`} title="Voir le profil">
                        <Eye size={17} />
                      </button>
                      {p.status === "suspended" || p.status === "banned" ? (
                        <button type="button" className="icon-btn plain" onClick={() => setStatus(m, "approved")} aria-label="Restaurer" title="Restaurer le compte">
                          <RotateCcw size={17} />
                        </button>
                      ) : (
                        <>
                          <button type="button" className="icon-btn plain" onClick={() => setStatus(m, "suspended")} aria-label="Suspendre" title="Suspendre">
                            <PauseCircle size={17} />
                          </button>
                          <button type="button" className="icon-btn plain danger" onClick={() => setStatus(m, "banned")} aria-label="Bannir" title="Bannir">
                            <Ban size={17} />
                          </button>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="muted" style={{ textAlign: "center", padding: 30 }}>
                  Aucun membre ne correspond à la recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && <MemberModal member={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function MemberModal({ member, onClose }: { member: AdminMember; onClose: () => void }) {
  const p = member.profile;
  return (
    <Modal open wide onClose={onClose} title={`${p.firstName}, ${p.age} ans`} description={`${p.city}, ${p.country} · ${p.profession} · ${member.email}`}>
      <div className="member-view">
        <ProfilePhoto profile={p} className="mv-photo" />
        <div>
          <div className="d-tags" style={{ marginTop: 0 }}>
            <StatusBadge status={p.status} />
            <span className="badge badge-green">{religionLine(p)}</span>
            <span className="badge badge-gray">{practiceLabel(p)}</span>
            <span className="badge badge-gray">{maritalLabel(p)}</span>
          </div>
          <p className="small" style={{ marginTop: 12 }}>
            {p.bio}
          </p>
          <dl className="facts" style={{ marginTop: 14 }}>
            <div>
              <dt>Études</dt>
              <dd>{educationLabel(p)}</dd>
            </div>
            <div>
              <dt>Enfants</dt>
              <dd>{childrenLabel(p)}</dd>
            </div>
            <div>
              <dt>Projet</dt>
              <dd>{kidsProjectLabel(p)}</dd>
            </div>
            <div>
              <dt>Vérifications</dt>
              <dd>
                Tél. {p.verification.phone === "verified" ? "✓" : "✗"} · Selfie {p.verification.photo === "verified" ? "✓" : p.verification.photo === "pending" ? "en cours" : "✗"}
              </dd>
            </div>
          </dl>
          {p.statusReason && <p className="small" style={{ marginTop: 12, color: "var(--danger)" }}>Motif : {p.statusReason}</p>}
        </div>
      </div>
      <p className="tiny muted" style={{ marginTop: 14 }}>
        Vue réservée à la modération. Les réponses détaillées au questionnaire et les conversations ne sont pas affichées.
      </p>
    </Modal>
  );
}
