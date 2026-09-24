"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import FullPageLoader from "@/components/loader";
import { useDemoRuntime } from "@/components/runtime";
import { useSession } from "@/lib/hooks";

/** Espace membre : réservé aux personnes connectées, et à un profil terminé (sauf l'onboarding lui-même). */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  useDemoRuntime();
  const router = useRouter();
  const path = usePathname();
  const { data: session, loading } = useSession();
  const inOnboarding = path.startsWith("/onboarding");
  const isAdmin = session?.account.role === "admin";
  const onboarded = !!session?.profile?.onboarded;

  useEffect(() => {
    if (loading) return;
    if (!session) router.replace("/login");
    else if (isAdmin) router.replace("/admin");
    else if (!onboarded && !inOnboarding) router.replace("/onboarding");
  }, [loading, session, isAdmin, onboarded, inOnboarding, router]);

  if (loading || !session || isAdmin || (!onboarded && !inOnboarding)) return <FullPageLoader />;
  return <>{children}</>;
}
