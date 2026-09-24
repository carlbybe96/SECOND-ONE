import { ChoiceGrid, ChipRow, RowLabel } from "./select";
import type { PrefData } from "@/lib/types";

const AGES = ["22 – 30 ans", "25 – 35 ans", "28 – 40 ans", "35 – 50 ans"].map((v) => ({ value: v }));
const SEXES = [
  { value: "Femme", icon: "👩🏾" },
  { value: "Homme", icon: "👨🏾" },
];
const RELIGION_PREF = ["Même religion", "Confession compatible", "Peu importe"].map((v) => ({ value: v }));
const PRATIQUE_PREF = ["Même niveau que moi", "Plus pratiquant que moi", "Peu importe"].map((v) => ({ value: v }));
const SITUATION = ["Célibataire", "Divorcé(e)", "Veuf(ve)", "Peu importe"].map((v) => ({ value: v }));
const VILLE = ["Ouagadougou", "Bobo-Dioulasso", "Autre ville du Burkina", "Peu importe"].map((v) => ({ value: v }));

export default function StepPreferences({
  value,
  onChange,
}: {
  value: Partial<PrefData>;
  onChange: (v: Partial<PrefData>) => void;
}) {
  const set = (k: keyof PrefData) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <div className="eyebrow">Étape 3 · Tes préférences</div>
      <h1>Quel type de partenaire recherches-tu ?</h1>
      <p className="sub">
        Ces préférences serviront de filtres stricts pour te proposer des profils compatibles.
      </p>

      <RowLabel>
        Âge recherché
        <span>Filtre strict.</span>
      </RowLabel>
      <ChipRow options={AGES} value={value.age} onChange={set("age")} />

      <RowLabel>Sexe recherché</RowLabel>
      <ChoiceGrid options={SEXES} value={value.sexe} onChange={set("sexe")} />

      <RowLabel>Religion du partenaire</RowLabel>
      <ChipRow options={RELIGION_PREF} value={value.religion} onChange={set("religion")} />

      <RowLabel>Niveau de pratique attendu</RowLabel>
      <ChipRow options={PRATIQUE_PREF} value={value.pratique} onChange={set("pratique")} />

      <RowLabel>Situation matrimoniale</RowLabel>
      <ChipRow options={SITUATION} value={value.situation} onChange={set("situation")} />

      <RowLabel>Localisation</RowLabel>
      <ChipRow options={VILLE} value={value.ville} onChange={set("ville")} />
    </>
  );
}