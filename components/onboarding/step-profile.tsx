"use client";

import { Camera, Shuffle } from "lucide-react";
import { useRef, useState } from "react";
import ProfilePhoto from "@/components/ui/photo";
import { defaultAvatar } from "@/lib/avatar";
import { EDUCATION_LEVELS, LANGUAGES, MARITAL_LABELS } from "@/lib/config";
import { resizeImage } from "@/lib/image";
import type { Education, Intention, MaritalStatus, Profile } from "@/lib/types";
import { ChipRow, ChoiceGrid, MultiChips, RowLabel } from "./select";

export function profileStepValid(p: Profile) {
  return p.profession.trim().length >= 2 && p.bio.trim().length >= 30 && p.languages.length > 0;
}

export default function StepProfile({ p, set, embedded = false }: { p: Profile; set: (patch: Partial<Profile>) => void; embedded?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const f = p.gender === "femme";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      set({ photo: await resizeImage(file) });
      setErr("");
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Image illisible.");
    }
  }

  return (
    <>
      {!embedded && (
        <>
          <div className="eyebrow">Étape 1 · Ton profil</div>
          <h1>Présente-toi, {p.firstName}</h1>
          <p className="sub">Ces informations apparaissent sur ton profil. Sois sincère : c&apos;est ce qui attire les bonnes personnes.</p>
        </>
      )}

      <div className="photo-picker" style={embedded ? { marginTop: 0 } : undefined}>
        <ProfilePhoto profile={p} size={92} />
        <div className="txt">
          <b>Photo de profil</b>
          <span>Une photo nette de ton visage. Tu peux la flouter jusqu&apos;au match.</span>
          <div className="row">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
              <Camera size={15} /> {p.photo ? "Changer la photo" : "Ajouter une photo"}
            </button>
            {p.photo ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => set({ photo: null })}>
                Utiliser une illustration
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => set({ avatar: defaultAvatar(p.gender, Math.floor(Math.random() * 997), p.religion.key === "islam") })}
              >
                <Shuffle size={15} /> Autre illustration
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
      </div>
      {err && <p className="error-msg">{err}</p>}
      <label className="consent" style={{ marginTop: 12 }}>
        <input type="checkbox" checked={p.privacy.blurPhoto} onChange={(e) => set({ privacy: { ...p.privacy, blurPhoto: e.target.checked } })} />
        <span>Flouter ma photo : seules les personnes avec qui j&apos;ai un match pourront la voir.</span>
      </label>

      <div className="form-grid" style={{ marginTop: 20 }}>
        <div className="field">
          <label htmlFor="oJob">Profession</label>
          <input id="oJob" value={p.profession} maxLength={60} placeholder="Ex. infirmière, comptable, commerçant…" onChange={(e) => set({ profession: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="oEdu">Niveau d&apos;études</label>
          <select id="oEdu" value={p.education} onChange={(e) => set({ education: e.target.value as Education })}>
            {Object.entries(EDUCATION_LEVELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <RowLabel>Situation matrimoniale</RowLabel>
      <ChipRow
        options={(["celibataire", "divorce", "veuf"] as const).map((v) => ({ value: v, label: MARITAL_LABELS[v][p.gender] }))}
        value={p.marital}
        onChange={(v) => set({ marital: v as MaritalStatus })}
      />

      <RowLabel>As-tu des enfants ?</RowLabel>
      <ChipRow
        options={[
          { value: "0", label: "Non" },
          { value: "1", label: "1 enfant" },
          { value: "2", label: "2 enfants" },
          { value: "3", label: "3 ou plus" },
        ]}
        value={String(Math.min(3, p.children))}
        onChange={(v) => set({ children: Number(v), family: { ...p.family, kids: Number(v) > 0 ? "deja" : p.family.kids === "deja" ? "oui" : p.family.kids } })}
      />

      <RowLabel>Ce que tu recherches</RowLabel>
      <ChoiceGrid
        options={[
          { value: "mariage", label: "Le mariage", icon: "💍", hint: f ? "Je suis prête à m'engager" : "Je suis prêt à m'engager" },
          { value: "serieux", label: "Une relation sérieuse", icon: "🤝", hint: "Qui mène au mariage" },
        ]}
        value={p.intention}
        onChange={(v) => set({ intention: v as Intention })}
      />

      <RowLabel>Langues parlées</RowLabel>
      <MultiChips options={LANGUAGES.map((v) => ({ value: v }))} values={p.languages} onChange={(v) => set({ languages: v })} />

      <RowLabel>
        À propos de toi
        <span>Ta personnalité, ce qui compte pour toi, ce que tu recherches (30 caractères minimum).</span>
      </RowLabel>
      <div className="field">
        <textarea
          value={p.bio}
          maxLength={500}
          placeholder={
            f
              ? "Ex. Sage-femme, souriante et attachée à ma famille. Je cherche un homme pieux et bienveillant pour fonder un foyer apaisé."
              : "Ex. Ingénieur, calme et travailleur. Je cherche une femme de foi pour construire une famille unie."
          }
          onChange={(e) => set({ bio: e.target.value })}
        />
      </div>
      <div className="tiny muted" style={{ textAlign: "right", marginTop: 4 }}>
        {p.bio.trim().length}/500
      </div>
    </>
  );
}
