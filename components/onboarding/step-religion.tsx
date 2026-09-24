import { ChoiceGrid, ChipRow, RowLabel } from "./select";
import type { ReligionData } from "@/lib/types";

const RELIGIONS = [
  { value: "Islam", icon: "🕌" },
  { value: "Christianisme — Catholique", icon: "⛪" },
  { value: "Christianisme — Évangélique / Protestant", icon: "✝️" },
  { value: "Autre / Préfère ne pas préciser", icon: "✨" },
];

const PRATIQUE = [
  { value: "Très pratiquant", icon: "🟢" },
  { value: "Pratiquant", icon: "🟢" },
  { value: "Peu pratiquant", icon: "🟡" },
  { value: "Non pratiquant", icon: "⚪" },
];

export default function StepReligion({
  value,
  onChange,
}: {
  value: ReligionData;
  onChange: (v: ReligionData) => void;
}) {
  return (
    <>
      <div className="eyebrow">Étape 2 · Identité spirituelle</div>
      <h1>Quelle est ta religion ?</h1>
      <p className="sub">
        Le cœur de la compatibilité. Sois sincère : c&apos;est ce qui te permettra de rencontrer la bonne personne.
      </p>

      <ChoiceGrid
        options={RELIGIONS}
        value={value.religion}
        onChange={(religion) => onChange({ ...value, religion })}
      />

      <RowLabel>
        Ton niveau de pratique
        <span>Ce critère est important pour le matching.</span>
      </RowLabel>
      <ChipRow
        options={PRATIQUE}
        value={value.pratique}
        onChange={(pratique) => onChange({ ...value, pratique })}
      />
    </>
  );
}