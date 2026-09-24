"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Toast from "@/components/toast";
import { signUp } from "@/lib/auth";

const COUNTRIES = ["Burkina Faso", "Côte d'Ivoire", "Mali", "Sénégal", "France", "Autre"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: "",
    age: "",
    ville: "",
    pays: "Burkina Faso",
    email: "",
    pass: "",
    pass2: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [errMsg, setErrMsg] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const age = parseInt(form.age, 10);
    const errs: Record<string, boolean> = {
      prenom: !form.prenom.trim(),
      age: isNaN(age) || age < 18,
      email: !/^\S+@\S+\.\S+$/.test(form.email),
      pass: form.pass.length < 8,
      pass2: form.pass2 !== form.pass,
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setErrMsg("Merci de remplir correctement tous les champs (mot de passe : 8 caractères min.).");
      return;
    }
    setErrMsg("");
    setBusy(true);
    const { user, error } = await signUp({
      firstName: form.prenom.trim().charAt(0).toUpperCase() + form.prenom.trim().slice(1).toLowerCase(),
      age,
      city: form.ville.trim() || "Ouagadougou",
      country: form.pays,
      email: form.email.trim(),
      password: form.pass,
    });
    setBusy(false);
    if (error || !user) {
      setErrMsg(error ?? "Une erreur est survenue.");
      return;
    }
    setToast(`Compte créé ! Bienvenue, ${user.firstName} 🎉`);
    setTimeout(() => router.push("/onboarding"), 700);
  }

  return (
    <main>
      <div className="card">
        <div className="eyebrow">Étape 1 · Création du compte</div>
        <h1>Bienvenue sur FaithMatch 🙌</h1>
        <p className="sub">
          Une plateforme matrimoniale sérieuse, basée sur la foi, les valeurs et le projet de vie. Crée ton compte
          gratuitement — <strong>2 minutes suffisent</strong>.
        </p>
        <form onSubmit={submit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="fPrenom">Prénom</label>
              <input
                id="fPrenom"
                type="text"
                placeholder="Aïcha"
                autoComplete="given-name"
                value={form.prenom}
                onChange={set("prenom")}
                className={errors.prenom ? "error" : ""}
              />
            </div>
            <div className="field">
              <label htmlFor="fAge">Âge</label>
              <input
                id="fAge"
                type="number"
                min={18}
                max={80}
                placeholder="26"
                inputMode="numeric"
                value={form.age}
                onChange={set("age")}
                className={errors.age ? "error" : ""}
              />
            </div>
            <div className="field">
              <label htmlFor="fVille">Ville</label>
              <input
                id="fVille"
                type="text"
                placeholder="Ouagadougou"
                autoComplete="address-level2"
                value={form.ville}
                onChange={set("ville")}
              />
            </div>
            <div className="field">
              <label htmlFor="fPays">Pays</label>
              <select id="fPays" value={form.pays} onChange={set("pays")}>
                {COUNTRIES.map((c) => (
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
                value={form.email}
                onChange={set("email")}
                className={errors.email ? "error" : ""}
              />
            </div>
            <div className="field">
              <label htmlFor="fPass">Mot de passe</label>
              <input
                id="fPass"
                type="password"
                placeholder="8 caractères min."
                autoComplete="new-password"
                value={form.pass}
                onChange={set("pass")}
                className={errors.pass ? "error" : ""}
              />
            </div>
            <div className="field">
              <label htmlFor="fPass2">Confirmer le mot de passe</label>
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
          <div className={`error-msg${errMsg ? " show" : ""}`}>{errMsg}</div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Création…" : "Créer mon compte →"}
          </button>
          <p className="foot-note">
            Déjà membre ? <Link href="/login">Se connecter</Link>
          </p>
        </form>
      </div>
      <Toast msg={toast} />
    </main>
  );
}