import { ChipRow, RowLabel } from "./select";
import type { FamilleData } from "@/lib/types";

const KIDS = ["Oui, j'en veux", "J'en ai déjà", "Non", "Je ne sais pas encore"].map((v) => ({ value: v }));
const KIDS_NUM = ["1", "2", "3", "4 ou plus"].map((v) => ({ value: v }));
const WORK = ["Oui", "Oui, au choix du couple", "Non"].map((v) => ({ value: v }));
const MOVE = ["Oui, n'importe où", "Oui, selon la ville", "Non"].map((v) => ({ value: v }));
const PARENTS = [
  { value: "Oui, famille élargie", label: "Oui, famille élargie" },
  { value: "À proximité", label: "À proximité, pas ensemble" },
  { value: "Non", label: "Non, en couple seulement" },
];
const FAM_IMPORTANCE = ["Très importante", "Importante", "Mesurée"].map((v) => ({ value: v }));

export default function StepFamily({
  value,
  onChange,
}: {
  value: Partial<FamilleData>;
  onChange: (v: Partial<FamilleData>) => void;
}) {
  const set = (k: keyof FamilleData) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <div className="eyebrow">Étape 4 · Vision de la famille</div>
      <h1>Ton projet familial</h1>
      <p className="sub">
        La famille est au cœur du mariage. Dis-nous ta vision pour trouver quelqu&apos;un qui la partage.
      </p>

      <RowLabel>Veux-tu des enfants ?</RowLabel>
      <ChipRow options={KIDS} value={value.enfants} onChange={set("enfants")} />

      <RowLabel>Combien d&apos;enfants idéalement ?</RowLabel>
      <ChipRow options={KIDS_NUM} value={value.nombre} onChange={set("nombre")} />

      <RowLabel>Souhaiterais-tu travailler après le mariage ?</RowLabel>
      <ChipRow options={WORK} value={value.travail} onChange={set("travail")} />

      <RowLabel>Serais-tu prêt(e) à déménager ?</RowLabel>
      <ChipRow options={MOVE} value={value.demenagement} onChange={set("demenagement")} />

      <RowLabel>Vivre avec les parents ?</RowLabel>
      <ChipRow options={PARENTS} value={value.parents} onChange={set("parents")} />

      <RowLabel>Quelle importance pour ta famille dans ta vie ?</RowLabel>
      <ChipRow options={FAM_IMPORTANCE} value={value.importance} onChange={set("importance")} />
    </>
  );
}