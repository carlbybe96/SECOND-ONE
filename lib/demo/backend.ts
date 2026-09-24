import { BOOST, LIMITS, PLANS, REPORT_REASONS, type PayMethod, type PlanKey } from "../config";
import { compatibility, hardFilter } from "../compat";
import { dayKey, presence } from "../format";
import { analyzeMessage } from "../moderation";
import type {
  Account,
  AppNotification,
  Compat,
  Gender,
  Guardian,
  Interest,
  Match,
  Message,
  Payment,
  PaymentItem,
  Profile,
  Report,
  Role,
} from "../types";
import { defaultAvatar } from "../avatar";
import { botReply } from "./replies";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, type DemoDB } from "./seed";
import { commit, emit, getDb, getSessionId, nextId, resetDb, setSessionId, subscribe } from "./store";

/* ═════════════════════ Types exposés à l'interface ═════════════════════ */

export type Session = { account: Account; profile: Profile | null };

export type ProfileCard = {
  profile: Profile;
  compat: Compat;
  photoLocked: boolean;
  online: boolean;
  matchId?: string;
  sent?: Interest;
  received?: Interest;
  boosted: boolean;
};

export type DiscoverFilters = {
  sort: "compat" | "recent" | "distance";
  country: string;
  ageMin: number;
  ageMax: number;
  practice: number | null;
  verifiedOnly: boolean;
  noChildren: boolean;
};

export type Quota = {
  plan: PlanKey;
  views: { used: number; limit: number };
  interests: { used: number; limit: number };
  supers: { used: number; limit: number };
};

export type MatchItem = {
  match: Match;
  other: Profile;
  compat: Compat;
  last?: Message;
  unread: number;
  isNew: boolean;
};

export type Conversation = {
  match: Match;
  other: Profile;
  compat: Compat;
  messages: Message[];
  typingUntil: number | null;
  warning: string | null;
  otherOnline: boolean;
};

export type ActionResult = { ok: boolean; error?: string; code?: "quota" | "premium" | "blocked" | "invalid"; notice?: string; matchId?: string };

/* ═════════════════════ Outils internes ═════════════════════ */

const MIN = 60_000;
const DAY = 86_400_000;
const nowIso = () => new Date().toISOString();

function me(d: DemoDB): Profile {
  const id = getSessionId();
  const p = id ? d.profiles[id] : undefined;
  if (!p) throw new Error("Session expirée, reconnecte-toi.");
  return p;
}

function account(d: DemoDB, id: string | null): Account | undefined {
  return id ? d.accounts.find((a) => a.id === id) : undefined;
}

function isAdmin(d: DemoDB): boolean {
  return account(d, getSessionId())?.role === "admin";
}

function requireAdmin(d: DemoDB) {
  if (!isAdmin(d)) throw new Error("Accès réservé à l'équipe de modération.");
}

/** Profil « humain » : piloté par une personne (compte démo ou inscrit), pas par le simulateur. */
function isHuman(p: Profile) {
  return !p.seeded;
}

function activePlan(p: Profile): PlanKey {
  if (p.plan !== "free" && p.planUntil && new Date(p.planUntil).getTime() > Date.now()) return p.plan;
  return "free";
}

function counter(d: DemoDB, key: string) {
  return d.counters[key] ?? 0;
}

function bump(d: DemoDB, key: string) {
  d.counters[key] = counter(d, key) + 1;
}

function blockedBetween(d: DemoDB, a: string, b: string) {
  return d.blocks.some((x) => (x.by === a && x.target === b) || (x.by === b && x.target === a));
}

function findMatch(d: DemoDB, a: string, b: string): Match | undefined {
  return d.matches.find((m) => !m.closedBy && m.users.includes(a) && m.users.includes(b));
}

function otherOf(m: Match, uid: string) {
  return m.users[0] === uid ? m.users[1] : m.users[0];
}

/** Retire ce qui ne doit pas sortir de la « base » (numéro, tuteur, scénario de démo). */
function publicProfile(p: Profile): Profile {
  const { persona: _persona, guardian: _guardian, ...rest } = p;
  return { ...rest, verification: { ...p.verification, phoneNumber: undefined } };
}

function card(d: DemoDB, viewer: Profile, other: Profile): ProfileCard {
  const match = findMatch(d, viewer.id, other.id);
  return {
    profile: publicProfile(other),
    compat: compatibility(viewer, other),
    photoLocked: other.privacy.blurPhoto && !match && viewer.id !== other.id && !isAdmin(d),
    online: presence(other.lastActiveAt).online,
    matchId: match?.id,
    sent: d.interests.find((i) => i.from === viewer.id && i.to === other.id),
    received: d.interests.find((i) => i.from === other.id && i.to === viewer.id),
    boosted: !!other.boostUntil && new Date(other.boostUntil).getTime() > Date.now(),
  };
}

function notify(d: DemoDB, userId: string, kind: AppNotification["kind"], title: string, body: string, href?: string) {
  const target = d.profiles[userId];
  if (!target || !isHuman(target)) return;
  d.notifications.push({ id: nextId("n"), userId, kind, title, body, href, createdAt: nowIso(), read: false });
}

function schedule(d: DemoDB, type: DemoDB["scheduled"][number]["type"], delayMs: number, payload: Record<string, string>) {
  d.scheduled.push({ id: nextId("s"), due: Date.now() + delayMs, type, payload });
}

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

function createMatch(d: DemoDB, a: string, b: string): Match {
  const existing = findMatch(d, a, b);
  if (existing) return existing;
  const match: Match = { id: nextId("m"), users: [a, b], createdAt: nowIso(), stage: 0 };
  d.matches.push(match);
  return match;
}

/* ═════════════════════ Abonnement aux changements ═════════════════════ */

export { subscribe };

/* ═════════════════════ Authentification ═════════════════════ */

export async function getSession(): Promise<Session | null> {
  const d = getDb();
  const acc = account(d, getSessionId());
  if (!acc) return null;
  return { account: acc, profile: d.profiles[acc.id] ?? null };
}

