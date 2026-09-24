"use client";

import { BadgeCheck, Ban, Camera, Crown, Download, EyeOff, IdCard, LogOut, Phone, ShieldCheck, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PaywallModal } from "@/components/dialogs";
import { Modal } from "@/components/ui/modal";
import ProfilePhoto from "@/components/ui/photo";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { longDate } from "@/lib/format";
import { useQuery, useSession } from "@/lib/hooks";
import type { Profile, VerifLevel } from "@/lib/types";

function Status({ level }: { level: VerifLevel }) {
  if (level === "verified")
    return (
      <span className="badge badge-green">
        <BadgeCheck size={12} /> Vérifié
      </span>
    );
  if (level === "pending") return <span className="badge badge-amber">En cours de vérification</span>;
  return <span className="badge badge-gray">Non vérifié</span>;
}

export default function SettingsView() {
  const router = useRouter();
  const { data: session } = useSession();
  const me = session?.profile;
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!me) return null;

  async function logout() {
    await api.signOut();
    router.push("/");
  }

  async function exportData() {
    const json = await api.exportMyData();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mes-donnees-${me?.firstName.toLowerCase() ?? "compte"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export prêt", body: "Tes données ont été téléchargées au format JSON." });
  }

  return (
    <div className="page settings">
      <div className="page-head">
        <div>
          <h2>Paramètres</h2>
          <p className="muted small">Sécurité, confidentialité, famille et données personnelles.</p>
        </div>
      </div>

      <Verification me={me} />
      <Privacy me={me} />
      <FamilyMode />
      <Blocked />

      <section className="panel panel-pad set-sec">
        <h3 className="sec-title">
          <Download size={18} /> Mes données
        </h3>
        <p className="small muted">Conformément à la protection des données personnelles, tu peux récupérer toutes tes données ou supprimer définitivement ton compte.</p>
        <div className="set-actions">
          <button type="button" className="btn btn-outline" onClick={exportData}>
            <Download size={16} /> Exporter mes données
          </button>
          <button type="button" className="btn btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} /> Supprimer mon compte
          </button>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>
      </section>

      <DeleteAccount open={confirmDelete} onClose={() => setConfirmDelete(false)} onDeleted={() => router.push("/")} />
    </div>
  );
}

function Verification({ me }: { me: Profile }) {
  const [phone, setPhone] = useState(me.verification.phoneNumber ?? "+226 ");
  const [otp, setOtp] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const selfieRef = useRef<HTMLInputElement>(null);

  async function sendCode() {
    setError("");
    const res = await api.requestPhoneCode(phone);
    if (!res.ok) return setError(res.error ?? "Numéro invalide.");
    setOtp(res.otp ?? null);
  }

  async function confirm() {
    const res = await api.confirmPhoneCode(code);
    if (!res.ok) return setError(res.error ?? "Code incorrect.");
    setOtp(null);
    setCode("");
    toast({ title: "Téléphone vérifié ✅", kind: "verification" });
  }

  return (
    <section className="panel panel-pad set-sec" id="verification">
      <h3 className="sec-title">
        <ShieldCheck size={18} /> Vérification du profil
      </h3>
      <p className="small muted">Les badges rassurent les autres membres. Chaque badge a une signification précise ; un profil vérifié reste à découvrir avec prudence.</p>

      <div className="verif-row">
        <span className="v-ico">
          <Phone size={18} />
        </span>
        <div className="v-txt">
          <b>Téléphone</b>
          <span>Un code est envoyé par SMS au numéro indiqué.</span>
          {me.verification.phone !== "verified" && (
            <div className="v-form">
              {!otp ? (
                <>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" aria-label="Numéro de téléphone" />
                  <button type="button" className="btn btn-primary btn-sm" onClick={sendCode}>
                    Recevoir le code
                  </button>
                </>
              ) : (
                <>
                  <input className="input" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={4} placeholder="Code à 4 chiffres" aria-label="Code reçu" />
                  <button type="button" className="btn btn-primary btn-sm" onClick={confirm}>
                    Valider
                  </button>
                  <span className="demo-otp">
                    Démo : le SMS contiendrait le code <b>{otp}</b>
                  </span>
                </>
              )}
            </div>
          )}
          {error && <p className="error-msg">{error}</p>}
        </div>
        <Status level={me.verification.phone} />
      </div>

      <div className="verif-row">
        <span className="v-ico">
          <Camera size={18} />
        </span>
        <div className="v-txt">
          <b>Selfie de vérification</b>
          <span>Notre équipe compare ton selfie à tes photos. Il n&apos;est jamais affiché sur ton profil.</span>
          {me.verification.photo === "none" && (
            <div className="v-form">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => selfieRef.current?.click()}>
                <Camera size={15} /> Prendre mon selfie
              </button>
              <input
                ref={selfieRef}
                type="file"
                accept="image/*"
                capture="user"
                hidden
                onChange={async (e) => {
                  if (!e.target.files?.length) return;
                  e.target.value = "";
                  await api.submitSelfie();
                  toast({ title: "Selfie envoyé", body: "Vérification par notre équipe en cours (quelques minutes).", kind: "verification" });
                }}
              />
            </div>
          )}
        </div>
        <Status level={me.verification.photo} />
      </div>

      <div className="verif-row">
        <span className="v-ico">
          <IdCard size={18} />
        </span>
        <div className="v-txt">
          <b>Pièce d&apos;identité</b>
          <span>CNIB ou passeport, contrôlé par un prestataire spécialisé. Facultatif, bientôt disponible.</span>
        </div>
        <Status level={me.verification.identity} />
      </div>
    </section>
  );
}

