"use client";

import { BadgeCheck, Camera, Check, UserCheck, X } from "lucide-react";
import { useState } from "react";
import { Empty } from "@/components/ui/bits";
import { Modal } from "@/components/ui/modal";
import ProfilePhoto from "@/components/ui/photo";
import { toast } from "@/components/ui/toaster";
import { api, type AdminMember } from "@/lib/api";
import { INTENTIONS } from "@/lib/config";
import { timeAgo } from "@/lib/format";
import { useQuery } from "@/lib/hooks";
import { maritalLabel, practiceLabel, religionLine } from "@/lib/profile-utils";

const REJECT_REASONS = [
  "Photo non conforme (visage non visible ou photo d'une autre personne)",
  "Présentation incomplète ou inappropriée",
  "Informations incohérentes (âge, ville, profession)",
  "Profil suspect (arnaque, publicité, compte en double)",
];

export default function ValidationsView() {
  const { data } = useQuery("admin-members", api.adminMembers);
  const [rejecting, setRejecting] = useState<AdminMember | null>(null);
  const pending = data?.filter((m) => m.profile.status === "pending" && m.profile.onboarded) ?? [];
  const selfies = data?.filter((m) => m.profile.verification.photo === "pending") ?? [];

  async function approve(m: AdminMember) {
    await api.adminSetStatus(m.profile.id, "approved");
    toast({ title: `Profil de ${m.profile.firstName} validé`, body: "Il est maintenant visible des membres compatibles." });
  }

  return (
    <div className="adm-page">
      <div className="adm-head">
        <div>
          <h1>Validations</h1>
          <p className="muted small">Chaque nouveau profil est vérifié par un modérateur avant d&apos;être visible. Objectif : moins de 24 h.</p>
        </div>
      </div>

      <h2 className="adm-sec">
        <UserCheck size={18} /> Profils en attente <span className="count-dot">{pending.length}</span>
      </h2>
      {pending.length === 0 ? (
        <div className="panel">
          <Empty icon={UserCheck} title="Tout est à jour" text="Aucun profil en attente de validation." />
        </div>
      ) : (
        <div className="review-grid">
          {pending.map((m) => {
            const p = m.profile;
            return (
              <article key={p.id} className="panel review">
                <ProfilePhoto profile={p} className="review-photo" />
                <div className="review-body">
                  <div className="review-top">
                    <b>
                      {p.firstName}, {p.age} ans
                    </b>
                    <span className="tiny muted">Inscrit(e) {timeAgo(p.createdAt)}</span>
                  </div>
                  <span className="small muted">
                    {p.city}, {p.country} · {p.profession}
                  </span>
                  <div className="d-tags" style={{ marginTop: 4 }}>
                    <span className="badge badge-green">{religionLine(p)}</span>
                    <span className="badge badge-gray">{practiceLabel(p)}</span>
                    <span className="badge badge-gray">{maritalLabel(p)}</span>
                    <span className="badge badge-gray">{INTENTIONS[p.intention]}</span>
                  </div>
                  <p className="review-bio">{p.bio}</p>
                  <span className="tiny muted">
                    {m.email} · téléphone {p.verification.phone === "verified" ? "vérifié" : "non vérifié"} · {p.photo ? "photo réelle" : "illustration"}
                  </span>
                  <div className="review-actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => approve(m)}>
                      <Check size={15} /> Valider
                    </button>
                    <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => setRejecting(m)}>
                      <X size={15} /> Refuser
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <h2 className="adm-sec">
        <Camera size={18} /> Selfies de vérification <span className="count-dot">{selfies.length}</span>
      </h2>
      {selfies.length === 0 ? (
        <div className="panel">
          <Empty icon={BadgeCheck} title="Aucun selfie à vérifier" text="Les demandes de badge « Profil vérifié » apparaîtront ici." />
        </div>
      ) : (
        <div className="panel">
          <ul className="adm-list padded selfie-list">
            {selfies.map(({ profile: p }) => (
              <li key={p.id}>
                <ProfilePhoto profile={p} size={52} round />
                <span>
                  <b>
                    {p.firstName}, {p.age} ans
                  </b>
                  <small>Comparer le selfie envoyé avec les photos du profil</small>
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    await api.adminSetPhotoVerification(p.id, true);
                    toast({ title: `Badge accordé à ${p.firstName}`, kind: "verification" });
                  }}
                >
                  <BadgeCheck size={15} /> Accorder le badge
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => api.adminSetPhotoVerification(p.id, false)}>
                  Refuser
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rejecting && <RejectModal member={rejecting} onClose={() => setRejecting(null)} />}
    </div>
  );
}

function RejectModal({ member, onClose }: { member: AdminMember; onClose: () => void }) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  return (
    <Modal
      open
      onClose={onClose}
      title={`Refuser le profil de ${member.profile.firstName} ?`}
      description="Le membre reçoit le motif et peut corriger son profil avant de le renvoyer."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              await api.adminSetStatus(member.profile.id, "rejected", reason);
              toast({ title: "Profil refusé", body: "Le membre a été informé du motif.", kind: "info" });
              onClose();
            }}
          >
            Refuser le profil
          </button>
        </>
      }
    >
      <div className="radio-list">
        {REJECT_REASONS.map((r) => (
          <label key={r} className={`radio${reason === r ? " sel" : ""}`}>
            <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />
            {r}
          </label>
        ))}
      </div>
    </Modal>
  );
}