export type SignUpInput = {
  firstName: string;
  gender: Gender;
  age: number;
  city: string;
  country: string;
  email: string;
  password: string;
};

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  const d = getDb();
  const email = input.email.trim().toLowerCase();
  if (d.accounts.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false, error: "Un compte existe déjà avec cette adresse e-mail." };
  }
  const id = nextId("u");
  const created = nowIso();
  d.accounts.push({ id, email, password: input.password, role: "member", createdAt: created });
  const young = input.age < 30;
  d.profiles[id] = {
    id,
    firstName: input.firstName,
    gender: input.gender,
    age: input.age,
    city: input.city,
    country: input.country,
    profession: "",
    education: "licence",
    marital: "celibataire",
    children: 0,
    intention: "mariage",
    bio: "",
    languages: ["Français"],
    religion: { key: "islam", branch: "", practice: 1 },
    prefs: {
      ageMin: input.gender === "homme" ? Math.max(18, input.age - 10) : Math.max(18, input.age - 3),
      ageMax: input.gender === "homme" ? input.age + 3 : input.age + (young ? 10 : 12),
      religion: "same",
      practice: "any",
      marital: [],
      location: "any",
      acceptsChildren: true,
    },
    family: { kids: "oui", kidsCount: 3, work: "oui", relocate: "ville", parents: "proximite", importance: "tres" },
    answers: {},
    photo: null,
    avatar: defaultAvatar(input.gender, Date.now() % 997, false),
    privacy: { blurPhoto: false, visibility: "public" },
    verification: { phone: "none", photo: "none", identity: "none" },
    status: "pending",
    plan: "free",
    onboarded: false,
    createdAt: created,
    lastActiveAt: created,
  };
  setSessionId(id);
  commit();
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<ActionResult & { role?: Role }> {
  const d = getDb();
  const acc = d.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!acc || acc.password !== password) return { ok: false, error: "E-mail ou mot de passe incorrect." };
  const p = d.profiles[acc.id];
  if (p?.status === "banned") return { ok: false, error: "Ce compte a été banni suite à un manquement à la charte." };
  setSessionId(acc.id);
  if (p) {
    p.lastActiveAt = nowIso();
    welcomeEvents(d, p);
  }
  commit();
  return { ok: true, role: acc.role };
}

export async function signInDemo(kind: keyof typeof DEMO_ACCOUNTS) {
  return signIn(DEMO_ACCOUNTS[kind].email, DEMO_PASSWORD);
}

export async function signOut() {
  setSessionId(null);
}

export async function resetDemo() {
  const keepSession = getSessionId();
  resetDb();
  const d = getDb();
  if (keepSession && !d.accounts.some((a) => a.id === keepSession)) setSessionId(null);
}

/* ═════════════════════ Profil ═════════════════════ */

export async function updateMe(patch: Partial<Profile>): Promise<Profile> {
  const d = getDb();
  const p = me(d);
  const protectedKeys = ["id", "status", "plan", "planUntil", "verification", "seeded", "persona", "createdAt"] as const;
  const clean = { ...patch } as Record<string, unknown>;
  for (const k of protectedKeys) delete clean[k];
  Object.assign(p, clean);
  p.lastActiveAt = nowIso();
  commit();
  return p;
}

export async function completeOnboarding(patch: Partial<Profile>): Promise<void> {
  const d = getDb();
  const p = me(d);
  await updateMe({ ...patch, onboarded: true });
  if (!d.flags[`onboarded:${p.id}`]) {
    d.flags[`onboarded:${p.id}`] = true;
    notify(d, p.id, "system", "Profil envoyé en validation", "Notre équipe vérifie chaque profil à la main. Tu peux déjà découvrir des profils compatibles.", "/home");
    // Validation automatique au bout de 90 s si l'admin ne l'a pas faite entre-temps (démo à deux onglets).
    schedule(d, "approve_profile", 90_000, { userId: p.id });
    schedule(d, "visit", 20_000, { to: p.id });
    schedule(d, "visit", 70_000, { to: p.id });
    schedule(d, "incoming_interest", 100_000, { to: p.id });
    schedule(d, "incoming_interest", 170_000, { to: p.id });
    commit();
  }
}

/** Quelques événements « vivants » à la connexion d'un compte de démo (une fois par jour). */
function welcomeEvents(d: DemoDB, p: Profile) {
  if (p.seeded || !p.onboarded) return;
  const key = `welcome:${p.id}:${dayKey()}`;
  if (d.flags[key]) return;
  d.flags[key] = true;
  schedule(d, "visit", 25_000, { to: p.id });
  schedule(d, "incoming_interest", 50_000, { to: p.id });
}

export async function getProfile(id: string): Promise<ProfileCard | null> {
  const d = getDb();
  const viewer = me(d);
  const other = d.profiles[id];
  if (!other) return null;
  if (other.id === viewer.id) return card(d, viewer, other);
  if (!isAdmin(d) && (blockedBetween(d, viewer.id, other.id) || other.status !== "approved")) return null;
  return card(d, viewer, other);
}

export async function recordVisit(targetId: string) {
  const d = getDb();
  const viewer = me(d);
  if (targetId === viewer.id || isAdmin(d)) return;
  const key = `visit:${viewer.id}:${targetId}:${dayKey()}`;
  if (d.flags[key]) return;
  d.flags[key] = true;
  d.visits.push({ id: nextId("v"), from: viewer.id, to: targetId, at: nowIso() });
  const target = d.profiles[targetId];
  if (target && isHuman(target)) {
    const premium = activePlan(target) !== "free";
    notify(d, targetId, "visit", "Nouvelle visite", premium ? `${viewer.firstName} a consulté ton profil.` : "Quelqu'un a consulté ton profil.", "/matches?tab=visites");
  }
  commit();
}

/* ═════════════════════ Découverte ═════════════════════ */

export async function getQuota(): Promise<Quota> {
  const d = getDb();
  const p = me(d);
  const plan = activePlan(p);
  const day = dayKey();
  return {
    plan,
    views: { used: counter(d, `v:${p.id}:${day}`), limit: LIMITS[plan].profilesPerDay },
    interests: { used: counter(d, `i:${p.id}:${day}`), limit: LIMITS[plan].interestsPerDay },
    supers: { used: counter(d, `s:${p.id}:${day}`), limit: LIMITS[plan].superPerDay },
  };
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  sort: "compat",
  country: "",
  ageMin: 18,
  ageMax: 80,
  practice: null,
  verifiedOnly: false,
  noChildren: false,
};

