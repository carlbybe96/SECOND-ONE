"use client";

import { Baby, BadgeCheck, BookOpen, Briefcase, Clock, EyeOff, GraduationCap, HandHeart, ListChecks, MapPin, Pencil, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import StepFamily from "@/components/onboarding/step-family";
import StepPreferences from "@/components/onboarding/step-preferences";
import StepProfile, { profileStepValid } from "@/components/onboarding/step-profile";
import StepReligion, { religionStepValid } from "@/components/onboarding/step-religion";
import { PremiumBadge, Verified } from "@/components/ui/bits";
import { Modal } from "@/components/ui/modal";
import ProfilePhoto from "@/components/ui/photo";
import { ScoreRing } from "@/components/ui/score";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { CITIES_BY_COUNTRY, COUNTRIES, INTENTIONS, MARITAL_LABELS } from "@/lib/config";
import { useQuery, useSession } from "@/lib/hooks";
import { childrenLabel, completion, educationLabel, kidsProjectLabel, maritalLabel, practiceLabel, religionLine } from "@/lib/profile-utils";
import { QUIZ } from "@/lib/questions";
import type { Profile } from "@/lib/types";

type Section = "profil" | "foi" | "criteres" | "famille" | "lieu";

const TITLES: Record<Section, string> = {
  profil: "Photo, informations et présentation",
  foi: "Ta foi",
  criteres: "Tes critères de recherche",
  famille: "Ton projet familial",
  lieu: "Ta ville",
};

export default function MyProfileView() {
  const { data: session } = useSession();
  const { data: sub } = useQuery("my-sub", api.subscriptionState);
  const me = session?.profile;
  const [editing, setEditing] = useState<Section | null>(null);
  if (!me) return null;
  const comp = completion(me);
  const answered = Object.keys(me.answers).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Mon profil</h2>
          <p className="muted small">Voici comment les autres membres te voient. Clique sur « Modifier » pour mettre à jour une section.</p>
        </div>
      </div>

      {me.status === "pending" && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <Clock size={18} />
          <span>Ton profil est en cours de validation par notre équipe. Il sera visible des autres membres dès sa validation.</span>
        </div>
      )}
      {me.status === "rejected" && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <Clock size={18} />
          <span>
            <b>Profil à compléter :</b> {me.statusReason ?? "modifie ton profil pour qu'il respecte nos règles."}
          </span>
        </div>
      )}

      <div className="me-grid">
        <aside className="panel me-card">
          <ProfilePhoto profile={me} className="me-photo" />
          <div className="me-body">
            <div className="pf-name">
              <h3>
                {me.firstName}, {me.age} ans
              </h3>
              <Verified profile={me} />
              <PremiumBadge plan={sub?.plan ?? "free"} />
            </div>
            <div className="pf-facts" style={{ fontSize: ".88rem" }}>
              <span>
                <MapPin size={14} /> {me.city}
              </span>
              <span>
                <Briefcase size={14} /> {me.profession || "Profession ?"}
              </span>
            </div>
            <div className="d-tags">
              <span className="badge badge-green">{religionLine(me)}</span>
              <span className="badge badge-gray">{practiceLabel(me)}</span>
              {me.privacy.blurPhoto && (
                <span className="badge badge-blue">
                  <EyeOff size={12} /> Photo floutée
                </span>
              )}
            </div>
            <div className="me-completion">
              <ScoreRing score={comp.pct} size={64} stroke={6} />
              <div>
                <b>Profil complété à {comp.pct} %</b>
                {comp.missing[0] && (
                  <Link href={comp.missing[0].href} className="link" style={{ display: "flex" }}>
                    {comp.missing[0].label}
                  </Link>
                )}
              </div>
            </div>
            <Link href="/settings#verification" className="btn btn-outline btn-sm btn-block">
              <BadgeCheck size={15} /> Vérification et confidentialité
            </Link>
          </div>
        </aside>

        <div className="me-sections">
          <Block title="À propos de moi" icon={BookOpen} onEdit={() => setEditing("profil")}>
            <p className="pf-bio">{me.bio || <span className="muted">Ajoute quelques phrases sur toi.</span>}</p>
            <dl className="facts" style={{ marginTop: 14 }}>
              <div>
                <dt>Situation</dt>
                <dd>{maritalLabel(me)}</dd>
              </div>
              <div>
                <dt>Enfants</dt>
                <dd>{childrenLabel(me)}</dd>
              </div>
              <div>
                <dt>Études</dt>
                <dd>
                  <GraduationCap size={14} style={{ verticalAlign: "-2px" }} /> {educationLabel(me)}
                </dd>
              </div>
              <div>
                <dt>Je recherche</dt>
                <dd>{INTENTIONS[me.intention]}</dd>
              </div>
              <div>
                <dt>Langues</dt>
                <dd>{me.languages.join(", ")}</dd>
              </div>
              <div>
                <dt>Ville</dt>
                <dd>
                  {me.city}, {me.country}{" "}
                  <button type="button" className="link" onClick={() => setEditing("lieu")}>
                    changer
                  </button>
                </dd>
              </div>
            </dl>
          </Block>

          <Block title="Ma foi" icon={HandHeart} onEdit={() => setEditing("foi")}>
            <dl className="facts">
              <div>
                <dt>Religion</dt>
                <dd>{religionLine(me)}</dd>
              </div>
              <div>
                <dt>Pratique</dt>
                <dd>{practiceLabel(me)}</dd>
              </div>
            </dl>
          </Block>

          <Block title="Mes critères de recherche" icon={SlidersHorizontal} onEdit={() => setEditing("criteres")}>
            <dl className="facts">
              <div>
                <dt>Âge</dt>
                <dd>
                  De {me.prefs.ageMin} à {me.prefs.ageMax} ans
                </dd>
              </div>
              <div>
                <dt>Religion</dt>
                <dd>{me.prefs.religion === "exact" ? "Même religion et même courant" : me.prefs.religion === "same" ? "Même religion" : "Ouvert(e)"}</dd>
              </div>
              <div>
                <dt>Pratique</dt>
                <dd>{me.prefs.practice === "same" ? "Proche de la mienne" : me.prefs.practice === "more" ? "Au moins autant que moi" : "Peu importe"}</dd>
              </div>
              <div>
                <dt>Situation</dt>
                <dd>
                  {me.prefs.marital.length === 0
                    ? "Toutes"
                    : me.prefs.marital.map((m) => MARITAL_LABELS[m][me.gender === "homme" ? "femme" : "homme"]).join(", ")}
                </dd>
              </div>
              <div>
                <dt>Localisation</dt>
                <dd>{me.prefs.location === "city" ? `À ${me.city}` : me.prefs.location === "country" ? `En ${me.country}` : "Partout"}</dd>
              </div>
              <div>
                <dt>Enfants existants</dt>
                <dd>{me.prefs.acceptsChildren ? "Acceptés" : "De préférence non"}</dd>
              </div>
            </dl>
          </Block>

          <Block title="Mon projet familial" icon={Baby} onEdit={() => setEditing("famille")}>
            <p className="small">{kidsProjectLabel(me)}</p>
          </Block>

          <Block
            title="Questionnaire de compatibilité"
            icon={ListChecks}
            action={
              <Link href="/onboarding?step=5" className="btn btn-outline btn-sm">
                <Pencil size={14} /> Refaire
              </Link>
            }
          >
            <p className="small">
              {answered}/{QUIZ.length} questions répondues. Tes réponses servent à calculer ta compatibilité avec chaque profil ; elles ne sont jamais affichées telles
              quelles aux autres membres.
            </p>
          </Block>
        </div>
      </div>

      {editing && <EditModal key={editing} section={editing} me={me} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Block({
  title,
  icon: Icon,
  onEdit,
  action,
  children,
}: {
  title: string;
  icon: typeof BookOpen;
  onEdit?: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel panel-pad">
      <div className="panel-head">
        <h3 className="sec-title" style={{ margin: 0 }}>
          <Icon size={18} /> {title}
        </h3>
        {action ??
          (onEdit && (
            <button type="button" className="btn btn-outline btn-sm" onClick={onEdit}>
              <Pencil size={14} /> Modifier
            </button>
          ))}
      </div>
      {children}
    </section>
  );
}

function EditModal({ section, me, onClose }: { section: Section; me: Profile; onClose: () => void }) {
  const [draft, setDraft] = useState<Profile>(me);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }));
  const valid = section === "profil" ? profileStepValid(draft) : section === "foi" ? religionStepValid(draft) : true;

  async function save() {
    setBusy(true);
    const { id: _id, firstName: _f, ...patch } = draft;
    await api.updateMe(patch);
    setBusy(false);
    toast({ title: "Profil mis à jour", body: "Tes compatibilités ont été recalculées." });
    onClose();
  }

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={TITLES[section]}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={!valid || busy}>
            Enregistrer
          </button>
        </>
      }
    >
      {section === "profil" && <StepProfile p={draft} set={set} embedded />}
      {section === "foi" && <StepReligion p={draft} set={set} embedded />}
      {section === "criteres" && <StepPreferences p={draft} set={set} embedded />}
      {section === "famille" && <StepFamily p={draft} set={set} embedded />}
      {section === "lieu" && (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="eCountry">Pays</label>
            <select id="eCountry" value={draft.country} onChange={(e) => set({ country: e.target.value, city: CITIES_BY_COUNTRY[e.target.value]?.[0] ?? "" })}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="eCity">Ville</label>
            <select id="eCity" value={draft.city} onChange={(e) => set({ city: e.target.value })}>
              {(CITIES_BY_COUNTRY[draft.country] ?? []).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </Modal>
  );
}
