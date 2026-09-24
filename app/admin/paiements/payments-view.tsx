"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { api } from "@/lib/api";
import { PAY_METHODS } from "@/lib/config";
import { fcfa, nombre, shortDate, timeHM } from "@/lib/format";
import { useNow, useQuery } from "@/lib/hooks";
import type { PaymentItem } from "@/lib/types";

const ITEM: Record<PaymentItem, string> = { premium: "Premium", premium_plus: "Premium+", boost: "Boost" };
const DAY = 86_400_000;

function maskPhone(phone?: string) {
  if (!phone) return "Carte";
  const digits = phone.replace(/\s/g, "");
  return `${digits.slice(0, 6)} •• •• ${digits.slice(-2)}`;
}

export default function PaymentsView() {
  const { data } = useQuery("admin-payments", api.adminPayments);
  const now = useNow(60_000);
  const list = data ?? [];
  const ok = list.filter((p) => p.status === "success");
  const month = ok.filter((p) => now - new Date(p.createdAt).getTime() < 30 * DAY);
  const failed = list.filter((p) => p.status === "failed").length;

  return (
    <div className="adm-page">
      <div className="adm-head">
        <div>
          <h1>Paiements</h1>
          <p className="muted small">Encaissements Mobile Money et carte. En production : agrégateur CinetPay, confirmation par webhook.</p>
        </div>
      </div>

      <div className="kpis four">
        <div className="kpi">
          <span className="kpi-label">Revenus sur 30 jours</span>
          <strong className="kpi-value">{fcfa(month.reduce((s, p) => s + p.amount, 0))}</strong>
          <span className="kpi-sub">{nombre(month.length)} transactions</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Total encaissé</span>
          <strong className="kpi-value">{fcfa(ok.reduce((s, p) => s + p.amount, 0))}</strong>
          <span className="kpi-sub">Depuis le lancement</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Panier moyen</span>
          <strong className="kpi-value">{fcfa(ok.length ? Math.round(ok.reduce((s, p) => s + p.amount, 0) / ok.length) : 0)}</strong>
          <span className="kpi-sub">Par transaction réussie</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Paiements échoués</span>
          <strong className="kpi-value">{nombre(failed)}</strong>
          <span className="kpi-sub">Solde insuffisant ou annulation</span>
        </div>
      </div>

      <div className="panel table-wrap">
        <table className="table adm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Membre</th>
              <th>Offre</th>
              <th>Moyen</th>
              <th>Compte</th>
              <th>Référence</th>
              <th>Statut</th>
              <th style={{ textAlign: "right" }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const method = PAY_METHODS.find((m) => m.key === p.method);
              return (
                <tr key={p.id}>
                  <td data-label="Date">
                    {shortDate(p.createdAt)} <span className="muted tiny">{timeHM(p.createdAt)}</span>
                  </td>
                  <td data-label="Membre">{p.member}</td>
                  <td data-label="Offre">{ITEM[p.item]}</td>
                  <td data-label="Moyen">
                    <span className="method">
                      <span className="pm-dot" style={{ background: method?.color }} /> {method?.label}
                    </span>
                  </td>
                  <td className="mono" data-label="Compte">
                    {maskPhone(p.phone)}
                  </td>
                  <td className="mono" data-label="Référence">
                    {p.ref}
                  </td>
                  <td data-label="Statut">
                    {p.status === "success" ? (
                      <span className="badge badge-green">
                        <CircleCheck size={12} /> Réussi
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <CircleX size={12} /> Échoué
                      </span>
                    )}
                  </td>
                  <td data-label="Montant" style={{ textAlign: "right", fontWeight: 700 }}>
                    {fcfa(p.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