export async function discover(filters: DiscoverFilters): Promise<{ items: ProfileCard[]; exhausted: boolean; quota: Quota }> {
  const d = getDb();
  const viewer = me(d);
  const quota = await getQuota();
  const touched = new Set<string>([
    ...d.passes.filter((x) => x.from === viewer.id).map((x) => x.to),
    ...d.interests.filter((x) => x.from === viewer.id).map((x) => x.to),
    ...d.interests.filter((x) => x.to === viewer.id && x.status !== "declined").map((x) => x.from),
    ...d.matches.filter((m) => m.users.includes(viewer.id)).map((m) => otherOf(m, viewer.id)),
  ]);
  const premium = quota.plan !== "free";

  const items = Object.values(d.profiles)
    .filter((p) => p.id !== viewer.id && p.status === "approved" && p.privacy.visibility === "public" && p.onboarded)
    .filter((p) => !touched.has(p.id) && !blockedBetween(d, viewer.id, p.id) && !hardFilter(viewer, p))
    .filter((p) => (!filters.country || p.country === filters.country) && p.age >= filters.ageMin && p.age <= filters.ageMax)
    .filter((p) => filters.practice === null || p.religion.practice === filters.practice)
    .filter((p) => !filters.noChildren || p.children === 0)
    .filter((p) => !(premium && filters.verifiedOnly) || p.verification.photo === "verified")
    .map((p) => card(d, viewer, p));

  const sameCity = (c: ProfileCard) => (c.profile.city === viewer.city ? 2 : c.profile.country === viewer.country ? 1 : 0);
  items.sort((a, b) => {
    if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
    if (filters.sort === "recent") return b.profile.lastActiveAt.localeCompare(a.profile.lastActiveAt);
    if (filters.sort === "distance") return sameCity(b) - sameCity(a) || b.compat.score - a.compat.score;
    const bonus = (c: ProfileCard) => (activePlan(c.profile) === "premium_plus" ? 3 : 0);
    return b.compat.score + bonus(b) - (a.compat.score + bonus(a));
  });

  const exhausted = quota.views.used >= quota.views.limit;
  return { items: exhausted ? [] : items, exhausted, quota };
}

export async function pass(targetId: string) {
  const d = getDb();
  const viewer = me(d);
  d.passes.push({ from: viewer.id, to: targetId, at: nowIso() });
  bump(d, `v:${viewer.id}:${dayKey()}`);
  commit();
}

/* ═════════════════════ Intérêts & matchs ═════════════════════ */

export async function sendInterest(targetId: string, kind: Interest["kind"], message?: string): Promise<ActionResult> {
  const d = getDb();
  const viewer = me(d);
  const target = d.profiles[targetId];
  if (!target || target.status !== "approved") return { ok: false, error: "Ce profil n'est plus disponible.", code: "invalid" };
  if (blockedBetween(d, viewer.id, targetId)) return { ok: false, error: "Ce profil n'est plus disponible.", code: "blocked" };
  if (d.interests.some((i) => i.from === viewer.id && i.to === targetId)) {
    return { ok: false, error: "Tu as déjà manifesté ton intérêt pour ce profil.", code: "invalid" };
  }
  const quota = await getQuota();
  if (kind === "super") {
    if (quota.supers.limit === 0) return { ok: false, error: "Le super-intérêt est réservé aux membres Premium.", code: "premium" };
    if (quota.supers.used >= quota.supers.limit) return { ok: false, error: "Tu as utilisé tous tes super-intérêts du jour.", code: "quota" };
  }
  if (quota.interests.used >= quota.interests.limit) {
    return { ok: false, error: `Tu as atteint la limite de ${quota.interests.limit} intérêts par jour.`, code: "quota" };
  }

  const day = dayKey();
  bump(d, `i:${viewer.id}:${day}`);
  bump(d, `v:${viewer.id}:${day}`);
  if (kind === "super") bump(d, `s:${viewer.id}:${day}`);

  // Intérêt réciproque déjà en attente : c'est un match immédiat.
  const reverse = d.interests.find((i) => i.from === targetId && i.to === viewer.id && i.status === "pending");
  const interest: Interest = { id: nextId("i"), from: viewer.id, to: targetId, kind, message: message?.trim() || undefined, status: "pending", createdAt: nowIso() };
  d.interests.push(interest);
  if (reverse) {
    reverse.status = "accepted";
    reverse.respondedAt = nowIso();
    interest.status = "accepted";
    interest.respondedAt = nowIso();
    const match = createMatch(d, viewer.id, targetId);
    notify(d, targetId, "match", "C'est réciproque ! 🎉", `${viewer.firstName} partage ton intérêt. Lancez la conversation !`, `/messages/${match.id}`);
    commit();
    return { ok: true, matchId: match.id };
  }

  if (isHuman(target)) {
    notify(d, targetId, "interest", kind === "super" ? "Super-intérêt reçu ⭐" : "Nouvel intérêt", `${viewer.firstName} s'intéresse à ton profil.`, "/matches?tab=recus");
  } else {
    // Réaction simulée du profil fictif, selon la compatibilité.
    const score = compatibility(target, viewer).score;
    if (target.persona === "scam" || score >= 70 || (score >= 55 && Math.random() < 0.6)) {
      schedule(d, "accept", kind === "super" ? rand(3_000, 5_000) : rand(5_000, 10_000), { interestId: interest.id });
    } else {
      schedule(d, "decline", rand(30_000, 60_000), { interestId: interest.id });
    }
  }
  commit();
  return { ok: true };
}

export async function respondInterest(interestId: string, accept: boolean): Promise<ActionResult> {
  const d = getDb();
  const viewer = me(d);
  const it = d.interests.find((i) => i.id === interestId && i.to === viewer.id);
  if (!it || it.status !== "pending") return { ok: false, error: "Cette demande n'est plus en attente.", code: "invalid" };
  it.status = accept ? "accepted" : "declined";
  it.respondedAt = nowIso();
  if (!accept) {
    commit();
    return { ok: true };
  }
  const match = createMatch(d, viewer.id, it.from);
  const sender = d.profiles[it.from];
  if (sender && isHuman(sender)) {
    notify(d, it.from, "match", "C'est réciproque ! 🎉", `${viewer.firstName} a accepté ta demande. Lancez la conversation !`, `/messages/${match.id}`);
  } else if (sender) {
    schedule(d, "reply", rand(6_000, 11_000), { matchId: match.id, botId: sender.id, text: "", opener: "1" });
  }
  commit();
  return { ok: true, matchId: match.id };
}

