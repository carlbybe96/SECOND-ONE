"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DemoBanner from "@/components/demo-banner";
import { getSession } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let active = true;
    getSession().then((user) => {
      if (!active) return;
      if (!user) {
        router.replace("/register");
      } else {
        setOk(true);
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ok) return null;

  return (
    <>
      <DemoBanner />
      {children}
    </>
  );
}