"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FullPageLoader from "@/components/loader";
import { api } from "@/lib/api";

const ACCOUNTS: Record<string, "homme" | "femme" | "admin"> = {
  ibrahim: "homme",
  homme: "homme",
  aicha: "femme",
  femme: "femme",
  admin: "admin",
};

export default function DemoEntry() {
  const { account } = useParams<{ account: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const kind = ACCOUNTS[account?.toLowerCase() ?? ""];
    if (!kind) {
      router.replace("/login");
      return;
    }
    const next = search.get("next");
    api.signInDemo(kind).then((res) => {
      if (!res.ok) return setError(res.error ?? "Connexion impossible.");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.replace(safeNext ?? (kind === "admin" ? "/admin" : "/home"));
    });
  }, [account, search, router]);

  if (error) return <p style={{ padding: 40, textAlign: "center" }}>{error}</p>;
  return <FullPageLoader />;
}
