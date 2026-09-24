"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

type QueryState<T> = { data: T | undefined; error: string | null; loading: boolean };

/**
 * Charge une donnée via l'API et la recharge à chaque changement de la base
 * (action de l'utilisateur, réponse simulée, autre onglet…).
 * `key` identifie la requête : quand il change, on recharge.
 */
export function useQuery<T>(key: string, fn: () => Promise<T>) {
  const [state, setState] = useState<QueryState<T>>({ data: undefined, error: null, loading: true });
  const fnRef = useRef(fn);
  const seq = useRef(0);

  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback(() => {
    const id = ++seq.current;
    fnRef.current().then(
      (data) => {
        if (id === seq.current) setState({ data, error: null, loading: false });
      },
      (e: unknown) => {
        if (id === seq.current) setState((s) => ({ ...s, error: e instanceof Error ? e.message : String(e), loading: false }));
      },
    );
  }, []);

  useEffect(() => {
    run();
  }, [key, run]);

  useEffect(() => api.subscribe(run), [run]);

  return { ...state, refresh: run };
}

export function useSession() {
  return useQuery("session", api.getSession);
}

/** Horloge qui force un rendu régulier (heures relatives, « écrit… »). */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
