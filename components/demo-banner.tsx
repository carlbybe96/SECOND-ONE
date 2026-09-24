"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, IS_DEMO } from "@/lib/api";
import { toast } from "./ui/toaster";

/** Bandeau discret : rappelle que les profils sont fictifs et permet de repartir de zéro avant une présentation. */
export default function DemoBanner() {
  const router = useRouter();
  if (!IS_DEMO) return null;

  async function reset() {
    if (!window.confirm("Réinitialiser la démo ? Les comptes créés, messages et paiements de test seront effacés.")) return;
    await api.resetDemo();
    toast({ title: "Démo réinitialisée", body: "Les données d'origine sont restaurées." });
    router.push("/");
  }

  return (
    <div className="demo-banner">
      <span>
        <b>Démo interactive</b> · profils fictifs · paiements simulés
      </span>
      <button type="button" onClick={reset}>
        <RotateCcw size={12} /> Réinitialiser
      </button>
    </div>
  );
}