export async function interestsReceived(): Promise<{ interest: Interest; card: ProfileCard }[]> {
  const d = getDb();
  const viewer = me(d);
  return d.interests
    .filter((i) => i.to === viewer.id && i.status === "pending")
    .filter((i) => d.profiles[i.from]?.status === "approved" && !blockedBetween(d, viewer.id, i.from))
    .sort((a, b) => Number(b.kind === "super") - Number(a.kind === "super") || b.createdAt.localeCompare(a.createdAt))
    .map((interest) => ({ interest, card: card(d, viewer, d.profiles[interest.from]) }));
}

export async function interestsSent(): Promise<{ interest: Interest; card: ProfileCard }[]> {
  const d = getDb();
  const viewer = me(d);
  return d.interests
    .filter((i) => i.from === viewer.id && d.profiles[i.to] && !blockedBetween(d, viewer.id, i.to))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((interest) => ({ interest, card: card(d, viewer, d.profiles[interest.to]) }));
}

export async function listMatches(): Promise<MatchItem[]> {
  const d = getDb();
  const viewer = me(d);
  return d.matches
    .filter((m) => !m.closedBy && m.users.includes(viewer.id))
    .map((match) => {
      const other = d.profiles[otherOf(match, viewer.id)];
      const msgs = d.messages.filter((x) => x.matchId === match.id);
      return {
        match,
        other: publicProfile(other),
        compat: compatibility(viewer, other),
        last: msgs[msgs.length - 1],
        unread: msgs.filter((x) => x.from !== viewer.id && !x.readAt).length,
        isNew: msgs.length === 0,
      };
    })
    .filter((x) => x.other && !blockedBetween(d, viewer.id, x.other.id))
    .sort((a, b) => (b.match.lastMessageAt ?? b.match.createdAt).localeCompare(a.match.lastMessageAt ?? a.match.createdAt));
}

export async function visitors(): Promise<{ at: string; card: ProfileCard }[]> {
  const d = getDb();
  const viewer = me(d);
  const seen = new Set<string>();
  return d.visits
    .filter((v) => v.to === viewer.id)
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((v) => {
      if (seen.has(v.from) || !d.profiles[v.from] || d.profiles[v.from].status !== "approved" || blockedBetween(d, viewer.id, v.from)) return false;
      seen.add(v.from);
      return true;
    })
    .map((v) => ({ at: v.at, card: card(d, viewer, d.profiles[v.from]) }));
}

/* ═════════════════════ Messagerie ═════════════════════ */

const MONEY_WARNING =
  "Cette conversation semble contenir une demande d'argent. Ne transfère jamais d'argent à une personne que tu n'as pas rencontrée, et signale-la si tu as un doute.";
const LINK_WARNING = "Un lien externe a été partagé. N'ouvre pas un lien envoyé par une personne que tu ne connais pas encore.";

