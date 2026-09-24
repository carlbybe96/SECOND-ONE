"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandPanel from "@/components/brand-panel";
import ProfilePhoto from "@/components/ui/photo";
import { api, IS_DEMO } from "@/lib/api";
import type { Role } from "@/lib/types";

const DEMO_FACES = {
  homme: { gender: "homme" as const, firstName: "Ibrahim", photo: null, avatar: { hair: "court" as const, beard: true, skin: 1, bg: 2, outfit: 1 } },
  femme: {
    gender: "femme" as const,
    firstName: "Aïcha",
    photo: null,
    avatar: { hair: "tresses" as const, headwear: "hijab" as const, skin: 0, bg: 0, outfit: 6, wrap: 1 },
  },
};

export default function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function afterLogin(role?: Role) {
    if (role === "admin") return router.push("/admin");
    const session = await api.getSession();
    router.push(session?.profile?.onboarded ? "/home" : "/onboarding");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg("");
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
      setErrMsg("Merci de remplir ton e-mail et ton mot de passe.");
      return;
    }
    setBusy(true);
    const res = await api.signIn(email, password);
    setBusy(false);
    if (!res.ok) {
      setErrMsg(res.error ?? "Connexion impossible.");
      return;
    }
    await afterLogin(res.role);
  }

  async function demo(kind: "homme" | "femme" | "admin") {
    setBusy(true);
    const res = await api.signInDemo(kind);
    setBusy(false);
    if (!res.ok) {
      setErrMsg(res.error ?? "Connexion impossible.");
      return;
    }
    await afterLogin(res.role);
  }

  return (
    <main className="auth-wrap">
      <div className={`flow-card${IS_DEMO ? " has-demo" : ""}`}>
        <div className="eyebrow">Connexion</div>
        <h1>Content de te revoir 👋</h1>
        <p className="sub">Retrouve tes recommandations, tes matchs et tes conversations.</p>

        <form onSubmit={submit} noValidate>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="lEmail">Adresse e-mail</label>
              <input
                id="lEmail"
                type="email"
                placeholder="aicha@exemple.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
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
          {errMsg && <p className="error-msg">{errMsg}</p>}
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy} style={{ marginTop: 22 }}>
            {busy ? <span className="spinner" /> : "Se connecter"}
          </button>
          <p className="foot-note">
            Pas encore de compte ? <Link href="/register">Créer mon profil gratuitement</Link>
          </p>
        </form>

        {IS_DEMO && (
          <div className="demo-access">
            <h3>
              <Sparkles size={16} color="var(--primary)" /> Accès démo en un clic
            </h3>
            <p>Des comptes déjà remplis, avec des matchs, des messages et des demandes en attente.</p>
            <div className="grid">
              <button type="button" className="demo-btn" onClick={() => demo("homme")} disabled={busy}>
                <ProfilePhoto profile={DEMO_FACES.homme} size={48} round />
                <span>
                  Ibrahim, 31 ans
                  <br />
                  <small>Membre</small>
                </span>
              </button>
              <button type="button" className="demo-btn" onClick={() => demo("femme")} disabled={busy}>
                <ProfilePhoto profile={DEMO_FACES.femme} size={48} round />
                <span>
                  Aïcha, 27 ans
                  <br />
                  <small>Membre</small>
                </span>
              </button>
              <button type="button" className="demo-btn" onClick={() => demo("admin")} disabled={busy}>
                <span className="admin-ico">
                  <ShieldCheck size={22} />
                </span>
                <span>
                  Équipe
                  <br />
                  <small>Administration</small>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
      <BrandPanel />
    </main>
  );
}
