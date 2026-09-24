import type { FamilyProject, Profile } from "@/lib/types";
import { ChipRow, RowLabel } from "./select";

export default function StepFamily({ p, set, embedded = false }: { p: Profile; set: (patch: Partial<Profile>) => void; embedded?: boolean }) {
  const fam = p.family;
  const setFam = (patch: Partial<FamilyProject>) => set({ family: { ...fam, ...patch } });
  const wantsKids = fam.kids === "oui" || fam.kids === "deja";

  return (
    <>
      {!embedded && (
        <>
          <div className="eyebrow">Étape 4 · Projet familial</div>
          <h1>Ta vision de la famille</h1>
          <p className="sub">La famille est au cœur du mariage. Dis-nous comment tu la vois pour trouver quelqu&apos;un qui la partage.</p>
        </>
      )}

      <RowLabel>Souhaites-tu des enfants ?</RowLabel>
      <ChipRow
        options={[
          { value: "oui", label: "Oui" },
          ...(p.children > 0 ? [{ value: "deja", label: "J'en ai, et j'en veux encore" }] : []),
          { value: "non", label: "Non" },
          { value: "indecis", label: "Je ne sais pas encore" },
        ]}
        value={fam.kids}
        onChange={(v) => setFam({ kids: v as FamilyProject["kids"] })}
      />

      {wantsKids && (
        <>
          <RowLabel>Combien, idéalement ?</RowLabel>
          <ChipRow options={["1", "2", "3", "4"].map((v) => ({ value: v, label: v === "4" ? "4 ou plus" : v }))} value={String(fam.kidsCount)} onChange={(v) => setFam({ kidsCount: Number(v) })} />
        </>
      )}

      <RowLabel>Souhaites-tu travailler après le mariage ?</RowLabel>
      <ChipRow
        options={[
          { value: "oui", label: "Oui" },
          { value: "choix", label: "Au choix du couple" },
          { value: "non", label: "Non" },
        ]}
        value={fam.work}
        onChange={(v) => setFam({ work: v as FamilyProject["work"] })}
      />

      <RowLabel>Serais-tu prêt(e) à déménager ?</RowLabel>
      <ChipRow
        options={[
          { value: "oui", label: "Oui, même à l'étranger" },
          { value: "ville", label: "Oui, dans le pays" },
          { value: "non", label: "Non" },
        ]}
        value={fam.relocate}
        onChange={(v) => setFam({ relocate: v as FamilyProject["relocate"] })}
      />

      <RowLabel>Vivre avec les parents ?</RowLabel>
      <ChipRow
        options={[
          { value: "elargie", label: "Oui, en famille élargie" },
          { value: "proximite", label: "À proximité, pas ensemble" },
          { value: "non", label: "Non, en couple" },
        ]}
        value={fam.parents}
        onChange={(v) => setFam({ parents: v as FamilyProject["parents"] })}
      />

      <RowLabel>Quelle place pour ta famille dans ta vie ?</RowLabel>
      <ChipRow
        options={[
          { value: "tres", label: "Très importante" },
          { value: "importante", label: "Importante" },
          { value: "mesuree", label: "Mesurée" },
        ]}
        value={fam.importance}
        onChange={(v) => setFam({ importance: v as FamilyProject["importance"] })}
      />
    </>
  );
}