export async function getConversation(matchId: string): Promise<Conversation | null> {
  const d = getDb();
  const viewer = me(d);
  const match = d.matches.find((m) => m.id === matchId && m.users.includes(viewer.id) && !m.closedBy);
  if (!match) return null;
  const other = d.profiles[otherOf(match, viewer.id)];
  if (!other || blockedBetween(d, viewer.id, other.id)) return null;
  const messages = d.messages.filter((x) => x.matchId === matchId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const pending = d.scheduled.filter((s) => s.type === "reply" && s.payload.matchId === matchId).sort((a, b) => a.due - b.due)[0];
  const flags = new Set(messages.flatMap((x) => x.flags ?? []));
  return {
    match,
    other: publicProfile(other),
    compat: compatibility(viewer, other),
    messages,
    typingUntil: pending ? pending.due : null,
    warning: flags.has("argent") ? MONEY_WARNING : flags.has("lien") ? LINK_WARNING : null,
    otherOnline: presence(other.lastActiveAt).online || !!pending,
  };
}

export async function sendMessage(matchId: string, text: string): Promise<ActionResult> {
  const d = getDb();
  const viewer = me(d);
  const body = text.trim();
  if (!body) return { ok: false, error: "Message vide.", code: "invalid" };
  if (body.length > 1000) return { ok: false, error: "Message trop long (1000 caractères maximum).", code: "invalid" };
  const match = d.matches.find((m) => m.id === matchId && m.users.includes(viewer.id) && !m.closedBy);
  if (!match) return { ok: false, error: "Conversation introuvable.", code: "invalid" };
  const otherId = otherOf(match, viewer.id);
  if (blockedBetween(d, viewer.id, otherId)) return { ok: false, error: "Tu ne peux plus écrire à ce membre.", code: "blocked" };

  // Anti-spam (PRD §61) : 12 messages par minute maximum.
  const minuteKey = `msg:${viewer.id}:${Math.floor(Date.now() / MIN)}`;
  if (counter(d, minuteKey) >= 12) return { ok: false, error: "Doucement 🙂 Tu envoies beaucoup de messages, patiente une minute.", code: "quota" };

  const analysis = analyzeMessage(body);
  if (analysis.level === "block") return { ok: false, error: analysis.notice, code: "blocked" };
  bump(d, minuteKey);

  const msg: Message = { id: nextId("msg"), matchId, from: viewer.id, text: body, createdAt: nowIso(), risk: analysis.level, flags: analysis.flags };
  d.messages.push(msg);
  match.lastMessageAt = msg.createdAt;
  viewer.lastActiveAt = msg.createdAt;

  const other = d.profiles[otherId];
  if (other && isHuman(other)) {
    notify(d, otherId, "message", `Message de ${viewer.firstName}`, body.length > 70 ? `${body.slice(0, 70)}…` : body, `/messages/${matchId}`);
  } else if (other) {
    const alreadyPending = d.scheduled.some((s) => s.type === "reply" && s.payload.matchId === matchId);
    if (!alreadyPending) schedule(d, "reply", rand(3_500, 7_000), { matchId, botId: otherId, text: body });
  }
  commit();
  return { ok: true, notice: analysis.level === "info" ? analysis.notice : undefined };
}

export async function markRead(matchId: string) {
  const d = getDb();
  const viewer = me(d);
  let changed = false;
  for (const m of d.messages) {
    if (m.matchId === matchId && m.from !== viewer.id && !m.readAt) {
      m.readAt = nowIso();
      changed = true;
    }
  }
  for (const n of d.notifications) {
    if (n.userId === viewer.id && !n.read && n.kind === "message" && n.href === `/messages/${matchId}`) {
      n.read = true;
      changed = true;
    }
  }
  if (changed) commit();
}

export async function setStage(matchId: string, stage: number) {
  const d = getDb();
  const viewer = me(d);
  const match = d.matches.find((m) => m.id === matchId && m.users.includes(viewer.id));
  if (!match) return;
  match.stage = stage;
  commit();
}

export async function unmatch(matchId: string) {
  const d = getDb();
  const viewer = me(d);
  const match = d.matches.find((m) => m.id === matchId && m.users.includes(viewer.id));
  if (!match) return;
  match.closedBy = viewer.id;
  commit();
}

/* ═════════════════════ Sécurité ═════════════════════ */

export async function blockUser(targetId: string) {
  const d = getDb();
  const viewer = me(d);
  if (!blockedBetween(d, viewer.id, targetId)) d.blocks.push({ id: nextId("b"), by: viewer.id, target: targetId, at: nowIso() });
  for (const i of d.interests) {
    if (i.status === "pending" && ((i.from === viewer.id && i.to === targetId) || (i.from === targetId && i.to === viewer.id))) i.status = "declined";
  }
  d.scheduled = d.scheduled.filter((s) => s.payload.botId !== targetId);
  commit();
}

export async function unblockUser(targetId: string) {
  const d = getDb();
  const viewer = me(d);
  d.blocks = d.blocks.filter((b) => !(b.by === viewer.id && b.target === targetId));
  commit();
}

export async function blockedProfiles(): Promise<Profile[]> {
  const d = getDb();
  const viewer = me(d);
  return d.blocks.filter((b) => b.by === viewer.id && d.profiles[b.target]).map((b) => publicProfile(d.profiles[b.target]));
}

export async function reportUser(targetId: string, reason: string, details: string, messageId?: string): Promise<ActionResult> {
  const d = getDb();
  const viewer = me(d);
  if (!REPORT_REASONS[reason]) return { ok: false, error: "Choisis un motif.", code: "invalid" };
  const dayCount = counter(d, `rep:${viewer.id}:${dayKey()}`);
  if (dayCount >= 10) return { ok: false, error: "Trop de signalements aujourd'hui.", code: "quota" };
  bump(d, `rep:${viewer.id}:${dayKey()}`);
  const previous = d.reports.filter((r) => r.target === targetId && r.status === "open").length;
  const priority: Report["priority"] =
    reason === "argent" || reason === "arnaque"
      ? previous > 0
        ? "critical"
        : "high"
      : reason === "harcelement" || reason === "contenu_sexuel" || reason === "usurpation"
        ? "high"
        : reason === "faux_profil"
          ? "medium"
          : "low";
  d.reports.push({ id: nextId("r"), by: viewer.id, target: targetId, reason, details: details.trim(), messageId, priority, status: "open", createdAt: nowIso() });
  notify(d, viewer.id, "safety", "Signalement reçu", "Merci. Notre équipe de modération l'examine sous 24 h. Tu ne verras plus ce profil si tu l'as bloqué.", "/settings");
  commit();
  return { ok: true };
}

/* ═════════════════════ Vérification, confidentialité, famille ═════════════════════ */

export async function requestPhoneCode(phone: string): Promise<ActionResult & { otp?: string }> {
  const d = getDb();
  const p = me(d);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return { ok: false, error: "Numéro invalide.", code: "invalid" };
  const code = String(rand(1000, 9999));
  d.flags[`otp:${p.id}:${code}`] = true;
  p.verification.phoneNumber = phone.trim();
  commit();
  // En production, le code part par SMS (Supabase Auth / agrégateur) ; en démo on l'affiche.
  return { ok: true, otp: code };
}

export async function confirmPhoneCode(code: string): Promise<ActionResult> {
  const d = getDb();
  const p = me(d);
  if (!d.flags[`otp:${p.id}:${code.trim()}`]) return { ok: false, error: "Code incorrect.", code: "invalid" };
  delete d.flags[`otp:${p.id}:${code.trim()}`];
  p.verification.phone = "verified";
  notify(d, p.id, "verification", "Téléphone vérifié ✅", "Le badge « Téléphone vérifié » apparaît sur ton profil.", "/settings");
  commit();
  return { ok: true };
}

export async function submitSelfie(): Promise<void> {
  const d = getDb();
  const p = me(d);
  p.verification.photo = "pending";
  schedule(d, "verify_photo", 12_000, { userId: p.id });
  commit();
}

export async function inviteGuardian(g: Omit<Guardian, "status" | "invitedAt">): Promise<ActionResult> {
  const d = getDb();
  const p = me(d);
  if (activePlan(p) !== "premium_plus") return { ok: false, error: "Le mode famille fait partie de l'offre Premium+.", code: "premium" };
  p.guardian = { ...g, status: "invited", invitedAt: nowIso() };
  commit();
  return { ok: true };
}

export async function removeGuardian() {
  const d = getDb();
  const p = me(d);
  delete p.guardian;
  commit();
}

export async function getGuardian(): Promise<Guardian | null> {
  const d = getDb();
  return me(d).guardian ?? null;
}

export async function exportMyData(): Promise<string> {
  const d = getDb();
  const p = me(d);
  const data = {
    profil: p,
    interets: d.interests.filter((i) => i.from === p.id || i.to === p.id),
    matchs: d.matches.filter((m) => m.users.includes(p.id)),
    messages: d.messages.filter((m) => d.matches.some((x) => x.id === m.matchId && x.users.includes(p.id))),
    visites: d.visits.filter((v) => v.to === p.id || v.from === p.id),
    paiements: d.payments.filter((x) => x.userId === p.id),
    exporteLe: nowIso(),
  };
  return JSON.stringify(data, null, 2);
}

export async function deleteAccount() {
  const d = getDb();
  const p = me(d);
  const id = p.id;
  const myMatches = new Set(d.matches.filter((m) => m.users.includes(id)).map((m) => m.id));
  d.accounts = d.accounts.filter((a) => a.id !== id);
  delete d.profiles[id];
  d.interests = d.interests.filter((i) => i.from !== id && i.to !== id);
  d.matches = d.matches.filter((m) => !myMatches.has(m.id));
  d.messages = d.messages.filter((m) => !myMatches.has(m.matchId));
  d.visits = d.visits.filter((v) => v.from !== id && v.to !== id);
  d.passes = d.passes.filter((x) => x.from !== id && x.to !== id);
  d.blocks = d.blocks.filter((b) => b.by !== id && b.target !== id);
  d.notifications = d.notifications.filter((n) => n.userId !== id);
  d.scheduled = d.scheduled.filter((s) => !Object.values(s.payload).includes(id));
  setSessionId(null);
  commit();
}

/* ═════════════════════ Notifications ═════════════════════ */

export async function listNotifications(): Promise<AppNotification[]> {
  const d = getDb();
  const uid = getSessionId();
  return d.notifications.filter((n) => n.userId === uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 40);
}

export async function markAllNotificationsRead() {
  const d = getDb();
  const uid = getSessionId();
  for (const n of d.notifications) if (n.userId === uid) n.read = true;
  commit();
}

/** Notifications pas encore affichées en toast (marquées au passage). */
export function takeToasts(): AppNotification[] {
  const d = getDb();
  const uid = getSessionId();
  const fresh = d.notifications.filter((n) => n.userId === uid && !n.toasted);
  if (!fresh.length) return [];
  for (const n of fresh) n.toasted = true;
  commit();
  return fresh;
}

export async function badges(): Promise<{ notifications: number; messages: number; interests: number }> {
  const d = getDb();
  const uid = getSessionId();
  if (!uid || !d.profiles[uid]) return { notifications: 0, messages: 0, interests: 0 };
  const myMatches = new Set(d.matches.filter((m) => !m.closedBy && m.users.includes(uid)).map((m) => m.id));
  return {
    notifications: d.notifications.filter((n) => n.userId === uid && !n.read).length,
    messages: d.messages.filter((m) => myMatches.has(m.matchId) && m.from !== uid && !m.readAt).length,
    interests: d.interests.filter((i) => i.to === uid && i.status === "pending" && d.profiles[i.from]?.status === "approved" && !blockedBetween(d, uid, i.from)).length,
  };
}

/* ═════════════════════ Paiements ═════════════════════ */

export const PRICES: Record<PaymentItem, number> = {
  premium: PLANS.premium.price,
  premium_plus: PLANS.premium_plus.price,
  boost: BOOST.price,
};

export async function pay(item: PaymentItem, method: PayMethod, phone?: string): Promise<ActionResult & { payment?: Payment }> {
  const d = getDb();
  const p = me(d);
  if (method !== "card" && (phone ?? "").replace(/\D/g, "").length < 8) return { ok: false, error: "Numéro Mobile Money invalide.", code: "invalid" };
  const now = Date.now();
  const payment: Payment = {
    id: nextId("p"),
    userId: p.id,
    item,
    amount: PRICES[item],
    method,
    phone: method === "card" ? undefined : phone,
    status: "success",
    ref: `FM-${String(now).slice(-7)}-${rand(100, 999)}`,
    createdAt: new Date(now).toISOString(),
  };
  d.payments.push(payment);
  if (item === "boost") {
    p.boostUntil = new Date(now + BOOST.minutes * MIN).toISOString();
    notify(d, p.id, "payment", "Boost activé 🚀", `Ton profil est mis en avant pendant ${BOOST.minutes} minutes.`, "/discover");
  } else {
    const base = activePlan(p) === item && p.planUntil ? new Date(p.planUntil).getTime() : now;
    p.plan = item;
    p.planUntil = new Date(base + 30 * DAY).toISOString();
    notify(d, p.id, "payment", `Bienvenue en ${PLANS[item].name} 👑`, "Toutes tes fonctionnalités sont débloquées pour 30 jours.", "/subscription");
  }
  commit();
  return { ok: true, payment };
}

export async function myPayments(): Promise<Payment[]> {
  const d = getDb();
  const p = me(d);
  return d.payments.filter((x) => x.userId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function cancelSubscription() {
  const d = getDb();
  const p = me(d);
  // Comme sur les stores : l'offre reste active jusqu'à la fin de la période payée.
  d.flags[`cancelled:${p.id}`] = true;
  commit();
}

export async function subscriptionState(): Promise<{ plan: PlanKey; until?: string; cancelled: boolean; boostUntil?: string }> {
  const d = getDb();
  const p = me(d);
  const plan = activePlan(p);
  return {
    plan,
    until: plan === "free" ? undefined : p.planUntil,
    cancelled: !!d.flags[`cancelled:${p.id}`],
    boostUntil: p.boostUntil && new Date(p.boostUntil).getTime() > Date.now() ? p.boostUntil : undefined,
  };
}

/* ═════════════════════ Administration ═════════════════════ */

export type AdminStats = {
  members: number;
  newThisWeek: number;
  pending: number;
  verified: number;
  premium: number;
  matches: number;
  activeConversations: number;
  messages: number;
  openReports: number;
  revenueMonth: number;
  revenueTotal: number;
  signups: { day: string; count: number }[];
  revenueByWeek: { label: string; amount: number }[];
  religions: { label: string; count: number }[];
  cities: { label: string; count: number }[];
  methods: { label: string; count: number }[];
};

export async function adminStats(): Promise<AdminStats> {
  const d = getDb();
  requireAdmin(d);
  const now = Date.now();
  const members = Object.values(d.profiles);
  const ok = d.payments.filter((p) => p.status === "success");
  const count = <T,>(list: T[], key: (x: T) => string) => {
    const m = new Map<string, number>();
    for (const x of list) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
    return [...m.entries()].map(([label, n]) => ({ label, count: n })).sort((a, b) => b.count - a.count);
  };
  const signups = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(now - (13 - i) * DAY);
    const key = dayKey(day);
    return { day: key, count: members.filter((p) => dayKey(new Date(p.createdAt)) === key).length };
  });
  const revenueByWeek = Array.from({ length: 6 }, (_, i) => {
    const end = now - (5 - i) * 7 * DAY;
    const start = end - 7 * DAY;
    const amount = ok.filter((p) => new Date(p.createdAt).getTime() > start && new Date(p.createdAt).getTime() <= end).reduce((s, p) => s + p.amount, 0);
    return { label: i === 5 ? "Cette sem." : `S-${5 - i}`, amount };
  });
  const methodLabels: Record<string, string> = { orange: "Orange Money", moov: "Moov Money", wave: "Wave", card: "Carte" };
  return {
    members: members.length,
    newThisWeek: members.filter((p) => now - new Date(p.createdAt).getTime() < 7 * DAY).length,
    pending: members.filter((p) => p.status === "pending" && p.onboarded).length,
    verified: members.filter((p) => p.verification.photo === "verified").length,
    premium: members.filter((p) => activePlan(p) !== "free").length,
    matches: d.matches.length,
    activeConversations: d.matches.filter((m) => m.lastMessageAt && now - new Date(m.lastMessageAt).getTime() < 7 * DAY).length,
    messages: d.messages.length,
    openReports: d.reports.filter((r) => r.status === "open").length,
    revenueMonth: ok.filter((p) => now - new Date(p.createdAt).getTime() < 30 * DAY).reduce((s, p) => s + p.amount, 0),
    revenueTotal: ok.reduce((s, p) => s + p.amount, 0),
    signups,
    revenueByWeek,
    religions: count(members, (p) => (p.religion.key === "islam" ? "Islam" : p.religion.key === "christianisme" ? "Christianisme" : "Autre")),
    cities: count(members, (p) => p.city).slice(0, 6),
    methods: count(ok, (p) => methodLabels[p.method]),
  };
}

export type AdminMember = { profile: Profile; email: string; reports: number; payments: number };

export async function adminMembers(): Promise<AdminMember[]> {
  const d = getDb();
  requireAdmin(d);
  return Object.values(d.profiles)
    .map((profile) => ({
      profile,
      email: d.accounts.find((a) => a.id === profile.id)?.email ?? `${profile.firstName.toLowerCase().replace(/[^a-z]/g, "")}.${profile.id}@exemple.bf`,
      reports: d.reports.filter((r) => r.target === profile.id).length,
      payments: d.payments.filter((p) => p.userId === profile.id && p.status === "success").reduce((s, p) => s + p.amount, 0),
    }))
    .sort((a, b) => b.profile.createdAt.localeCompare(a.profile.createdAt));
}

export async function adminSetStatus(userId: string, status: Profile["status"], reason?: string) {
  const d = getDb();
  requireAdmin(d);
  const p = d.profiles[userId];
  if (!p) return;
  const before = p.status;
  p.status = status;
  p.statusReason = reason;
  if (status === "approved" && before === "pending") {
    notify(d, userId, "system", "Profil validé ✅", "Ton profil est maintenant visible par les membres compatibles.", "/discover");
  }
  if (status === "rejected") {
    notify(d, userId, "system", "Profil à compléter", reason ?? "Ton profil ne respecte pas encore nos règles. Modifie-le puis renvoie-le en validation.", "/profile");
  }
  if (status === "suspended" || status === "banned") {
    d.scheduled = d.scheduled.filter((s) => s.payload.botId !== userId);
  }
  commit();
}

export async function adminSetPhotoVerification(userId: string, approved: boolean) {
  const d = getDb();
  requireAdmin(d);
  const p = d.profiles[userId];
  if (!p) return;
  p.verification.photo = approved ? "verified" : "none";
  notify(
    d,
    userId,
    "verification",
    approved ? "Photo vérifiée ✅" : "Vérification refusée",
    approved ? "Le badge « Profil vérifié » est maintenant visible." : "Ton selfie ne correspond pas à tes photos. Réessaie avec un selfie net.",
    "/settings",
  );
  commit();
}

export type AdminReportGroup = {
  target: Profile;
  email: string;
  reports: (Report & { reporter: string })[];
  flagged: Message[];
  risk: Report["priority"];
  open: number;
};

const PRIORITY_RANK: Record<Report["priority"], number> = { low: 0, medium: 1, high: 2, critical: 3 };

export async function adminReports(): Promise<AdminReportGroup[]> {
  const d = getDb();
  requireAdmin(d);
  const byTarget = new Map<string, Report[]>();
  for (const r of d.reports) byTarget.set(r.target, [...(byTarget.get(r.target) ?? []), r]);
  return [...byTarget.entries()]
    .filter(([id]) => d.profiles[id])
    .map(([id, reports]) => {
      const sorted = [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const open = sorted.filter((r) => r.status === "open");
      const risk = (open.length ? open : sorted).reduce<Report["priority"]>((acc, r) => (PRIORITY_RANK[r.priority] > PRIORITY_RANK[acc] ? r.priority : acc), "low");
      return {
        target: d.profiles[id],
        email: d.accounts.find((a) => a.id === id)?.email ?? "—",
        reports: sorted.map((r) => ({ ...r, reporter: d.profiles[r.by]?.firstName ?? "Membre supprimé" })),
        flagged: d.messages.filter((m) => m.from === id && (m.flags?.length ?? 0) > 0).slice(-5),
        risk: open.length >= 2 && PRIORITY_RANK[risk] < 3 ? "critical" : risk,
        open: open.length,
      };
    })
    .sort((a, b) => b.open - a.open || PRIORITY_RANK[b.risk] - PRIORITY_RANK[a.risk]);
}

export async function adminResolve(targetId: string, action: "dismiss" | "warn" | "suspend" | "ban") {
  const d = getDb();
  requireAdmin(d);
  const at = nowIso();
  for (const r of d.reports) {
    if (r.target !== targetId || r.status !== "open") continue;
    r.status = action === "dismiss" ? "dismissed" : "resolved";
    r.action = action === "dismiss" ? "none" : action;
    r.resolvedAt = at;
    notify(d, r.by, "safety", "Ton signalement a été traité", action === "dismiss" ? "Après vérification, aucune infraction n'a été constatée. Merci de ta vigilance." : "Des mesures ont été prises contre ce profil. Merci de contribuer à la sécurité de la communauté.", "/home");
  }
  const target = d.profiles[targetId];
  if (target) {
    if (action === "suspend") target.status = "suspended";
    if (action === "ban") target.status = "banned";
    if (action === "warn") notify(d, targetId, "safety", "Avertissement", "Un de tes comportements a été signalé. Merci de respecter la charte de bonne conduite.", "/home");
    if (action === "suspend" || action === "ban") d.scheduled = d.scheduled.filter((s) => s.payload.botId !== targetId);
  }
  commit();
}

export async function adminPayments(): Promise<(Payment & { member: string })[]> {
  const d = getDb();
  requireAdmin(d);
  return [...d.payments]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => ({ ...p, member: d.profiles[p.userId] ? `${d.profiles[p.userId].firstName}, ${d.profiles[p.userId].age} ans` : "Membre supprimé" }));
}

/* ═════════════════════ Simulateur ═════════════════════ */

function pickBotFor(d: DemoDB, human: Profile): Profile | undefined {
  const touched = new Set([
    ...d.interests.filter((i) => i.from === human.id || i.to === human.id).flatMap((i) => [i.from, i.to]),
    ...d.passes.filter((x) => x.from === human.id).map((x) => x.to),
    ...d.matches.filter((m) => m.users.includes(human.id)).flatMap((m) => m.users),
  ]);
  return Object.values(d.profiles)
    .filter((p) => p.seeded && !p.persona && p.status === "approved" && !touched.has(p.id) && !blockedBetween(d, p.id, human.id) && !hardFilter(human, p))
    .map((p) => ({ p, s: compatibility(p, human).score }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)[rand(0, 3)]?.p;
}

/** Traite les événements différés arrivés à échéance. Appelé chaque seconde par l'app. */
export function tick(): void {
  const d = getDb();
  const now = Date.now();
  const due = d.scheduled.filter((s) => s.due <= now);
  if (!due.length) return;
  d.scheduled = d.scheduled.filter((s) => s.due > now);

  for (const ev of due) {
    const { payload } = ev;
    if (ev.type === "accept" || ev.type === "decline") {
      const it = d.interests.find((i) => i.id === payload.interestId);
      if (!it || it.status !== "pending") continue;
      const bot = d.profiles[it.to];
      const human = d.profiles[it.from];
      if (!bot || !human || bot.status !== "approved" || blockedBetween(d, bot.id, human.id)) continue;
      it.status = ev.type === "accept" ? "accepted" : "declined";
      it.respondedAt = nowIso();
      if (ev.type === "accept") {
        const match = createMatch(d, human.id, bot.id);
        bot.lastActiveAt = nowIso();
        notify(d, human.id, "match", "C'est réciproque ! 🎉", `${bot.firstName} a accepté ta demande. Lance la conversation !`, `/messages/${match.id}`);
        if (bot.persona === "scam") schedule(d, "reply", rand(8_000, 12_000), { matchId: match.id, botId: bot.id, text: "", opener: "1" });
      }
    } else if (ev.type === "reply") {
      const match = d.matches.find((m) => m.id === payload.matchId && !m.closedBy);
      const bot = d.profiles[payload.botId];
      if (!match || !bot || bot.status !== "approved") continue;
      const human = d.profiles[otherOf(match, bot.id)];
      if (!human || blockedBetween(d, bot.id, human.id)) continue;
      const turn = d.messages.filter((m) => m.matchId === match.id && m.from === bot.id).length;
      const muslim = bot.religion.key === "islam";
      const text =
        payload.opener && bot.persona !== "scam"
          ? `${muslim ? "Assalamou alaykoum" : "Bonjour"} ${human.firstName} 😊 Merci d'avoir accepté. J'ai lu ton profil avec attention, on a beaucoup de choses en commun. Comment vas-tu ?`
          : botReply(bot, human, payload.text ?? "", turn);
      const analysis = analyzeMessage(text);
      const msg: Message = { id: nextId("msg"), matchId: match.id, from: bot.id, text, createdAt: nowIso(), risk: analysis.level, flags: analysis.flags };
      d.messages.push(msg);
      match.lastMessageAt = msg.createdAt;
      bot.lastActiveAt = msg.createdAt;
      notify(d, human.id, "message", `Message de ${bot.firstName}`, text.length > 70 ? `${text.slice(0, 70)}…` : text, `/messages/${match.id}`);
    } else if (ev.type === "incoming_interest") {
      const human = d.profiles[payload.to];
      if (!human || human.status !== "approved") {
        if (human && human.status === "pending") schedule(d, "incoming_interest", 30_000, payload);
        continue;
      }
      const bot = pickBotFor(d, human);
      if (!bot) continue;
      const superKind = Math.random() < 0.35;
      d.interests.push({
        id: nextId("i"),
        from: bot.id,
        to: human.id,
        kind: superKind ? "super" : "interest",
        message: superKind ? `${bot.religion.key === "islam" ? "Assalamou alaykoum" : "Bonjour"} ${human.firstName}, nos réponses au questionnaire se ressemblent beaucoup. J'aimerais apprendre à te connaître.` : undefined,
        status: "pending",
        createdAt: nowIso(),
      });
      bot.lastActiveAt = nowIso();
      notify(d, human.id, "interest", superKind ? "Super-intérêt reçu ⭐" : "Nouvel intérêt", `${bot.firstName} s'intéresse à ton profil.`, "/matches?tab=recus");
    } else if (ev.type === "visit") {
      const human = d.profiles[payload.to];
      if (!human || human.status !== "approved") {
        if (human && human.status === "pending") schedule(d, "visit", 30_000, payload);
        continue;
      }
      const bot = pickBotFor(d, human);
      if (!bot) continue;
      d.visits.push({ id: nextId("v"), from: bot.id, to: human.id, at: nowIso() });
      const premium = activePlan(human) !== "free";
      notify(d, human.id, "visit", "Nouvelle visite", premium ? `${bot.firstName} a consulté ton profil.` : "Quelqu'un a consulté ton profil. Passe Premium pour savoir qui.", "/matches?tab=visites");
    } else if (ev.type === "approve_profile") {
      const human = d.profiles[payload.userId];
      if (!human || human.status !== "pending") continue;
      human.status = "approved";
      notify(d, human.id, "system", "Profil validé ✅", "Notre équipe a validé ton profil. Il est maintenant visible par les membres compatibles.", "/discover");
    } else if (ev.type === "verify_photo") {
      const human = d.profiles[payload.userId];
      if (!human || human.verification.photo !== "pending") continue;
      human.verification.photo = "verified";
      notify(d, human.id, "verification", "Photo vérifiée ✅", "Le badge « Profil vérifié » apparaît maintenant sur ton profil.", "/settings");
    }
  }
  commit();
}

/** Garde la présence « en ligne » du membre connecté à jour (sans notifier l'interface). */
export function heartbeat() {
  const d = getDb();
  const id = getSessionId();
  const p = id ? d.profiles[id] : undefined;
  if (!p) return;
  if (Date.now() - new Date(p.lastActiveAt).getTime() > 60_000) {
    p.lastActiveAt = nowIso();
    commit();
  }
}

export { emit };
