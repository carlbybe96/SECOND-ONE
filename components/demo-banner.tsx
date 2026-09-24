"use client";

import { isSupabaseConfigured } from "@/lib/auth";

export default function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="demo-banner">
      ⚠️ Mode démo — aucune base de données connectée. Ajoute tes clés dans <code>.env.local</code> pour activer le
      vrai backend Supabase.
    </div>
  );
}