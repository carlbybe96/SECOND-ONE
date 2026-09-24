"use client";

import { Check, CircleCheck, Crown, HeartHandshake, Lock, Receipt, Rocket, Smartphone } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { BOOST, PAY_METHODS, PLANS, VIP, type PayMethod, type PlanKey } from "@/lib/config";
import { fcfa, longDate, shortDate, timeHM } from "@/lib/format";
import { useQuery, useSession } from "@/lib/hooks";
import type { Payment, PaymentItem } from "@/lib/types";

const ITEM_LABEL: Record<PaymentItem, string> = { premium: "Premium, 1 mois", premium_plus: "Premium+, 1 mois", boost: `Boost ${BOOST.minutes} min` };
const METHOD_LABEL: Record<PayMethod, string> = { orange: "Orange Money", moov: "Moov Money", wave: "Wave", card: "Carte bancaire" };

export default function SubscriptionView() {
  const { data: session } = useSession();
  const { data: state } = useQuery("sub-state", api.subscriptionState);
  const { data: payments } = useQuery("my-payments", api.myPayments);
  const [checkout, setCheckout] = useState<PaymentItem | null>(null);
  const me = session?.profile;
  if (!me || !state) return null;
  const current = state.plan;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Abonnement</h2>
          <p className="muted small">Gratuit pour commencer, Premium pour avancer plus vite. Paiement Mobile Money, sans engagement.</p>
        </div>
      </div>

      {current !== "free" && state.until && (
        <div className="alert alert-green" style={{ marginBottom: 18 }}>
          <Crown size={18} />
          <span>
            Tu es membre <b>{PLANS[current].name}</b> jusqu&apos;au {longDate(state.until)}.
            {state.cancelled ? " Le renouvellement est désactivé." : " Renouvellement manuel : aucun prélèvement automatique sur ton compte Mobile Money."}
          </span>
        </div>
      )}

      <div className="plans">
        {(Object.keys(PLANS) as PlanKey[]).map((k) => {
          const plan = PLANS[k];
          const active = current === k;
          return (
            <div key={k} className={`plan${k === "premium" ? " featured" : ""}${active ? " active" : ""}`}>
              {k === "premium" && <span className="plan-ribbon">Le plus choisi</span>}
              <div className="plan-name">
                {k !== "free" && <Crown size={17} />} {plan.name}
              </div>
              <div className="plan-price">
                <strong>{plan.price === 0 ? "0" : fcfa(plan.price).replace(" FCFA", "")}</strong> <span>FCFA{plan.price > 0 ? " / mois" : ""}</span>
              </div>
              <p className="plan-tag">{plan.tagline}</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={15} /> {f}
                  </li>
                ))}
              </ul>
              {k === "free" ? (
                <button type="button" className="btn btn-outline btn-block" disabled>
                  {active ? "Ton offre actuelle" : "Inclus"}
                </button>
              ) : (
                <button type="button" className={`btn btn-block ${k === "premium" ? "btn-gold" : "btn-dark"}`} onClick={() => setCheckout(k)}>
                  {active ? "Prolonger d'un mois" : `Choisir ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="extras">
        <section className="panel panel-pad extra">
          <span className="x-ico">
            <Rocket size={20} />
          </span>
          <div>
            <h3>Boost de visibilité</h3>
            <p className="small muted">
              Ton profil passe en tête des recommandations pendant {BOOST.minutes} minutes. Idéal le soir, quand les membres sont les plus actifs.
            </p>
            {state.boostUntil && <span className="badge badge-green" style={{ marginTop: 8 }}>Boost actif jusqu&apos;à {timeHM(state.boostUntil)}</span>}
          </div>
          <button type="button" className="btn btn-outline" onClick={() => setCheckout("boost")}>
            {fcfa(BOOST.price)}
          </button>
        </section>
        <section className="panel panel-pad extra">
          <span className="x-ico gold">
            <HeartHandshake size={20} />
          </span>
          <div>
            <h3>Accompagnement VIP</h3>
            <p className="small muted">
              Une conseillère analyse ton profil, sélectionne des personnes pour toi et t&apos;accompagne jusqu&apos;à la rencontre. De {fcfa(VIP.priceFrom)} à{" "}
              {fcfa(VIP.priceTo)}.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => toast({ title: "Demande envoyée", body: "Une conseillère te rappelle sous 24 h pour un premier échange gratuit.", kind: "system" })}
          >
            Être rappelé(e)
          </button>
        </section>
      </div>

      <section className="panel panel-pad" style={{ marginTop: 18 }}>
        <h3 className="sec-title">
          <Receipt size={18} /> Historique des paiements
        </h3>
        {!payments?.length ? (
          <p className="small muted">Aucun paiement pour le moment.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Offre</th>
                  <th>Moyen</th>
                  <th>Référence</th>
                  <th style={{ textAlign: "right" }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{shortDate(p.createdAt)}</td>
                    <td>{ITEM_LABEL[p.item]}</td>
                    <td>{METHOD_LABEL[p.method]}</td>
                    <td className="mono">{p.ref}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{fcfa(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {current !== "free" && !state.cancelled && (
          <button
            type="button"
            className="link"
            style={{ marginTop: 14 }}
            onClick={async () => {
              await api.cancelSubscription();
              toast({ title: "Renouvellement désactivé", body: "Tu gardes tes avantages jusqu'à la fin de la période payée.", kind: "info" });
            }}
          >
            Désactiver le renouvellement
          </button>
        )}
      </section>

      {checkout && <Checkout key={checkout} item={checkout} defaultPhone={me.verification.phoneNumber} onClose={() => setCheckout(null)} />}
    </div>
  );
}

type Step = "method" | "processing" | "done";

function Checkout({ item, defaultPhone, onClose }: { item: PaymentItem; defaultPhone?: string; onClose: () => void }) {
  const [method, setMethod] = useState<PayMethod>("orange");
  const [phone, setPhone] = useState(defaultPhone ?? "+226 ");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [step, setStep] = useState<Step>("method");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const amount = item === "boost" ? BOOST.price : PLANS[item].price;
  const meta = PAY_METHODS.find((m) => m.key === method)!;

  async function pay() {
    setError("");
    if (method === "card") {
      if (card.number.replace(/\D/g, "").length < 15 || !/^\d{2}\/\d{2}$/.test(card.exp) || card.cvc.length < 3) return setError("Vérifie les informations de la carte.");
    } else if (phone.replace(/\D/g, "").length < 11) {
      return setError("Indique ton numéro Mobile Money complet (ex. +226 70 12 34 56).");
    }
    setStep("processing");
    await new Promise((r) => window.setTimeout(r, 2600));
    const res = await api.pay(item, method, method === "card" ? undefined : phone);
    if (!res.ok || !res.payment) {
      setStep("method");
      return setError(res.error ?? "Paiement refusé.");
    }
    setReceipt(res.payment);
    setStep("done");
  }

  return (
    <Modal open onClose={step === "processing" ? () => undefined : onClose} title={step === "done" ? "Paiement confirmé" : "Paiement sécurisé"} description={step === "method" ? `${ITEM_LABEL[item]} · ${fcfa(amount)}` : undefined}>
      {step === "method" && (
        <>
          <div className="pay-methods">
            {PAY_METHODS.map((m) => (
              <button key={m.key} type="button" className={`pay-method${method === m.key ? " sel" : ""}`} onClick={() => setMethod(m.key)}>
                <span className="pm-dot" style={{ background: m.color }} />
                {m.label}
              </button>
            ))}
          </div>
          {method === "card" ? (
            <div className="form-grid" style={{ marginTop: 16 }}>
              <div className="field full">
                <label htmlFor="ccNum">Numéro de carte (démo : numéro fictif)</label>
                <input id="ccNum" inputMode="numeric" autoComplete="off" placeholder="4000 1234 5678 9010" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="ccExp">Expiration</label>
                <input id="ccExp" placeholder="MM/AA" autoComplete="off" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="ccCvc">CVC</label>
                <input id="ccCvc" inputMode="numeric" autoComplete="off" maxLength={4} placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="mmPhone">Numéro {meta.label}</label>
              <input id="mmPhone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <span className="hint">{meta.hint}</span>
            </div>
          )}
          <p className="demo-note">
            <Lock size={13} /> Démo : aucun argent n&apos;est débité. En production, le paiement passe par un agrégateur agréé (CinetPay) et l&apos;abonnement s&apos;active à la
            confirmation de l&apos;opérateur.
          </p>
          {error && <p className="error-msg">{error}</p>}
          <button type="button" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 14 }} onClick={pay}>
            Payer {fcfa(amount)}
          </button>
        </>
      )}
      {step === "processing" && (
        <div className="pay-wait">
          <span className="pw-phone">
            <Smartphone size={30} />
          </span>
          <b>{method === "card" ? "Vérification 3-D Secure…" : "Confirme le paiement sur ton téléphone"}</b>
          <p className="small muted">
            {method === "card"
              ? "Ta banque vérifie la transaction."
              : `Une demande de paiement de ${fcfa(amount)} a été envoyée au ${phone}. Valide-la avec ton code secret ${meta.label}.`}
          </p>
          <span className="spinner dark" />
        </div>
      )}
      {step === "done" && receipt && (
        <div className="pay-done">
          <CircleCheck size={54} color="var(--primary)" />
          <b>{item === "boost" ? "Ton boost est actif 🚀" : `Bienvenue en ${PLANS[item].name} 👑`}</b>
          <dl className="receipt">
            <div>
              <dt>Montant</dt>
              <dd>{fcfa(receipt.amount)}</dd>
            </div>
            <div>
              <dt>Moyen</dt>
              <dd>{METHOD_LABEL[receipt.method]}</dd>
            </div>
            <div>
              <dt>Référence</dt>
              <dd className="mono">{receipt.ref}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>
                {longDate(receipt.createdAt)} à {timeHM(receipt.createdAt)}
              </dd>
            </div>
          </dl>
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            Continuer
          </button>
        </div>
      )}
    </Modal>
  );
}
