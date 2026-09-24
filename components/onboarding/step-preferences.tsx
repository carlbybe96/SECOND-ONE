import { MARITAL_LABELS } from "@/lib/config";
import type { MaritalStatus, Preferences, Profile } from "@/lib/types";
import { ChipRow, MultiChips, RowLabel } from "./select";

const AGES = Array.from({ length: 63 }, (_, i) => 18 + i);
const ALL_MARITAL: MaritalStatus[] = ["celibataire", "divorce", "veuf"];

export default function StepPreferences({ p, set, embedded = false }: { p: Profile; set: (patch: Partial<Profile>) => void; embedded?: boolean }) {
  const prefs = p.prefs;
  const setPrefs = (patch: Partial<Preferences>) => set({ prefs: { ...prefs, ...patch } });
  const partner = p.gender === "homme" ? "ta future épouse" : "ton futur époux";
  const other = p.gender === "homme" ? "femme" : "homme";
  const marital = prefs.marital.length ? prefs.marital : ALL_MARITAL;

  return (
    <>
      {!embedded && (
        <>
          <div className="eyebrow">Étape 3 · Tes critères</div>
          <h1>Qui recherches-tu ?</h1>
          <p className="sub">Ces critères filtrent les profils qui te sont proposés, et dans les deux sens : tu ne verras que des personnes qui te recherchent aussi.</p>
        </>
      )}

      <RowLabel>Âge de {partner}</RowLabel>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="pMin">Entre</label>
          <select id="pMin" value={prefs.ageMin} onChange={(e) => setPrefs({ ageMin: Number(e.target.value), ageMax: Math.max(Number(e.target.value), prefs.ageMax) })}>
            {AGES.map((a) => (
              <option key={a} value={a}>
                {a} ans
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pMax">Et</label>
          <select id="pMax" value={prefs.ageMax} onChange={(e) => setPrefs({ ageMax: Number(e.target.value) })}>
            {AGES.filter((a) => a >= prefs.ageMin).map((a) => (
              <option key={a} value={a}>
                {a} ans
              </option>
            ))}
          </select>
        </div>
      </div>

      <RowLabel>Religion</RowLabel>
      <ChipRow
        options={[
          { value: "exact", label: "Même religion et même courant" },
          { value: "same", label: "Même religion" },
          { value: "any", label: "Ouvert(e) à une autre religion" },
        ]}
        value={prefs.religion}
        onChange={(v) => setPrefs({ religion: v as Preferences["religion"] })}
      />

      <RowLabel>Niveau de pratique</RowLabel>
      <ChipRow
        options={[
          { value: "same", label: "Proche du mien" },
          { value: "more", label: "Au moins autant que moi" },
          { value: "any", label: "Peu importe" },
        ]}
        value={prefs.practice}
        onChange={(v) => setPrefs({ practice: v as Preferences["practice"] })}
      />

      <RowLabel>
        Situation matrimoniale acceptée
        <span>Plusieurs choix possibles.</span>
      </RowLabel>
      <MultiChips
        options={ALL_MARITAL.map((m) => ({ value: m, label: MARITAL_LABELS[m][other] }))}
        values={marital}
        onChange={(v) => setPrefs({ marital: v.length === 0 || v.length === ALL_MARITAL.length ? [] : (v as MaritalStatus[]) })}
      />

      <RowLabel>{p.gender === "homme" ? "Elle" : "Il"} peut déjà avoir des enfants</RowLabel>
      <ChipRow
        options={[
          { value: "oui", label: "Oui, sans problème" },
          { value: "non", label: "Je préfère que non" },
        ]}
        value={prefs.acceptsChildren ? "oui" : "non"}
        onChange={(v) => setPrefs({ acceptsChildren: v === "oui" })}
      />

      <RowLabel>Où ?</RowLabel>
      <ChipRow
        options={[
          { value: "city", label: `À ${p.city}` },
          { value: "country", label: `Dans mon pays (${p.country})` },
          { value: "any", label: "Partout, diaspora comprise" },
        ]}
        value={prefs.location}
        onChange={(v) => setPrefs({ location: v as Preferences["location"] })}
      />
    </>
  );
}
