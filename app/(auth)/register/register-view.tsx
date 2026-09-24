"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandPanel from "@/components/brand-panel";
import { ChoiceGrid } from "@/components/onboarding/select";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { APP, CITIES_BY_COUNTRY, COUNTRIES } from "@/lib/config";
import { cleanFirstName } from "@/lib/format";
import type { Gender } from "@/lib/types";

const GENDERS = [
  { value: "homme", label: "Un homme", icon: "👨🏾" },
  { value: "femme", label: "Une femme", icon: "👩🏾" },
];

export default function RegisterView() {
  const router = useRouter();
  const [form, setForm] = useState({
    gender: "" as Gender | "",
    prenom: "",
    age: "",
    pays: "Burkina Faso",
    ville: "Ouagadougou",
    email: "",
    pass: "",
    pass2: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const age = parseInt(form.age, 10);
    const errs: Record<string, boolean> = {
      gender: !form.gender,
      prenom: form.prenom.trim().length < 2,
      age: isNaN(age) || age < 18 || age > 80,
      email: !/^\S+@\S+\.\S+$/.test(form.email),
      pass: form.pass.length < 8,
      pass2: form.pass2 !== form.pass,
      consent: !form.consent,
    };
    setErrors(errs);
    if (errs.age && !isNaN(age) && age < 18) return setErrMsg(`${APP.name} est réservé aux personnes majeures (18 ans et plus).`);
    if (errs.consent && !Object.entries(errs).some(([k, v]) => v && k !== "consent")) return setErrMsg("Merci d'accepter la charte de bonne conduite.");
    if (Object.values(errs).some(Boolean)) return setErrMsg("Vérifie les champs en rouge (mot de passe : 8 caractères minimum).");
    setErrMsg("");
    setBusy(true);
    const res = await api.signUp({
      firstName: cleanFirstName(form.prenom),
      gender: form.gender as Gender,
      age,
      city: form.ville,
      country: form.pays,
      email: form.email.trim(),
      password: form.pass,
    });
    setBusy(false);
    if (!res.ok) return setErrMsg(res.error ?? "Une erreur est survenue.");
    toast({ title: `Bienvenue, ${cleanFirstName(form.prenom)} !`, body: "Ton compte est créé. Construisons ton profil." });
    router.push("/onboarding");
  }

  const cities = CITIES_BY_COUNTRY[form.pays] ?? [];

  return (
    <main className="auth-wrap">
      <div className="flow-card">
        <div className="eyebrow">Inscription gratuite</div>
        <h1>Crée ton profil {APP.name}</h1>
        <p className="sub">
          Une plateforme matrimoniale sérieuse, fondée sur la foi, les valeurs et le projet de vie. <strong>Deux minutes suffisent.</strong>
        </p>
        <form onSubmit={submit} noValidate>
          <div className="row-label" style={{ marginTop: 0 }}>
            Je suis
          </div>
          <div className={errors.gender ? "choices-error" : undefined}>
            <ChoiceGrid options={GENDERS} value={form.gender} onChange={(v) => setForm({ ...form, gender: v as Gender })} />
          </div>
          <div className="form-grid" style={{ marginTop: 18 }}>
            <div className="field">
              <label htmlFor="fPrenom">Prénom</label>
              <input id="fPrenom" type="text" placeholder="Aïcha" autoComplete="given-name" value={form.prenom} onChange={set("prenom")} className={errors.prenom ? "error" : ""} />
            </div>
            <div className="field">
              <label htmlFor="fAge">Âge</label>
              <input id="fAge" type="number" min={18} max={80} placeholder="26" inputMode="numeric" value={form.age} onChange={set("age")} className={errors.age ? "error" : ""} />
            </div>
            <div className="field">
              <label htmlFor="fPays">Pays de résidence</label>
              <select
                id="fPays"
                value={form.pays}
                onChange={(e) => setForm({ ...form, pays: e.target.value, ville: CITIES_BY_COUNTRY[e.target.value]?.[0] ?? "" })}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fVille">Ville</label>
              <select id="fVille" value={form.ville} onChange={set("ville")}>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="fEmail">Adresse e-mail</label>
              <input
                id="fEmail"
                type="email"
                placeholder="aicha@exemple.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={form.email}
                onChange={set("email")}
                className={errors.email ? "error" : ""}
              />
            </div>
            <div className="field">
              <label htmlFor="fPass">Mot de passe</label>
              <input id="fPass" type="password" placeholder="8 caractères minimum" autoComplete="new-password" value={form.pass} onChange={set("pass")} className={errors.pass ? "error" : ""} />
            </div>
            <div className="field">
              <label htmlFor="fPass2">Confirmation</label>
              <input
                id="fPass2"
                type="password"
                placeholder="Répète ton mot de passe"
                autoComplete="new-password"
                value={form.pass2}
                onChange={set("pass2")}
                className={errors.pass2 ? "error" : ""}
              />
            </div>
          </div>
          <label className="consent">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>
              J&apos;ai 18 ans ou plus et j&apos;accepte la <Link href="/legal#charte">charte de bonne conduite</Link> et la{" "}
              <Link href="/legal#confidentialite">politique de confidentialité</Link>.
            </span>
          </label>
          {errMsg && <p className="error-msg">{errMsg}</p>}
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy} style={{ marginTop: 22 }}>
            {busy ? <span className="spinner" /> : "Créer mon compte"}
          </button>
          <p className="foot-note">
            Déjà membre ? <Link href="/login">Se connecter</Link>
          </p>
        </form>
      </div>
      <BrandPanel />
    </main>
  );
}
