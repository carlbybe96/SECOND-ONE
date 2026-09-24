"use client";

import { Ban, Check, ChevronDown, Flag, MessageSquareWarning, PauseCircle, RotateCcw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { RiskBadge, StatusBadge } from "@/components/admin/risk";
import { Empty } from "@/components/ui/bits";
import ProfilePhoto from "@/components/ui/photo";
import { toast } from "@/components/ui/toaster";
import { api, type AdminReportGroup } from "@/lib/api";
import { REPORT_REASONS } from "@/lib/config";
import { longDate, timeAgo, timeHM } from "@/lib/format";
import { useQuery } from "@/lib/hooks";

type Filter = "open" | "all";

export default function ReportsView() {
  const { data } = useQuery("admin-reports", api.adminReports);
  const [filter, setFilter] = useState<Filter>("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = (data ?? []).filter((g) => filter === "all" || g.open > 0);
  const expanded = openId ?? list[0]?.target.id ?? null;

  return (
    <div className="adm-page">
      <div className="adm-head">
        <div>
          <h1>Signalements</h1>
          <p className="muted small">Classés par gravité. Chaque décision est notifiée aux membres qui ont signalé.</p>
        </div>
        <div className="tabs">
          <button type="button" className={`tab${filter === "open" ? " active" : ""}`} onClick={() => setFilter("open")}>
            À traiter
          </button>
          <button type="button" className={`tab${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            Historique complet
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="panel">
          <Empty icon={Flag} title="Aucun signalement à traiter" text="La communauté est sereine. Les nouveaux signalements apparaîtront ici en temps réel." />
        </div>
      ) : (
        <div className="report-list">
          {list.map((g) => (
            <ReportGroup key={g.target.id} group={g} open={expanded === g.target.id} onToggle={() => setOpenId(expanded === g.target.id ? "" : g.target.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportGroup({ group, open, onToggle }: { group: AdminReportGroup; open: boolean; onToggle: () => void }) {
  const p = group.target;
  const [busy, setBusy] = useState(false);

  async function act(action: "dismiss" | "warn" | "suspend" | "ban") {
    setBusy(true);
    await api.adminResolve(p.id, action);
    setBusy(false);
    const labels = { dismiss: "Signalement classé sans suite", warn: "Avertissement envoyé", suspend: "Compte suspendu", ban: "Compte banni définitivement" };
    toast({ title: labels[action], body: `${p.firstName} · les signaleurs ont été informés.`, kind: action === "dismiss" ? "info" : "safety" });
  }

  return (
    <article className={`panel report-group${open ? " open" : ""}`}>
      <button type="button" className="rg-head" onClick={onToggle} aria-expanded={open}>
        <ProfilePhoto profile={p} size={48} round />
        <span className="rg-who">
          <b>
            {p.firstName}, {p.age} ans
          </b>
          <small>
            {p.city} · {p.profession} · {group.email}
          </small>
        </span>
        <StatusBadge status={p.status} />
        <RiskBadge risk={group.risk} />
        <span className="rg-count">
          {group.reports.length} signalement{group.reports.length > 1 ? "s" : ""}
        </span>
        <ChevronDown size={18} className="rg-chevron" />
      </button>

      {open && (
        <div className="rg-body">
          <div className="rg-cols">
            <div>
              <h4>Signalements reçus</h4>
              <ul className="rg-reports">
                {group.reports.map((r) => (
                  <li key={r.id}>
                    <div className="rg-r-top">
                      <span className="badge badge-gray">{REPORT_REASONS[r.reason] ?? r.reason}</span>
                      <small>
                        par {r.reporter} · {timeAgo(r.createdAt)}
                      </small>
                      {r.status !== "open" && (
                        <span className="badge badge-green">
                          <Check size={11} /> {r.status === "dismissed" ? "Classé" : `Traité (${r.action === "ban" ? "banni" : r.action === "suspend" ? "suspendu" : "averti"})`}
                        </span>
                      )}
                    </div>
                    {r.details && <p>{r.details}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>
                <MessageSquareWarning size={15} /> Messages signalés par la modération automatique
              </h4>
              {group.flagged.length === 0 ? (
                <p className="small muted">Aucun message suspect détecté pour ce membre.</p>
              ) : (
                <ul className="rg-msgs">
                  {group.flagged.map((m) => (
                    <li key={m.id}>
                      <span className="flag-label">
                        <TriangleAlert size={12} /> {m.flags?.includes("argent") ? "Demande d'argent" : "Lien externe"}
                      </span>
                      <p>« {m.text} »</p>
                      <small>
                        {longDate(m.createdAt)} à {timeHM(m.createdAt)}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
              <p className="tiny muted" style={{ marginTop: 10 }}>
                Les conversations privées ne sont consultées qu&apos;en cas de signalement, et uniquement les messages concernés.
              </p>
            </div>
          </div>
          <div className="rg-actions">
            {p.status === "suspended" || p.status === "banned" ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={busy}
                onClick={async () => {
                  await api.adminSetStatus(p.id, "approved");
                  toast({ title: `Compte de ${p.firstName} restauré`, kind: "info" });
                }}
              >
                <RotateCcw size={15} /> Restaurer le compte
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy || group.open === 0} onClick={() => act("dismiss")}>
                  Classer sans suite
                </button>
                <button type="button" className="btn btn-outline btn-sm" disabled={busy || group.open === 0} onClick={() => act("warn")}>
                  <TriangleAlert size={15} /> Avertir
                </button>
                <button type="button" className="btn btn-danger-ghost btn-sm" disabled={busy} onClick={() => act("suspend")}>
                  <PauseCircle size={15} /> Suspendre
                </button>
                <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => act("ban")}>
                  <Ban size={15} /> Bannir
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
