"use client";

import { Ban, Check, Crown, Flag, MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import ProfilePhoto from "@/components/ui/photo";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { PLANS, REPORT_REASONS } from "@/lib/config";
import { fcfa } from "@/lib/format";
import type { Profile } from "@/lib/types";

/** Fenêtre « fonctionnalité Premium ». */
export function PaywallModal({ open, onClose, reason }: { open: boolean; onClose: () => void; reason: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Passe à la vitesse supérieure" description={reason}>
      <div className="paywall">
        {(["premium", "premium_plus"] as const).map((k) => (
          <div key={k} className={`pw-plan${k === "premium" ? " featured" : ""}`}>
            <div className="pw-top">
              <b>
                <Crown size={16} /> {PLANS[k].name}
              </b>
              <span>
                {fcfa(PLANS[k].price)} <small>/ mois</small>
              </span>
            </div>
            <ul>
              {PLANS[k].features.slice(0, 4).map((f) => (
                <li key={f}>
                  <Check size={14} /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href="/subscription" className="btn btn-gold btn-block btn-lg" style={{ marginTop: 16 }} onClick={onClose}>
        Voir les offres
      </Link>
      <p className="tiny muted" style={{ textAlign: "center", marginTop: 10 }}>
        Paiement par Orange Money, Moov Money, Wave ou carte bancaire.
      </p>
    </Modal>
  );
}

/** Super-intérêt : un intérêt mis en avant, accompagné d'un message. */
export function SuperInterestModal({ profile, open, onClose, onSent }: { profile: Profile; open: boolean; onClose: () => void; onSent: (matchId?: string) => void }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setBusy(true);
    const res = await api.sendInterest(profile.id, "super", message);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "Envoi impossible.");
    setMessage("");
    onSent(res.matchId);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Super-intérêt pour ${profile.firstName}`}
      description="Ton profil apparaît en tête de ses demandes, avec ton message."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn btn-gold" onClick={send} disabled={busy}>
            <Star size={16} /> Envoyer
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="superMsg">Ton message (facultatif)</label>
        <textarea
          id="superMsg"
          maxLength={240}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Ex. ${profile.religion.key === "islam" ? "Assalamou alaykoum" : "Bonjour"} ${profile.firstName}, ton profil m'a touché(e), notamment ta vision de la famille…`}
        />
        <span className="hint">{message.length}/240 · Reste respectueux(se) : les messages sont modérés.</span>
      </div>
      {error && <p className="error-msg">{error}</p>}
    </Modal>
  );
}

/** Célébration du match réciproque. */
export function MatchModal({ me, other, matchId, onClose }: { me: Profile; other: Profile; matchId: string | null; onClose: () => void }) {
  const router = useRouter();
  return (
    <Modal open={!!matchId} onClose={onClose} title="C'est réciproque ! 🎉" description={`${other.firstName} et toi vous êtes mutuellement intéressés.`}>
      <div className="match-celebration">
        <ProfilePhoto profile={me} size={96} round />
        <span className="mc-heart">♥</span>
        <ProfilePhoto profile={other} size={96} round />
      </div>
      <p className="small muted" style={{ textAlign: "center" }}>
        Vos photos sont maintenant visibles l&apos;un pour l&apos;autre. Lance la conversation avec une question qui compte.
      </p>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => {
            onClose();
            router.push(`/messages/${matchId}`);
          }}
        >
          <MessageCircle size={18} /> Écrire à {other.firstName}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Continuer à découvrir
        </button>
      </div>
    </Modal>
  );
}

/** Signaler et/ou bloquer un membre. */
export function ReportModal({
  profile,
  open,
  onClose,
  messageId,
  onDone,
}: {
  profile: Profile;
  open: boolean;
  onClose: () => void;
  messageId?: string;
  onDone?: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason) return setError("Choisis un motif.");
    setBusy(true);
    const res = await api.reportUser(profile.id, reason, details, messageId);
    if (res.ok && alsoBlock) await api.blockUser(profile.id);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "Signalement impossible.");
    toast({ title: "Signalement envoyé", body: alsoBlock ? `${profile.firstName} est bloqué(e). Notre équipe examine la situation sous 24 h.` : "Notre équipe examine la situation sous 24 h.", kind: "safety" });
    setReason("");
    setDetails("");
    onClose();
    onDone?.();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Signaler ${profile.firstName}`}
      description="Ton signalement est confidentiel. La personne ne saura pas que c'est toi."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn btn-danger" onClick={submit} disabled={busy}>
            <Flag size={16} /> Envoyer le signalement
          </button>
        </>
      }
    >
      <div className="chip-row">
        {Object.entries(REPORT_REASONS).map(([k, label]) => (
          <button key={k} type="button" className={`chip${reason === k ? " sel" : ""}`} onClick={() => setReason(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="repDetails">Que s&apos;est-il passé ? (facultatif)</label>
        <textarea id="repDetails" maxLength={600} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Décris la situation en quelques mots." />
      </div>
      <label className="consent">
        <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} />
        <span>Bloquer aussi ce membre : il ne pourra plus me voir ni me contacter.</span>
      </label>
      {error && <p className="error-msg">{error}</p>}
    </Modal>
  );
}

/** Confirmation de blocage. */
export function BlockModal({ profile, open, onClose, onDone }: { profile: Profile; open: boolean; onClose: () => void; onDone?: () => void }) {
  async function confirm() {
    await api.blockUser(profile.id);
    toast({ title: `${profile.firstName} est bloqué(e)`, body: "Vous ne vous verrez plus et ne pourrez plus vous contacter.", kind: "safety" });
    onClose();
    onDone?.();
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Bloquer ${profile.firstName} ?`}
      description="Il ou elle disparaîtra de tes recommandations et de tes messages, et ne pourra plus te contacter. Tu pourras le débloquer depuis les paramètres."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn btn-danger" onClick={confirm}>
            <Ban size={16} /> Bloquer
          </button>
        </>
      }
    />
  );
}
