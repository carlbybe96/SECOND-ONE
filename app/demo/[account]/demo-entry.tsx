"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FullPageLoader from "@/components/loader";
import { api } from "@/lib/api";

const ACCOUNTS: Record<string, "homme" | "femme" | "admin"> = {
  ibrahim: "homme",
  homme: "homme",
  aicha: "femme",
  femme: "femme",
  admin: "admin",
};

/** Comptes vierges pour montrer l'onboarding sans rien taper : /demo/nouveau ou /demo/nouvelle. */
const NEWCOMERS = {
  nouveau: { firstName: "Salif", gender: "homme" as const, age: 30 },
  nouvelle: { firstName: "Awa", gender: "femme" as const, age: 26 },
};

export default function DemoEntry() {
  const { account } = useParams<{ account: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  // En développement, React exécute les effets deux fois : on évite de créer deux comptes.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const key = account?.toLowerCase() ?? "";
    const next = search.get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

    if (key in NEWCOMERS) {
      const who = NEWCOMERS[key as keyof typeof NEWCOMERS];
      const stamp = Date.now().toString(36);
      api
        .signUp({
          ...who,
          city: "Ouagadougou",
          country: "Burkina Faso",
          email: `${who.firstName.toLowerCase()}.${stamp}@demo.faithmatch.app`,
          password: `demo-${stamp}`,
        })
        .then((res) => (res.ok ? router.replace("/onboarding") : setError(res.error ?? "Création impossible.")));
      return;
    }

    const kind = ACCOUNTS[key];
    if (!kind) {
      router.replace("/login");
      return;
    }
    api.signInDemo(kind).then((res) => {
      if (!res.ok) return setError(res.error ?? "Connexion impossible.");
      router.replace(safeNext ?? (kind === "admin" ? "/admin" : "/home"));
    });
  }, [account, search, router]);

  if (error) return <p style={{ padding: 40, textAlign: "center" }}>{error}</p>;
  return <FullPageLoader />;
}
