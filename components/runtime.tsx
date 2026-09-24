"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toaster";
import { api, IS_DEMO } from "@/lib/api";

const LOCK_KEY = "fm_tick_lock";

/** Un seul onglet fait tourner le simulateur à la fois (évite les réponses en double). */
function acquireLock(tabId: string): boolean {
  try {
    const raw = window.localStorage.getItem(LOCK_KEY);
    const [owner, ts] = raw ? raw.split("|") : [];
    if (!owner || owner === tabId || Date.now() - Number(ts) > 3000) {
      window.localStorage.setItem(LOCK_KEY, `${tabId}|${Date.now()}`);
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Fait « vivre » la démo : réponses des profils, acceptations, visites, validation…
 * et affiche les nouvelles notifications en toast.
 */
export function useDemoRuntime() {
  useEffect(() => {
    if (!IS_DEMO) return;
    const tabId = Math.random().toString(36).slice(2);
    let beats = 0;

    const showToasts = () => {
      for (const n of api.takeToasts()) toast({ title: n.title, body: n.body, kind: n.kind, href: n.href });
    };

    const loop = () => {
      if (acquireLock(tabId)) api.tick();
      if (++beats % 20 === 0) api.heartbeat();
      if (document.visibilityState === "visible") showToasts();
    };

    showToasts();
    const timer = window.setInterval(loop, 1000);
    return () => window.clearInterval(timer);
  }, []);
}
