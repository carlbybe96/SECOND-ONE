import type { PayMethod, PlanKey, ReligionKey } from "./config";

export type Gender = "homme" | "femme";
export type MaritalStatus = "celibataire" | "divorce" | "veuf";
export type Intention = "mariage" | "serieux";
export type Education = "secondaire" | "bac" | "licence" | "master" | "doctorat" | "pro";
export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended" | "banned";
export type VerifLevel = "none" | "pending" | "verified";
export type Role = "member" | "admin";

/** Paramètres de l'avatar illustré (utilisé tant qu'aucune vraie photo n'est ajoutée). */
export type AvatarSpec = {
  skin: number;
  bg: number;
  outfit: number;
  hair: "court" | "degrade" | "afro" | "chauve" | "tresses" | "chignon" | "lisse" | "puff";
  headwear?: "hijab" | "foulard" | "kufi" | null;
  wrap?: number;
  beard?: boolean;
  glasses?: boolean;
  earrings?: boolean;
};

export type ReligionInfo = {
  key: ReligionKey;
  branch: string;
  /** 0 = très pratiquant(e) … 3 = non pratiquant(e) */
  practice: number;
};

export type Preferences = {
  ageMin: number;
  ageMax: number;
  /** exact = même religion et même courant, same = même religion, any = ouvert(e) */
  religion: "exact" | "same" | "any";
  /** same = niveau proche du mien, more = au moins aussi pratiquant(e), any = peu importe */
  practice: "same" | "more" | "any";
  /** Statuts acceptés ; vide = tous. */
  marital: MaritalStatus[];
  location: "city" | "country" | "any";
  acceptsChildren: boolean;
};

export type FamilyProject = {
  kids: "oui" | "deja" | "non" | "indecis";
  kidsCount: number;
  work: "oui" | "choix" | "non";
  relocate: "oui" | "ville" | "non";
  parents: "elargie" | "proximite" | "non";
  importance: "tres" | "importante" | "mesuree";
};

export type Guardian = {
  name: string;
  relation: string;
  contact: string;
  status: "invited" | "active";
  invitedAt: string;
};

export type Profile = {
  id: string;
  firstName: string;
  gender: Gender;
  age: number;
  city: string;
  country: string;
  profession: string;
  education: Education;
  marital: MaritalStatus;
  children: number;
  intention: Intention;
  bio: string;
  languages: string[];
  religion: ReligionInfo;
  prefs: Preferences;
  family: FamilyProject;
  /** id de question → index de l'option choisie */
  answers: Record<string, number>;
  photo: string | null;
  avatar: AvatarSpec;
  privacy: { blurPhoto: boolean; visibility: "public" | "hidden" };
  verification: { phone: VerifLevel; photo: VerifLevel; identity: VerifLevel; phoneNumber?: string };
  status: ProfileStatus;
  statusReason?: string;
  plan: PlanKey;
  planUntil?: string;
  boostUntil?: string;
  guardian?: Guardian;
  onboarded: boolean;
  createdAt: string;
  lastActiveAt: string;
  /** Profil fictif de démonstration. */
  seeded?: boolean;
  /** Scénario de démo : ce profil joue un arnaqueur (sert à montrer la modération). */
  persona?: "scam";
};

export type Account = {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
};

export type Interest = {
  id: string;
  from: string;
  to: string;
  kind: "interest" | "super";
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  respondedAt?: string;
};

export type Match = {
  id: string;
  users: [string, string];
  createdAt: string;
  /** Étape du parcours relationnel (index dans STAGES). */
  stage: number;
  lastMessageAt?: string;
  closedBy?: string;
};

export type RiskLevel = "none" | "info" | "warn" | "block";

export type Message = {
  id: string;
  matchId: string;
  from: string;
  text: string;
  createdAt: string;
  readAt?: string;
  risk?: RiskLevel;
  flags?: string[];
};

export type Visit = { id: string; from: string; to: string; at: string };
export type Pass = { from: string; to: string; at: string };
export type Block = { id: string; by: string; target: string; at: string };

export type Report = {
  id: string;
  by: string;
  target: string;
  reason: string;
  details: string;
  messageId?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "dismissed";
  action?: "warn" | "suspend" | "ban" | "none";
  createdAt: string;
  resolvedAt?: string;
};

export type NotificationKind = "interest" | "match" | "message" | "visit" | "system" | "payment" | "verification" | "safety";

export type AppNotification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
  /** Affiché une fois en toast. */
  toasted?: boolean;
};

export type PaymentItem = "premium" | "premium_plus" | "boost";

export type Payment = {
  id: string;
  userId: string;
  item: PaymentItem;
  amount: number;
  method: PayMethod;
  phone?: string;
  status: "success" | "failed";
  ref: string;
  createdAt: string;
};

/** Événement différé du simulateur de démo (réponses, acceptations, visites…). */
export type Scheduled = {
  id: string;
  due: number;
  type: "accept" | "decline" | "reply" | "incoming_interest" | "visit" | "approve_profile" | "verify_photo" | "scam_message";
  payload: Record<string, string>;
};

export type CategoryScore = { key: string; label: string; score: number };

export type Compat = {
  score: number;
  label: string;
  tone: "low" | "mid" | "good" | "great" | "top";
  categories: CategoryScore[];
  strengths: string[];
  discuss: string[];
};
