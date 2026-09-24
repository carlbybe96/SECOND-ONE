"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg("");
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
      setErrMsg("Merci de remplir ton e-mail et ton mot de passe.");
      return;
    }
    setBusy(true);
    const { user, error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error || !user) {
      setErrMsg(error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main>
      <div className="card">
        <div className="eyebrow">Connexion</div>
        <h1>Content de te revoir 👋</h1>
        <p className="sub">
          Connecte-toi pour retrouver tes matchs, tes messages et ton profil.
        </p>
        <form onSubmit={submit} noValidate>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="lEmail">Adresse e-mail</label>
              <input
                id="lEmail"
                type="email"
                placeholder="aicha@exemple.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field full">
              <label htmlFor="lPass">Mot de passe</label>
              <input
                id="lPass"
                type="password"
                placeholder="Ton mot de passe"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className={`error-msg${errMsg ? " show" : ""}`}>{errMsg}</div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Connexion…" : "Se connecter →"}
          </button>
          <p className="foot-note">
            Pas encore de compte ? <Link href="/register">Créer mon profil</Link>
          </p>
        </form>
      </div>
    </main>
  );
}