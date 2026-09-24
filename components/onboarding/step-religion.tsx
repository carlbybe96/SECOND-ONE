"use client";

import { useState } from "react";
import { defaultAvatar } from "@/lib/avatar";
import { PRACTICE_LEVELS, RELIGIONS, type ReligionKey } from "@/lib/config";
import type { Profile } from "@/lib/types";
import { ChipRow, ChoiceGrid, RowLabel } from "./select";

export function religionStepValid(p: Profile) {
  return p.religion.branch !== "";
}

export default function StepReligion({ p, set, embedded = false }: { p: Profile; set: (patch: Partial<Profile>) => void; embedded?: boolean }) {
  // Tant que la personne n'a rien choisi, aucune religion n'est présélectionnée (PRD §7).
  const [chosen, setChosen] = useState(p.religion.branch !== "");
  const current = chosen ? RELIGIONS.find((r) => r.key === p.religion.key) : undefined;

  function pickReligion(key: string) {
    const k = key as ReligionKey;
    setChosen(true);
    if (k === p.religion.key) return;
    set({
      religion: { ...p.religion, key: k, branch: "" },
      // L'illustration suit la foi déclarée (voile ou non) tant qu'aucune vraie photo n'est ajoutée.
      ...(p.photo ? {} : { avatar: defaultAvatar(p.gender, p.firstName.length * 31 + k.length, k === "islam") }),
    });
  }

  return (
    <>
      {!embedded && (
        <>
          <div className="eyebrow">Étape 2 · Ta foi</div>
          <h1>Quelle est ta religion ?</h1>
          <p className="sub">Le cœur de la compatibilité. Elle n&apos;est jamais attribuée automatiquement : c&apos;est toi qui la déclares.</p>
        </>
      )}

      <div style={{ marginTop: embedded ? 0 : 22 }}>
        <ChoiceGrid options={RELIGIONS.map((r) => ({ value: r.key, label: r.label, icon: r.icon }))} value={chosen ? p.religion.key : ""} onChange={pickReligion} />
      </div>

      {current && (
        <>
          <RowLabel>Précise ton courant ou ta confession</RowLabel>
          <ChipRow options={current.branches.map((b) => ({ value: b }))} value={p.religion.branch} onChange={(branch) => set({ religion: { ...p.religion, branch } })} />
        </>
      )}

      <RowLabel>
        Ton niveau de pratique
        <span>Un critère important pour le matching.</span>
      </RowLabel>
      <ChipRow
        options={PRACTICE_LEVELS.map((label, i) => ({ value: String(i), label }))}
        value={String(p.religion.practice)}
        onChange={(v) => set({ religion: { ...p.religion, practice: Number(v) } })}
      />
    </>
  );
}
