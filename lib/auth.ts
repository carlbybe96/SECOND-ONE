import type { FmUser, RegisterInput } from "./types";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export { isSupabaseConfigured };

/* ── Demo-mode storage (only used until Supabase keys are added) ── */

const USERS_KEY = "fm_demo_users";
const SESSION_KEY = "fm_demo_session";

type DemoUser = FmUser & { password: string };

function readDemoUsers(): DemoUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as DemoUser[];
  } catch {
    return [];
  }
}

function writeDemoUsers(users: DemoUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readDemoSession(): FmUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as FmUser) : null;
  } catch {
    return null;
  }
}

function writeDemoSession(user: FmUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/* ── Public API ── */

export async function signUp(input: RegisterInput): Promise<{ user?: FmUser; error?: string }> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          age: input.age,
          city: input.city,
          country: input.country,
        },
      },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Inscription en attente de confirmation par e-mail. Vérifie ta boîte de réception." };
    return { user: mapSupabaseUser(data.user) };
  }

  // Demo mode
  const users = readDemoUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return { error: "Un compte existe déjà avec cette adresse e-mail." };
  }
  const user: FmUser = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `demo_${Date.now()}`,
    email: input.email,
    firstName: input.firstName,
    age: input.age,
    city: input.city,
    country: input.country,
    createdAt: new Date().toISOString(),
  };
  writeDemoUsers([...users, { ...user, password: input.password }]);
  writeDemoSession(user);
  return { user };
}

export async function signIn(email: string, password: string): Promise<{ user?: FmUser; error?: string }> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Connexion impossible." };
    return { user: mapSupabaseUser(data.user) };
  }

  // Demo mode
  const found = readDemoUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found || found.password !== password) {
    return { error: "E-mail ou mot de passe incorrect." };
  }
  const { password: _pw, ...user } = found;
  writeDemoSession(user);
  return { user };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    await sb.auth.signOut();
    return;
  }
  localStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<FmUser | null> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.auth.getSession();
    const u = data.session?.user;
    return u ? mapSupabaseUser(u) : null;
  }
  return readDemoSession();
}

/* ── Helpers ── */

function mapSupabaseUser(u: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown> | null;
  created_at?: string;
}): FmUser {
  const m = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? "",
    firstName: String(m.first_name ?? u.email?.split("@")[0] ?? "membre"),
    age: Number(m.age ?? 0),
    city: String(m.city ?? ""),
    country: String(m.country ?? ""),
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}