function Privacy({ me }: { me: Profile }) {
  async function toggle(patch: Partial<Profile["privacy"]>) {
    await api.updateMe({ privacy: { ...me.privacy, ...patch } });
  }
  return (
    <section className="panel panel-pad set-sec">
      <h3 className="sec-title">
        <EyeOff size={18} /> Confidentialité et pudeur
      </h3>
      <label className="switch-row">
        <span>
          Flouter mes photos jusqu&apos;au match
          <small>Seules les personnes avec qui tu as un match réciproque voient ta photo nette.</small>
        </span>
        <span className="switch">
          <input type="checkbox" checked={me.privacy.blurPhoto} onChange={(e) => toggle({ blurPhoto: e.target.checked })} />
          <span />
        </span>
      </label>
      <label className="switch-row">
        <span>
          Mode invisible
          <small>Ton profil n&apos;apparaît plus dans les recommandations. Tes matchs et conversations restent actifs.</small>
        </span>
        <span className="switch">
          <input type="checkbox" checked={me.privacy.visibility === "hidden"} onChange={(e) => toggle({ visibility: e.target.checked ? "hidden" : "public" })} />
          <span />
        </span>
      </label>
    </section>
  );
}

const RELATIONS = ["Père", "Mère", "Frère", "Sœur", "Oncle", "Tante", "Imam", "Pasteur / prêtre", "Personne de confiance"];

function FamilyMode() {
  const { data: sub } = useQuery("settings-sub", api.subscriptionState);
  const { data: guardian } = useQuery("guardian", api.getGuardian);
  const [form, setForm] = useState({ name: "", relation: "Père", contact: "" });
  const [paywall, setPaywall] = useState<string | null>(null);
  const [error, setError] = useState("");
  const plusPlan = sub?.plan === "premium_plus";

  async function invite() {
    if (form.name.trim().length < 2 || form.contact.trim().length < 6) return setError("Indique le nom et le contact (téléphone ou e-mail) de ton tuteur.");
    const res = await api.inviteGuardian({ name: form.name.trim(), relation: form.relation, contact: form.contact.trim() });
    if (!res.ok) {
      if (res.code === "premium") return setPaywall(res.error ?? "");
      return setError(res.error ?? "Invitation impossible.");
    }
    setError("");
    toast({ title: "Invitation envoyée", body: `${form.name} va recevoir un lien d'accès limité.`, kind: "system" });
  }

  return (
    <section className="panel panel-pad set-sec">
      <h3 className="sec-title">
        <Users size={18} /> Mode famille{" "}
        <span className="badge badge-gold">
          <Crown size={11} /> Premium+
        </span>
      </h3>
      <p className="small muted">
        Implique un parent, ton tuteur (wali) ou une personne de confiance. Il reçoit un accès limité : il voit tes matchs et peut donner son avis, mais{" "}
        <b>jamais tes conversations privées</b> sans ton accord explicite.
      </p>
      {guardian ? (
        <div className="guardian">
          <span className="g-initial" aria-hidden="true">
            {guardian.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <b>{guardian.name}</b>
            <span className="muted small">
              {guardian.relation} · {guardian.contact}
            </span>
            <span className="badge badge-amber" style={{ marginTop: 4 }}>
              Invitation envoyée le {longDate(guardian.invitedAt)}
            </span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => api.removeGuardian()}>
            Retirer
          </button>
        </div>
      ) : (
        <>
          <div className="form-grid" style={{ marginTop: 14 }}>
            <div className="field">
              <label htmlFor="gName">Nom</label>
              <input id="gName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex. Abdoulaye Ouédraogo" />
            </div>
            <div className="field">
              <label htmlFor="gRel">Lien</label>
              <select id="gRel" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}>
                {RELATIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="gContact">Téléphone ou e-mail</label>
              <input id="gContact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+226 70 00 00 00" />
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="set-actions">
            {plusPlan ? (
              <button type="button" className="btn btn-primary" onClick={invite}>
                Inviter mon tuteur
              </button>
            ) : (
              <Link href="/subscription" className="btn btn-gold">
                <Crown size={16} /> Débloquer avec Premium+
              </Link>
            )}
          </div>
        </>
      )}
      <PaywallModal open={!!paywall} onClose={() => setPaywall(null)} reason={paywall ?? ""} />
    </section>
  );
}

function Blocked() {
  const { data } = useQuery("blocked", api.blockedProfiles);
  return (
    <section className="panel panel-pad set-sec">
      <h3 className="sec-title">
        <Ban size={18} /> Membres bloqués
      </h3>
      {!data?.length ? (
        <p className="small muted">Tu n&apos;as bloqué personne. Tu peux bloquer un membre depuis son profil ou une conversation.</p>
      ) : (
        <ul className="blocked-list">
          {data.map((p) => (
            <li key={p.id}>
              <ProfilePhoto profile={p} size={40} round />
              <b>
                {p.firstName}, {p.age}
              </b>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={async () => {
                  await api.unblockUser(p.id);
                  toast({ title: `${p.firstName} est débloqué(e)`, kind: "info" });
                }}
              >
                Débloquer
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DeleteAccount({ open, onClose, onDeleted }: { open: boolean; onClose: () => void; onDeleted: () => void }) {
  const [text, setText] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Supprimer définitivement ton compte ?"
      description="Ton profil, tes photos, tes matchs et tes conversations seront effacés. Cette action est irréversible."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={text.trim().toUpperCase() !== "SUPPRIMER"}
            onClick={async () => {
              await api.deleteAccount();
              toast({ title: "Compte supprimé", body: "Toutes tes données ont été effacées.", kind: "info" });
              onDeleted();
            }}
          >
            <Trash2 size={16} /> Supprimer
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="delConfirm">Pour confirmer, écris SUPPRIMER</label>
        <input id="delConfirm" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
      </div>
    </Modal>
  );
}
