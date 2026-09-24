import { buildSeed, DB_VERSION, type DemoDB } from "./seed";

/**
 * Base de données de démonstration, stockée dans le navigateur (localStorage).
 * - La session est propre à chaque onglet (sessionStorage) : on peut être membre
 *   dans un onglet et administrateur dans un autre.
 * - Les onglets se synchronisent entre eux via l'événement « storage ».
 */

const DB_KEY = "fm_demo_db";
const SESSION_KEY = "fm_session";

let db: DemoDB | null = null;
const listeners = new Set<() => void>();

const hasWindow = () => typeof window !== "undefined";

function load(): DemoDB {
  if (hasWindow()) {
    try {
      const raw = window.localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoDB;
        if (parsed.v === DB_VERSION) return parsed;
      }
    } catch {
      // stockage illisible : on repart d'une base neuve
    }
  }
  const fresh = buildSeed();
  save(fresh);
  return fresh;
}

function save(value: DemoDB) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(value));
  } catch (e) {
    console.warn("Stockage de la démo impossible (espace plein ?)", e);
  }
}

export function getDb(): DemoDB {
  if (!db) db = load();
  return db;
}

export function emit() {
  listeners.forEach((l) => l());
}

/** À appeler après chaque modification : sauvegarde puis notifie l'interface. */
export function commit() {
  if (db) save(db);
  emit();
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function resetDb() {
  db = buildSeed();
  save(db);
  emit();
}

export function nextId(prefix: string): string {
  const d = getDb();
  d.seq += 1;
  return `${prefix}_${d.seq.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/* ── Session ────────────────────────────────────────────── */

export function getSessionId(): string | null {
  if (!hasWindow()) return null;
  try {
    const own = window.sessionStorage.getItem(SESSION_KEY);
    if (own) return own;
    // Nouvel onglet : on reprend la dernière session ouverte.
    const last = window.localStorage.getItem(SESSION_KEY);
    if (last) window.sessionStorage.setItem(SESSION_KEY, last);
    return last;
  } catch {
    return null;
  }
}

export function setSessionId(id: string | null) {
  if (!hasWindow()) return;
  try {
    if (id) {
      window.sessionStorage.setItem(SESSION_KEY, id);
      window.localStorage.setItem(SESSION_KEY, id);
    } else {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // navigation privée stricte : la session reste en mémoire le temps de l'onglet
  }
  emit();
}

if (hasWindow()) {
  window.addEventListener("storage", (e) => {
    if (e.key === DB_KEY) {
      try {
        db = e.newValue ? (JSON.parse(e.newValue) as DemoDB) : null;
      } catch {
        db = null;
      }
      emit();
    }
  });
}
