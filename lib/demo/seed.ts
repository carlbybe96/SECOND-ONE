import { CITIES_BY_COUNTRY, WEST_AFRICA, type PlanKey, type ReligionKey } from "../config";
import { compatibility, hardFilter } from "../compat";
import type {
  Account,
  AppNotification,
  AvatarSpec,
  Education,
  FamilyProject,
  Gender,
  Intention,
  Interest,
  MaritalStatus,
  Match,
  Message,
  Payment,
  Preferences,
  Profile,
  ProfileStatus,
  Report,
  Visit,
} from "../types";
import { rng, type Rng } from "./prng";

/**
 * Jeu de données de démonstration. Tous les profils sont FICTIFS.
 * Les dates sont recalculées à partir du moment de la (ré)initialisation,
 * pour que la démo paraisse toujours « vivante ».
 */

export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS = {
  homme: { id: "u_ibrahim", email: "ibrahim@demo.faithmatch.app", label: "Ibrahim, 31 ans" },
  femme: { id: "u_aicha", email: "aicha@demo.faithmatch.app", label: "Aïcha, 27 ans" },
  admin: { id: "u_admin", email: "admin@faithmatch.app", label: "Administrateur" },
} as const;

export type DemoDB = {
  v: number;
  seededAt: string;
  seq: number;
  accounts: Account[];
  profiles: Record<string, Profile>;
  interests: Interest[];
  matches: Match[];
  messages: Message[];
  visits: Visit[];
  passes: { from: string; to: string; at: string }[];
  blocks: { id: string; by: string; target: string; at: string }[];
  reports: Report[];
  notifications: AppNotification[];
  payments: Payment[];
  scheduled: { id: string; due: number; type: string; payload: Record<string, string> }[];
  counters: Record<string, number>;
  flags: Record<string, boolean>;
};

export const DB_VERSION = 3;

type Row = {
  id: string;
  name: string;
  g: Gender;
  age: number;
  city: string;
  job: string;
  edu: Education;
  rel: ReligionKey;
  branch: string;
  practice: number;
  bio: string;
  av: Omit<AvatarSpec, "skin" | "bg" | "outfit"> & Partial<Pick<AvatarSpec, "skin" | "bg" | "outfit">>;
  marital?: MaritalStatus;
  children?: number;
  intention?: Intention;
  langs?: string[];
  plan?: PlanKey;
  status?: ProfileStatus;
  persona?: "scam";
  kids?: FamilyProject["kids"];
  prefs?: Partial<Preferences>;
  days?: number;
  photoVerified?: boolean;
};

const SUN = "Sunnite";
const TIJ = "Confrérie soufie (Tidjane, Mouride, Qadiriyya…)";

const WOMEN: Row[] = [
  { id: "f01", name: "Aminata", g: "femme", age: 26, city: "Ouagadougou", job: "Sage-femme", edu: "licence", rel: "islam", branch: SUN, practice: 1, bio: "Sage-femme au CHU de Tengandogo. Je crois à un foyer bâti sur la foi, le respect et la bonne humeur. Le dimanche, c'est moi qui prépare le riz gras pour toute la famille.", av: { hair: "tresses", headwear: "hijab", skin: 0, bg: 0, outfit: 0, wrap: 1 }, photoVerified: true },
  { id: "f02", name: "Mariam", g: "femme", age: 29, city: "Ouagadougou", job: "Juriste en banque", edu: "master", rel: "islam", branch: SUN, practice: 0, bio: "Juriste, passionnée par mon travail, mais la famille passe avant tout. Je cherche un homme pieux, posé et ambitieux, prêt à construire sur le long terme.", av: { hair: "tresses", headwear: "hijab", skin: 2, bg: 3, outfit: 1, wrap: 0 }, plan: "premium", photoVerified: true },
  { id: "f03", name: "Fatimata", g: "femme", age: 24, city: "Bobo-Dioulasso", job: "Étudiante en master de gestion", edu: "master", rel: "islam", branch: TIJ, practice: 1, bio: "Bobolaise et fière de l'être. Je termine mon master et je rêve d'un mariage simple, entourée de nos deux familles.", av: { hair: "tresses", headwear: "foulard", skin: 3, bg: 5, outfit: 4, wrap: 8, earrings: true }, intention: "serieux" },
  { id: "f04", name: "Salimata", g: "femme", age: 31, city: "Ouagadougou", job: "Comptable", edu: "licence", rel: "islam", branch: SUN, practice: 1, bio: "Comptable, organisée et un peu perfectionniste. J'aimerais un mari qui aime les discussions sincères et qui sait rire de lui-même.", av: { hair: "tresses", headwear: "hijab", skin: 5, bg: 2, outfit: 8, wrap: 3, glasses: true }, photoVerified: true },
  { id: "f05", name: "Djeneba", g: "femme", age: 27, city: "Koudougou", job: "Institutrice", edu: "pro", rel: "islam", branch: SUN, practice: 2, bio: "Institutrice à Koudougou. Les enfants sont ma joie de chaque jour, j'espère en avoir plusieurs. Simple, patiente et très attachée à ma famille.", av: { hair: "tresses", headwear: "foulard", skin: 1, bg: 1, outfit: 5, wrap: 5, earrings: true } },
  { id: "f06", name: "Ramatou", g: "femme", age: 33, city: "Ouagadougou", job: "Commerçante en pagnes", edu: "secondaire", rel: "islam", branch: SUN, practice: 1, marital: "divorce", children: 1, bio: "Commerçante au grand marché de Rood Woko et maman d'un petit garçon de 6 ans. Je veux reconstruire un foyer stable avec un homme bienveillant.", av: { hair: "tresses", headwear: "hijab", skin: 4, bg: 6, outfit: 9, wrap: 6 } },
  { id: "f07", name: "Nafissatou", g: "femme", age: 28, city: "Dakar", job: "Chargée de communication", edu: "master", rel: "islam", branch: TIJ, practice: 1, bio: "Dakaroise, je travaille dans la communication digitale. J'aime les voyages, la lecture et les longues conversations autour d'un bon ataya.", av: { hair: "lisse", headwear: "foulard", skin: 6, bg: 4, outfit: 11, wrap: 4, earrings: true }, langs: ["Français", "Wolof", "Anglais"], photoVerified: true },
  { id: "f08", name: "Kadidia", g: "femme", age: 30, city: "Bamako", job: "Docteure en pharmacie", edu: "doctorat", rel: "islam", branch: SUN, practice: 0, bio: "Pharmacienne à Bamako. Pieuse et indépendante, je cherche un partenaire qui partage ma foi et soutient mon travail.", av: { hair: "tresses", headwear: "hijab", skin: 2, bg: 5, outfit: 3, wrap: 2 }, langs: ["Français", "Bambara"], plan: "premium" },
  { id: "f09", name: "Assétou", g: "femme", age: 25, city: "Ouagadougou", job: "Infirmière", edu: "licence", rel: "islam", branch: SUN, practice: 1, bio: "Infirmière de garde la nuit, bonne vivante le jour. Je veux un homme respectueux, avec qui prier et avancer ensemble.", av: { hair: "tresses", headwear: "hijab", skin: 3, bg: 0, outfit: 6, wrap: 7 }, photoVerified: true },
  { id: "f10", name: "Hawa", g: "femme", age: 35, city: "Paris", job: "Assistante sociale", edu: "master", rel: "islam", branch: SUN, practice: 1, marital: "veuf", bio: "Burkinabè de la diaspora, installée à Paris depuis douze ans. Après un veuvage, je suis prête à rouvrir mon cœur. Projet de retour au pays d'ici quelques années.", av: { hair: "tresses", headwear: "foulard", skin: 1, bg: 2, outfit: 7, wrap: 2, earrings: true }, prefs: { ageMin: 34, ageMax: 48 } },
  { id: "f11", name: "Oumou", g: "femme", age: 23, city: "Ouahigouya", job: "Étudiante en droit", edu: "bac", rel: "islam", branch: SUN, practice: 0, bio: "Étudiante en droit, calme et réservée. Mes parents sont au cœur de ma vie et participeront à mon choix, in sha Allah.", av: { hair: "tresses", headwear: "hijab", skin: 5, bg: 3, outfit: 2, wrap: 9 }, prefs: { marital: ["celibataire"] } },
  { id: "f12", name: "Zalissa", g: "femme", age: 29, city: "Ouagadougou", job: "Développeuse web", edu: "licence", rel: "islam", branch: SUN, practice: 2, bio: "Développeuse dans une start-up de Ouaga. J'aime la tech, le sport et les projets qui ont du sens. Je cherche un partenaire de vie curieux et ouvert.", av: { hair: "tresses", skin: 4, bg: 4, outfit: 10, earrings: true }, photoVerified: true },
  { id: "f13", name: "Aïssata", g: "femme", age: 32, city: "Abidjan", job: "Gestionnaire logistique", edu: "master", rel: "islam", branch: SUN, practice: 1, bio: "Logisticienne à Abidjan, originaire de Banfora. J'aimerais me marier avec un homme travailleur, attaché aux valeurs de nos parents.", av: { hair: "tresses", headwear: "foulard", skin: 0, bg: 1, outfit: 1, wrap: 0, earrings: true }, plan: "premium" },
  { id: "f14", name: "Rokia", g: "femme", age: 27, city: "Ouagadougou", job: "Styliste modéliste", edu: "pro", rel: "islam", branch: SUN, practice: 2, bio: "Styliste, je crée des tenues en Faso Dan Fani. Créative et joyeuse, je cherche un homme stable qui croit en mes projets.", av: { hair: "puff", skin: 6, bg: 5, outfit: 4, earrings: true } },
  { id: "f15", name: "Sarah", g: "femme", age: 28, city: "Ouagadougou", job: "Responsable marketing", edu: "master", rel: "christianisme", branch: "Catholique", practice: 1, bio: "Catholique pratiquante, je chante à la chorale le dimanche. Je rêve d'un foyer joyeux, centré sur Dieu, avec des enfants et beaucoup de musique.", av: { hair: "chignon", skin: 3, bg: 0, outfit: 8, earrings: true }, photoVerified: true },
  { id: "f16", name: "Esther", g: "femme", age: 26, city: "Ouagadougou", job: "Infirmière", edu: "licence", rel: "christianisme", branch: "Évangélique", practice: 0, bio: "Membre active de mon église. Je prie pour un mari qui aime Dieu et qui aura à cœur de conduire notre famille avec amour.", av: { hair: "tresses", skin: 2, bg: 4, outfit: 6, earrings: true } },
  { id: "f17", name: "Grâce", g: "femme", age: 30, city: "Bobo-Dioulasso", job: "Professeure de SVT", edu: "master", rel: "christianisme", branch: "Catholique", practice: 1, bio: "Enseignante de SVT, amoureuse de la nature et des balades à la mare aux hippopotames. Je cherche un homme sincère et fidèle.", av: { hair: "afro", skin: 1, bg: 6, outfit: 0, earrings: true }, photoVerified: true },
  { id: "f18", name: "Judith", g: "femme", age: 34, city: "Ouagadougou", job: "Médecin généraliste", edu: "doctorat", rel: "christianisme", branch: "Protestant", practice: 1, marital: "divorce", children: 1, bio: "Médecin et maman d'une fille de 8 ans. Je veux avancer avec un homme mature et croyant, qui sait ce qu'il veut.", av: { hair: "lisse", skin: 5, bg: 2, outfit: 3, glasses: true }, plan: "premium", photoVerified: true },
  { id: "f19", name: "Nadège", g: "femme", age: 25, city: "Koudougou", job: "Secrétaire de direction", edu: "bac", rel: "christianisme", branch: "Catholique", practice: 2, bio: "Douce et attentionnée, j'aime la cuisine, les séries et les fêtes de famille. Je cherche une relation sérieuse qui mène au mariage.", av: { hair: "tresses", skin: 0, bg: 3, outfit: 11, earrings: true }, intention: "serieux", photoVerified: true },
  { id: "f20", name: "Clarisse", g: "femme", age: 29, city: "Lomé", job: "Architecte", edu: "master", rel: "christianisme", branch: "Catholique", practice: 2, bio: "Architecte à Lomé. Je dessine des maisons toute la journée, et j'aimerais bien en construire une à deux.", av: { hair: "chignon", skin: 4, bg: 1, outfit: 10, glasses: true }, langs: ["Français", "Anglais"] },
  { id: "f21", name: "Estelle", g: "femme", age: 31, city: "Abidjan", job: "Chargée de clientèle en banque", edu: "licence", rel: "christianisme", branch: "Évangélique", practice: 1, bio: "Ivoirienne, chrétienne évangélique. Je cherche un homme de foi, travailleur, qui a le sens de la famille.", av: { hair: "lisse", skin: 6, bg: 5, outfit: 2, earrings: true } },
  { id: "f22", name: "Pélagie", g: "femme", age: 36, city: "Ouagadougou", job: "Entrepreneure (beurre de karité)", edu: "licence", rel: "christianisme", branch: "Catholique", practice: 1, marital: "veuf", children: 2, bio: "Je transforme le karité avec une coopérative de femmes. Maman de deux enfants, je crois qu'il n'est jamais trop tard pour une belle histoire bénie.", av: { hair: "tresses", headwear: "foulard", skin: 2, bg: 6, outfit: 5, wrap: 5, earrings: true }, prefs: { ageMin: 34, ageMax: 50 } },
  { id: "f23", name: "Ruth", g: "femme", age: 24, city: "Montréal", job: "Étudiante en génie civil", edu: "licence", rel: "christianisme", branch: "Protestant", practice: 1, bio: "Étudiante à Montréal, burkinabè de cœur. Je rentrerai au pays après mes études et j'aimerais y fonder ma famille.", av: { hair: "puff", skin: 1, bg: 2, outfit: 9 }, intention: "serieux" },
  { id: "f24", name: "Awa", g: "femme", age: 30, city: "Ouagadougou", job: "Journaliste radio", edu: "master", rel: "autre", branch: "Spiritualité personnelle", practice: 3, bio: "Journaliste, curieuse de tout. Je respecte toutes les croyances et je cherche avant tout un homme honnête et bienveillant.", av: { hair: "court", skin: 3, bg: 4, outfit: 7, earrings: true }, kids: "indecis", intention: "serieux" },
];

const MEN: Row[] = [
  { id: "m01", name: "Moussa", g: "homme", age: 32, city: "Ouagadougou", job: "Ingénieur en génie civil", edu: "master", rel: "islam", branch: SUN, practice: 1, bio: "Ingénieur BTP : je construis des routes et j'aimerais construire une famille. Pieux sans être rigide, j'aime le football et les soirées en famille.", av: { hair: "court", beard: true, skin: 0, bg: 0, outfit: 0 }, photoVerified: true },
  { id: "m02", name: "Abdoul Aziz", g: "homme", age: 29, city: "Ouagadougou", job: "Conseiller bancaire", edu: "licence", rel: "islam", branch: SUN, practice: 0, bio: "Je fais mes cinq prières et je cherche une épouse qui partage cette priorité. Calme, respectueux et attaché à ma famille.", av: { hair: "court", headwear: "kufi", beard: true, skin: 4, bg: 2, outfit: 2 }, plan: "premium", photoVerified: true },
  { id: "m03", name: "Souleymane", g: "homme", age: 34, city: "Bobo-Dioulasso", job: "Commerçant import-export", edu: "secondaire", rel: "islam", branch: TIJ, practice: 1, bio: "Commerçant, je voyage souvent entre Bobo et Abidjan. Je veux une femme de confiance pour fonder un foyer solide.", av: { hair: "court", headwear: "kufi", wrap: 1, skin: 1, bg: 6, outfit: 9 } },
  { id: "m04", name: "Boukary", g: "homme", age: 30, city: "Ouagadougou", job: "Technicien télécom", edu: "pro", rel: "islam", branch: SUN, practice: 2, bio: "Technicien chez un opérateur télécom. Simple, drôle et travailleur. J'aime le jardinage et les grillades du week-end.", av: { hair: "degrade", skin: 2, bg: 1, outfit: 1 } },
  { id: "m05", name: "Adama", g: "homme", age: 36, city: "Ouagadougou", job: "Médecin urgentiste", edu: "doctorat", rel: "islam", branch: SUN, practice: 1, marital: "divorce", children: 1, bio: "Médecin urgentiste et papa d'une petite fille. Je cherche une femme posée, qui accueillera ma fille comme la sienne.", av: { hair: "court", beard: true, glasses: true, skin: 3, bg: 3, outfit: 3 }, plan: "premium", photoVerified: true },
  { id: "m06", name: "Issouf", g: "homme", age: 27, city: "Koudougou", job: "Professeur de mathématiques", edu: "licence", rel: "islam", branch: SUN, practice: 1, bio: "Prof de maths au lycée. Patient, curieux et pieux. Je veux une épouse avec qui partager les petites et les grandes choses de la vie.", av: { hair: "court", skin: 5, bg: 4, outfit: 5 } },
  { id: "m07", name: "Cheick Tidiane", g: "homme", age: 33, city: "Dakar", job: "Entrepreneur agritech", edu: "master", rel: "islam", branch: TIJ, practice: 1, bio: "Entrepreneur dans l'agriculture connectée. Ambitieux mais les pieds sur terre, je cherche une femme qui partage ma foi et mes rêves.", av: { hair: "court", headwear: "kufi", beard: true, skin: 6, bg: 5, outfit: 7 }, langs: ["Français", "Wolof", "Anglais"], plan: "premium_plus", photoVerified: true },
  { id: "m08", name: "Oumar", g: "homme", age: 31, city: "Bamako", job: "Transitaire", edu: "licence", rel: "islam", branch: SUN, practice: 1, bio: "Transitaire au port sec de Bamako. J'aime les voyages, le thé à la menthe et les discussions sur l'avenir.", av: { hair: "court", skin: 2, bg: 6, outfit: 11 }, langs: ["Français", "Bambara"] },
  { id: "m09", name: "Hamidou", g: "homme", age: 38, city: "Paris", job: "Ingénieur logiciel", edu: "master", rel: "islam", branch: SUN, practice: 1, bio: "Ingénieur à Paris depuis dix ans, je prépare mon retour au Burkina. Je cherche une épouse pour construire notre avenir là-bas.", av: { hair: "degrade", glasses: true, skin: 1, bg: 2, outfit: 4 }, plan: "premium_plus", photoVerified: true },
  { id: "m10", name: "Seydou", g: "homme", age: 28, city: "Ouagadougou", job: "Chef cuisinier", edu: "pro", rel: "islam", branch: SUN, practice: 2, bio: "Chef dans un restaurant de Ouaga 2000. Si tu aimes bien manger, on va s'entendre. Je cherche une relation sérieuse et joyeuse.", av: { hair: "chauve", beard: true, skin: 3, bg: 5, outfit: 8 } },
  { id: "m11", name: "Idrissa", g: "homme", age: 35, city: "Ouahigouya", job: "Agronome", edu: "master", rel: "islam", branch: SUN, practice: 0, bio: "Agronome au service des producteurs du Nord. Pieux, discret et fidèle, je veux une épouse pratiquante pour élever nos enfants dans la foi.", av: { hair: "court", headwear: "kufi", beard: true, skin: 4, bg: 0, outfit: 6 } },
  { id: "m12", name: "Rasmané", g: "homme", age: 30, city: "Ouagadougou", job: "Comptable dans une ONG", edu: "licence", rel: "islam", branch: SUN, practice: 1, bio: "Comptable, fiable et organisé. Ma mère dit que je cuisine mieux qu'elle, je te laisse juger.", av: { hair: "court", skin: 0, bg: 3, outfit: 10 }, photoVerified: true },
  { id: "m13", name: "Karim", g: "homme", age: 26, city: "Abidjan", job: "Développeur mobile", edu: "licence", rel: "islam", branch: SUN, practice: 2, bio: "Développeur mobile, passionné de tech et de basket. Je cherche une femme ambitieuse, avec qui partager projets et fous rires.", av: { hair: "afro", skin: 5, bg: 1, outfit: 5 }, intention: "serieux" },
  { id: "m14", name: "Ismaël", g: "homme", age: 40, city: "Ouagadougou", job: "Directeur d'école privée", edu: "master", rel: "islam", branch: SUN, practice: 0, marital: "veuf", children: 2, bio: "Directeur d'école, veuf et père de deux enfants. Je cherche une épouse pieuse et patiente pour rebâtir un foyer chaleureux.", av: { hair: "court", headwear: "kufi", beard: true, glasses: true, skin: 2, bg: 4, outfit: 3 }, plan: "premium" },
  { id: "m15", name: "Jean-Marc", g: "homme", age: 33, city: "Ouagadougou", job: "Ingénieur électricien", edu: "master", rel: "christianisme", branch: "Catholique", practice: 1, bio: "Catholique engagé dans ma paroisse depuis l'enfance. Je cherche une femme de foi pour fonder une famille unie et joyeuse.", av: { hair: "court", skin: 1, bg: 2, outfit: 1 } },
  { id: "m16", name: "Éric", g: "homme", age: 30, city: "Ouagadougou", job: "Enseignant et pasteur assistant", edu: "licence", rel: "christianisme", branch: "Évangélique", practice: 0, bio: "Serviteur de Dieu et enseignant. Je prie pour une épouse qui aime le Seigneur et qui aura plaisir à servir à mes côtés.", av: { hair: "degrade", glasses: true, skin: 3, bg: 6, outfit: 2 }, photoVerified: true },
  { id: "m17", name: "Paul", g: "homme", age: 28, city: "Bobo-Dioulasso", job: "Mécanicien, gérant de garage", edu: "pro", rel: "christianisme", branch: "Catholique", practice: 2, bio: "J'ai mon propre garage à Bobo. Travailleur et sérieux, j'aime la musique et le football. Je cherche une femme simple et sincère.", av: { hair: "court", beard: true, skin: 4, bg: 5, outfit: 0 } },
  { id: "m18", name: "Frank", g: "homme", age: 35, city: "Ouagadougou", job: "Avocat", edu: "master", rel: "christianisme", branch: "Protestant", practice: 1, marital: "divorce", bio: "Avocat au barreau du Burkina. J'ai appris de mes erreurs et je veux un mariage fondé sur la communication et la foi.", av: { hair: "degrade", glasses: true, skin: 6, bg: 3, outfit: 7 }, plan: "premium", photoVerified: true },
  { id: "m19", name: "Christian", g: "homme", age: 31, city: "Koudougou", job: "Professeur de français", edu: "licence", rel: "christianisme", branch: "Catholique", practice: 1, bio: "Prof de français et amoureux des livres. Calme et romantique, je rêve d'une famille nombreuse et joyeuse.", av: { hair: "afro", skin: 0, bg: 4, outfit: 9 } },
  { id: "m20", name: "Serge", g: "homme", age: 29, city: "Ouagadougou", job: "Commercial en assurances", edu: "licence", rel: "christianisme", branch: "Évangélique", practice: 1, bio: "Commercial, j'aime le contact humain. Chrétien engagé, je cherche une femme avec qui prier et rire au quotidien.", av: { hair: "degrade", skin: 2, bg: 0, outfit: 11 }, photoVerified: true },
  { id: "m21", name: "Emmanuel", g: "homme", age: 34, city: "Abidjan", job: "Ingénieur agronome", edu: "master", rel: "christianisme", branch: "Catholique", practice: 1, bio: "Ivoirien d'origine burkinabè, ingénieur agronome. Je cherche une femme posée, qui aime la famille et les valeurs chrétiennes.", av: { hair: "court", beard: true, skin: 5, bg: 1, outfit: 4 } },
  { id: "m22", name: "Joël", g: "homme", age: 27, city: "Ouagadougou", job: "Infirmier", edu: "licence", rel: "christianisme", branch: "Protestant", practice: 2, bio: "Infirmier au CMA de Pissy. Généreux et attentionné, je veux prendre le temps de bien connaître la personne.", av: { hair: "court", skin: 1, bg: 5, outfit: 6 }, intention: "serieux" },
  { id: "m23", name: "Arnaud", g: "homme", age: 37, city: "Bruxelles", job: "Consultant IT", edu: "master", rel: "christianisme", branch: "Catholique", practice: 2, bio: "Consultant à Bruxelles, je rentre souvent à Ouaga. Je cherche une compagne ouverte au projet de vivre entre deux pays.", av: { hair: "chauve", glasses: true, skin: 3, bg: 2, outfit: 10 } },
  { id: "m24", name: "Yacouba", g: "homme", age: 32, city: "Ouagadougou", job: "Artisan bronzier", edu: "pro", rel: "autre", branch: "Religion traditionnelle", practice: 1, bio: "Artisan bronzier au village artisanal de Ouaga. Attaché à nos traditions, je respecte toutes les croyances. Je cherche une femme travailleuse et honnête.", av: { hair: "court", beard: true, skin: 6, bg: 6, outfit: 3 } },
];

/** Profils « à problème » et en attente : ils servent la démo de l'espace admin. */
const SPECIAL: Row[] = [
  { id: "m90", name: "Malick", g: "homme", age: 38, city: "Marseille", job: "Ingénieur offshore", edu: "master", rel: "islam", branch: SUN, practice: 1, persona: "scam", bio: "Ingénieur sur plateforme pétrolière, souvent en mission. Homme de foi, je cherche une femme sérieuse pour me marier très vite. Je suis généreux et je prendrai soin de toi.", av: { hair: "degrade", beard: true, skin: 2, bg: 3, outfit: 1 }, days: 4 },
  { id: "f90", name: "Linda", g: "femme", age: 24, city: "Abidjan", job: "Hôtesse de l'air", edu: "licence", rel: "christianisme", branch: "Évangélique", practice: 2, persona: "scam", bio: "Hôtesse de l'air, je voyage beaucoup. Je cherche l'homme de ma vie. Écris-moi vite sur WhatsApp, je réponds plus rapidement là-bas.", av: { hair: "lisse", skin: 5, bg: 3, outfit: 11, earrings: true }, days: 3 },
  { id: "m91", name: "Patrick", g: "homme", age: 33, city: "Ouagadougou", job: "Commercial", edu: "bac", rel: "christianisme", branch: "Catholique", practice: 3, status: "banned", bio: "Profil banni pour messages insistants et déplacés.", av: { hair: "court", skin: 4, bg: 0, outfit: 8 }, days: 20 },
  { id: "f91", name: "Bintou", g: "femme", age: 24, city: "Ouagadougou", job: "Assistante comptable", edu: "licence", rel: "islam", branch: SUN, practice: 1, status: "pending", bio: "Assistante comptable, calme et souriante. Je cherche un homme sérieux, prêt pour le mariage.", av: { hair: "tresses", headwear: "hijab", skin: 1, bg: 4, outfit: 10, wrap: 4 }, days: 0 },
  { id: "m92", name: "Lassina", g: "homme", age: 29, city: "Banfora", job: "Technicien agricole", edu: "pro", rel: "islam", branch: SUN, practice: 1, status: "pending", bio: "Technicien agricole à Banfora, j'aime la nature et le travail bien fait. Je veux fonder une famille dans la foi.", av: { hair: "court", headwear: "kufi", skin: 3, bg: 5, outfit: 2 }, days: 0 },
  { id: "f92", name: "Delphine", g: "femme", age: 27, city: "Ouagadougou", job: "Pâtissière", edu: "pro", rel: "christianisme", branch: "Catholique", practice: 1, status: "pending", bio: "Pâtissière passionnée, je rêve d'ouvrir ma boutique. Je cherche un homme croyant, doux et patient.", av: { hair: "chignon", skin: 2, bg: 1, outfit: 6, earrings: true }, days: 1 },
];

const DEMO_ROWS: Row[] = [
  {
    id: DEMO_ACCOUNTS.homme.id,
    name: "Ibrahim",
    g: "homme",
    age: 31,
    city: "Ouagadougou",
    job: "Chef de projet digital",
    edu: "master",
    rel: "islam",
    branch: SUN,
    practice: 1,
    bio: "Chef de projet digital, je coordonne la création d'applications pour des entreprises. Pratiquant, posé et plein d'humour, je cherche une épouse avec qui bâtir un foyer apaisé, tourné vers la foi et la famille.",
    av: { hair: "court", beard: true, skin: 1, bg: 2, outfit: 1 },
    langs: ["Français", "Mooré", "Anglais"],
    days: 12,
  },
  {
    id: DEMO_ACCOUNTS.femme.id,
    name: "Aïcha",
    g: "femme",
    age: 27,
    city: "Ouagadougou",
    job: "Responsable RH",
    edu: "master",
    rel: "islam",
    branch: SUN,
    practice: 1,
    bio: "Responsable RH dans une entreprise de télécoms. J'aime cuisiner pour ceux que j'aime, lire et voyager. Je cherche un homme pieux, bienveillant et ambitieux pour fonder une famille unie, in sha Allah.",
    av: { hair: "tresses", headwear: "hijab", skin: 0, bg: 0, outfit: 6, wrap: 1 },
    langs: ["Français", "Mooré", "Dioula"],
    photoVerified: true,
    days: 9,
  },
];

/* ── Génération ─────────────────────────────────────────── */

function countryOf(city: string): string {
  for (const [country, cities] of Object.entries(CITIES_BY_COUNTRY)) if (cities.includes(city)) return country;
  return "Burkina Faso";
}

const clampIdx = (v: number, n: number) => Math.max(0, Math.min(n - 1, v));

function genAnswers(row: Row, diaspora: boolean, r: Rng): Record<string, number> {
  const { g, practice: p, rel } = row;
  const intention = row.intention ?? "mariage";
  const noisy = (base: number, n: number) => clampIdx(base + (r.chance(0.3) ? r.pick([-1, 1]) : 0), n);
  const muslimMan = rel === "islam" && g === "homme";
  return {
    r1: noisy(p, 4),
    r2: p === 0 ? 0 : p === 1 ? r.int(0, 1) : p === 2 ? r.int(1, 2) : 2,
    r3: p === 0 ? 0 : p === 1 ? r.int(0, 1) : p === 2 ? 1 : 2,
    v1: p <= 1 ? r.int(0, 1) : r.int(1, 2),
    v2: g === "femme" ? r.pick([0, 0, 1]) : p === 0 ? r.int(1, 2) : r.pick([0, 1, 1]),
    v3: rel !== "islam" ? 0 : muslimMan ? (p === 0 ? r.pick([1, 2, 2]) : r.pick([0, 1, 1, 2])) : r.pick([0, 0, 1]),
    c1: muslimMan && p === 0 ? r.pick([1, 2]) : r.pick([0, 0, 1, 2]),
    c2: r.int(0, 2),
    c3: intention === "mariage" ? r.int(0, 1) : r.int(1, 3),
    f1: r.pick([0, 1, 1, 2]),
    f2: r.pick([0, 1, 1, 2]),
    f3: r.pick([0, 1, 1, 2]),
    e1: p === 0 ? 0 : p === 3 ? 2 : r.pick([0, 1, 1]),
    e2: g === "femme" ? r.pick([0, 1, 1, 2]) : r.pick([0, 1, 2]),
    e3: p === 0 ? 0 : r.pick([0, 1, 2, 3]),
    m1: r.pick([0, 1, 1, 2]),
    m2: r.pick([0, 0, 1, 2]),
    m3: r.pick([0, 1, 1]),
    l1: r.int(0, 2),
    l2: r.int(0, 2),
    l3: diaspora ? r.pick([2, 3, 0]) : r.pick([0, 0, 3, 1]),
  };
}

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString();

function buildProfile(row: Row, now: number, r: Rng): Profile {
  const country = countryOf(row.city);
  const diaspora = !WEST_AFRICA.includes(country);
  const children = row.children ?? 0;
  const created = now - (row.days ?? r.int(6, 70)) * DAY - r.int(0, 20) * 3_600_000;
  const onlineRoll = r.next();
  const lastActive = onlineRoll < 0.22 ? now - r.int(0, 4) * 60_000 : now - r.int(20, 60 * 60) * 60_000;
  const plan = row.plan ?? "free";
  const [ageMin, ageMax] = row.g === "femme" ? [Math.max(20, row.age - 2), row.age + 12] : [Math.max(18, row.age - 10), row.age + 3];

  return {
    id: row.id,
    firstName: row.name,
    gender: row.g,
    age: row.age,
    city: row.city,
    country,
    profession: row.job,
    education: row.edu,
    marital: row.marital ?? "celibataire",
    children,
    intention: row.intention ?? "mariage",
    bio: row.bio,
    languages: row.langs ?? (country === "Burkina Faso" ? ["Français", r.pick(["Mooré", "Dioula", "Fulfuldé"])] : ["Français"]),
    religion: { key: row.rel, branch: row.branch, practice: row.practice },
    prefs: {
      ageMin,
      ageMax,
      religion: row.rel === "autre" ? "any" : "same",
      practice: row.practice === 0 ? "same" : "any",
      marital: [],
      location: "any",
      acceptsChildren: true,
      ...row.prefs,
    },
    family: {
      kids: row.kids ?? (children > 0 ? "deja" : "oui"),
      kidsCount: row.rel === "islam" && row.practice === 0 ? r.int(3, 4) : r.int(2, 3),
      work: row.g === "femme" ? r.pick(["oui", "oui", "choix"] as const) : "oui",
      relocate: diaspora ? "oui" : r.pick(["oui", "ville", "ville", "non"] as const),
      parents: r.pick(["elargie", "proximite", "proximite"] as const),
      importance: r.pick(["tres", "tres", "importante"] as const),
    },
    answers: genAnswers(row, diaspora, r),
    photo: null,
    avatar: { skin: 0, bg: 0, outfit: 0, ...row.av },
    privacy: { blurPhoto: row.av.headwear === "hijab" && r.chance(0.35), visibility: "public" },
    verification: {
      phone: row.status === "pending" || r.chance(0.12) ? "none" : "verified",
      photo: row.photoVerified ? "verified" : "none",
      identity: row.photoVerified && r.chance(0.3) ? "verified" : "none",
    },
    status: row.status ?? "approved",
    statusReason: row.status === "banned" ? "Harcèlement signalé et confirmé" : undefined,
    plan,
    planUntil: plan === "free" ? undefined : iso(now + r.int(8, 26) * DAY),
    onboarded: true,
    createdAt: iso(created),
    lastActiveAt: iso(Math.max(lastActive, created)),
    seeded: true,
    persona: row.persona,
  };
}

/* ── Scénarios des comptes de démo ──────────────────────── */

/** Réponses soignées pour que les comptes de démo aient de belles affinités. */
const DEMO_TUNING: Record<string, Partial<Profile>> = {
  [DEMO_ACCOUNTS.homme.id]: {
    answers: { r1: 1, r2: 1, r3: 1, v1: 1, v2: 0, v3: 0, c1: 0, c2: 1, c3: 1, f1: 1, f2: 1, f3: 1, e1: 1, e2: 1, e3: 0, m1: 1, m2: 0, m3: 1, l1: 1, l2: 1, l3: 0 },
    family: { kids: "oui", kidsCount: 3, work: "oui", relocate: "ville", parents: "proximite", importance: "tres" },
    prefs: { ageMin: 22, ageMax: 33, religion: "same", practice: "any", marital: [], location: "any", acceptsChildren: true },
    verification: { phone: "verified", photo: "none", identity: "none", phoneNumber: "+226 70 12 34 56" },
    privacy: { blurPhoto: false, visibility: "public" },
    plan: "free",
    seeded: false,
  },
  [DEMO_ACCOUNTS.femme.id]: {
    answers: { r1: 1, r2: 0, r3: 1, v1: 1, v2: 0, v3: 0, c1: 0, c2: 1, c3: 1, f1: 1, f2: 0, f3: 1, e1: 1, e2: 1, e3: 0, m1: 1, m2: 0, m3: 1, l1: 1, l2: 1, l3: 0 },
    family: { kids: "oui", kidsCount: 3, work: "oui", relocate: "ville", parents: "proximite", importance: "tres" },
    prefs: { ageMin: 26, ageMax: 40, religion: "same", practice: "any", marital: [], location: "any", acceptsChildren: true },
    verification: { phone: "verified", photo: "verified", identity: "none", phoneNumber: "+226 76 45 67 89" },
    privacy: { blurPhoto: false, visibility: "public" },
    plan: "free",
    seeded: false,
  },
};

type Conv = [from: string, text: string, minutesAgo: number][];

const CONVERSATIONS: { a: string; b: string; stage: number; daysAgo: number; lines: Conv }[] = [
  {
    a: DEMO_ACCOUNTS.homme.id,
    b: "f01",
    stage: 0,
    daysAgo: 2,
    lines: [
      ["f01", "Assalamou alaykoum Ibrahim 😊 Merci d'avoir accepté ma demande.", 2800],
      [DEMO_ACCOUNTS.homme.id, "Wa alaykoum salam Aminata ! Avec plaisir. Sage-femme, c'est un beau métier, ça doit demander beaucoup de courage.", 2790],
      ["f01", "Merci ! C'est fatigant mais tellement gratifiant. Et toi, chef de projet digital, ça consiste en quoi exactement ?", 2700],
      [DEMO_ACCOUNTS.homme.id, "Je coordonne des équipes qui créent des applications pour des entreprises. Mais dis-moi, qu'est-ce qui compte le plus pour toi dans un mariage ?", 1500],
      ["f01", "La sincérité et la foi. Je veux un foyer où l'on prie ensemble et où l'on se dit les choses franchement. Et toi ?", 95],
    ],
  },
  {
    a: DEMO_ACCOUNTS.femme.id,
    b: "m01",
    stage: 1,
    daysAgo: 4,
    lines: [
      ["m01", "Assalamou alaykoum Aïcha, j'espère que ta journée se passe bien.", 5600],
      [DEMO_ACCOUNTS.femme.id, "Wa alaykoum salam Moussa, oui alhamdoulillah ! Et la tienne ?", 5590],
      ["m01", "Chargée ! J'étais sur un chantier à Koupéla toute la matinée 😅 Ton profil dit que tu aimes cuisiner, c'est quoi ta spécialité ?", 5500],
      [DEMO_ACCOUNTS.femme.id, "Le tô sauce gombo de ma mère, personne ne le fait mieux 😄", 3000],
      ["m01", "Alors il faudra que je goûte un jour, in sha Allah. Merci pour notre appel d'hier soir, j'ai beaucoup apprécié.", 120],
    ],
  },
  {
    a: DEMO_ACCOUNTS.femme.id,
    b: "m90",
    stage: 0,
    daysAgo: 1,
    lines: [
      ["m90", "Bonsoir ma chérie, tu es vraiment la femme que Dieu m'a destinée ❤️", 1300],
      [DEMO_ACCOUNTS.femme.id, "Bonsoir Malick, merci… On vient à peine de commencer à discuter 😅", 1250],
      ["m90", "Je sais ce que je veux. Je t'ai envoyé un colis de cadeaux depuis Marseille mais il est bloqué à la douane. Tu peux m'envoyer 75.000 F par Orange Money pour le dédouanement ? Je te rembourse dès mon retour.", 40],
    ],
  },
];

/** Paires sans message (matchs tout frais). */
const FRESH_MATCHES: [string, string, number][] = [
  [DEMO_ACCOUNTS.homme.id, "f04", 3],
  [DEMO_ACCOUNTS.femme.id, "m12", 5],
];

const INCOMING: { from: string; to: string; kind: "interest" | "super"; message?: string; hoursAgo: number }[] = [
  {
    from: "f02",
    to: DEMO_ACCOUNTS.homme.id,
    kind: "super",
    message: "Assalamou alaykoum Ibrahim. Ton profil m'a touchée : même vision du mariage et de la famille. J'aimerais te connaître davantage.",
    hoursAgo: 5,
  },
  { from: "f09", to: DEMO_ACCOUNTS.homme.id, kind: "interest", hoursAgo: 20 },
  {
    from: "m02",
    to: DEMO_ACCOUNTS.femme.id,
    kind: "super",
    message: "Assalamou alaykoum Aïcha. Nos réponses se ressemblent beaucoup, surtout sur la foi et la famille. Serais-tu d'accord pour qu'on échange ?",
    hoursAgo: 3,
  },
  { from: "m06", to: DEMO_ACCOUNTS.femme.id, kind: "interest", hoursAgo: 26 },
];

const VISITORS: Record<string, string[]> = {
  [DEMO_ACCOUNTS.homme.id]: ["f03", "f07", "f12", "f13", "f08"],
  [DEMO_ACCOUNTS.femme.id]: ["m07", "m09", "m13", "m04", "m10"],
};

const GENERIC_LINES = [
  "Assalamou alaykoum, merci d'avoir accepté 😊",
  "Bonjour ! Ravi(e) de faire ta connaissance.",
  "J'ai lu ton profil, on a beaucoup de points communs.",
  "Qu'est-ce qui compte le plus pour toi dans un mariage ?",
  "La confiance et la foi, sans hésiter. Et pour toi ?",
  "Pareil. Et la famille, bien sûr.",
  "Tu vis à quel quartier ?",
  "Tu fais quoi le week-end en général ?",
];

/* ── Construction de la base ────────────────────────────── */

export function buildSeed(now = Date.now()): DemoDB {
  const r = rng(20260924);
  let seq = 1;
  const id = (p: string) => `${p}_${(seq++).toString(36)}`;

  const profiles: Record<string, Profile> = {};
  for (const row of [...WOMEN, ...MEN, ...SPECIAL, ...DEMO_ROWS]) {
    profiles[row.id] = buildProfile(row, now, r);
  }
  for (const [uid, tuning] of Object.entries(DEMO_TUNING)) {
    profiles[uid] = { ...profiles[uid], ...tuning, lastActiveAt: iso(now) };
  }
  // Le faux profil a des réponses « miroir » d'Aïcha : c'est ce qui rend l'arnaque crédible.
  profiles.m90.answers = { ...profiles[DEMO_ACCOUNTS.femme.id].answers, l1: 2 };
  profiles.m90.family = { ...profiles[DEMO_ACCOUNTS.femme.id].family };
  profiles.m90.prefs = { ...profiles.m90.prefs, ageMin: 22, ageMax: 40 };

  const accounts: Account[] = [
    { id: DEMO_ACCOUNTS.homme.id, email: DEMO_ACCOUNTS.homme.email, password: DEMO_PASSWORD, role: "member", createdAt: profiles[DEMO_ACCOUNTS.homme.id].createdAt },
    { id: DEMO_ACCOUNTS.femme.id, email: DEMO_ACCOUNTS.femme.email, password: DEMO_PASSWORD, role: "member", createdAt: profiles[DEMO_ACCOUNTS.femme.id].createdAt },
    { id: DEMO_ACCOUNTS.admin.id, email: DEMO_ACCOUNTS.admin.email, password: DEMO_PASSWORD, role: "admin", createdAt: iso(now - 90 * DAY) },
  ];

  const interests: Interest[] = [];
  const matches: Match[] = [];
  const messages: Message[] = [];
  const visits: Visit[] = [];
  const notifications: AppNotification[] = [];
  const payments: Payment[] = [];
  const reports: Report[] = [];

  const notify = (userId: string, kind: AppNotification["kind"], title: string, body: string, href: string, at: number) =>
    notifications.push({ id: id("n"), userId, kind, title, body, href, createdAt: iso(at), read: true, toasted: true });

  /* Conversations écrites à la main pour les comptes de démo */
  for (const c of CONVERSATIONS) {
    const created = now - c.daysAgo * DAY;
    const matchId = id("m");
    interests.push({ id: id("i"), from: c.b, to: c.a, kind: "interest", status: "accepted", createdAt: iso(created - 3_600_000), respondedAt: iso(created) });
    const last = c.lines[c.lines.length - 1];
    matches.push({ id: matchId, users: [c.a, c.b], createdAt: iso(created), stage: c.stage, lastMessageAt: iso(now - last[2] * 60_000) });
    for (const [from, text, minutesAgo] of c.lines) {
      const at = now - minutesAgo * 60_000;
      const risky = /douane|orange money/i.test(text);
      messages.push({
        id: id("msg"),
        matchId,
        from,
        text,
        createdAt: iso(at),
        readAt: from === c.a || minutesAgo > 200 ? iso(at + 60_000) : undefined,
        risk: risky ? "warn" : "none",
        flags: risky ? ["argent"] : [],
      });
    }
    notify(c.a, "match", "Nouveau match", `Vous vous êtes plu mutuellement avec ${profiles[c.b].firstName}.`, `/messages/${matchId}`, created);
  }
  for (const [a, b, hoursAgo] of FRESH_MATCHES) {
    const created = now - hoursAgo * 3_600_000;
    interests.push({ id: id("i"), from: a, to: b, kind: "interest", status: "accepted", createdAt: iso(created - 7_200_000), respondedAt: iso(created) });
    const matchId = id("m");
    matches.push({ id: matchId, users: [a, b], createdAt: iso(created), stage: 0 });
    notifications.push({
      id: id("n"),
      userId: a,
      kind: "match",
      title: "C'est réciproque ! 🎉",
      body: `${profiles[b].firstName} a accepté ta demande. Lance la conversation !`,
      href: `/messages/${matchId}`,
      createdAt: iso(created),
      read: false,
      toasted: true,
    });
  }
  for (const inc of INCOMING) {
    const at = now - inc.hoursAgo * 3_600_000;
    interests.push({ id: id("i"), from: inc.from, to: inc.to, kind: inc.kind, message: inc.message, status: "pending", createdAt: iso(at) });
    notifications.push({
      id: id("n"),
      userId: inc.to,
      kind: "interest",
      title: inc.kind === "super" ? "Super-intérêt reçu ⭐" : "Nouvel intérêt",
      body: `${profiles[inc.from].firstName} s'intéresse à ton profil.`,
      href: "/matches?tab=recus",
      createdAt: iso(at),
      read: false,
      toasted: true,
    });
  }
  for (const [uid, visitors] of Object.entries(VISITORS)) {
    visitors.forEach((v, i) => visits.push({ id: id("v"), from: v, to: uid, at: iso(now - (i * 7 + 2) * 3_600_000) }));
  }
  notify(DEMO_ACCOUNTS.homme.id, "system", "Bienvenue sur FaithMatch", "Ton profil a été validé par notre équipe. Bonne découverte !", "/home", now - 11 * DAY);
  notify(DEMO_ACCOUNTS.femme.id, "system", "Bienvenue sur FaithMatch", "Ton profil a été validé par notre équipe. Bonne découverte !", "/home", now - 8 * DAY);

  /* Activité entre profils fictifs (alimente les statistiques admin) */
  const bots = Object.values(profiles).filter((p) => p.seeded && p.status === "approved" && !p.persona);
  const women = bots.filter((p) => p.gender === "femme");
  const men = bots.filter((p) => p.gender === "homme");
  let botMatches = 0;
  for (const w of women) {
    for (const m of men) {
      if (botMatches >= 11 || hardFilter(w, m)) continue;
      if (compatibility(w, m).score < 74 || !r.chance(0.3)) continue;
      const created = now - r.int(2, 40) * DAY;
      const matchId = id("m");
      const [first, second] = r.chance(0.5) ? [w.id, m.id] : [m.id, w.id];
      interests.push({ id: id("i"), from: first, to: second, kind: "interest", status: "accepted", createdAt: iso(created - 5_400_000), respondedAt: iso(created) });
      const n = r.int(2, 6);
      let t = created;
      for (let k = 0; k < n; k++) {
        t += r.int(10, 600) * 60_000;
        messages.push({ id: id("msg"), matchId, from: k % 2 === 0 ? first : second, text: GENERIC_LINES[k % GENERIC_LINES.length], createdAt: iso(Math.min(t, now - 60_000)), readAt: iso(Math.min(t + 60_000, now)), risk: "none", flags: [] });
      }
      matches.push({ id: matchId, users: [first, second], createdAt: iso(created), stage: r.pick([0, 0, 1, 1, 2]), lastMessageAt: iso(Math.min(t, now - 60_000)) });
      botMatches++;
    }
  }
  for (let k = 0; k < 26; k++) {
    const a = r.pick(bots);
    const b = r.pick(bots.filter((p) => p.gender !== a.gender));
    const duplicate = interests.some((x) => (x.from === a.id && x.to === b.id) || (x.from === b.id && x.to === a.id));
    if (hardFilter(a, b) || duplicate) continue;
    interests.push({ id: id("i"), from: a.id, to: b.id, kind: r.chance(0.2) ? "super" : "interest", status: r.pick(["pending", "pending", "declined"] as const), createdAt: iso(now - r.int(1, 30) * DAY) });
  }
  for (let k = 0; k < 70; k++) {
    const a = r.pick(bots);
    const b = r.pick(bots.filter((p) => p.gender !== a.gender));
    visits.push({ id: id("v"), from: a.id, to: b.id, at: iso(now - r.int(1, 45 * 24) * 3_600_000) });
  }

  /* Paiements : abonnements en cours, historique, boosts, quelques échecs */
  const methods = ["orange", "orange", "moov", "wave", "card"] as const;
  const pay = (userId: string, item: Payment["item"], at: number, status: Payment["status"] = "success") => {
    const amount = item === "boost" ? 500 : item === "premium" ? 2500 : 5000;
    const method = r.pick(methods);
    payments.push({
      id: id("p"),
      userId,
      item,
      amount,
      method,
      phone: method === "card" ? undefined : `+226 ${r.pick(["70", "76", "65", "07", "51"])} ${r.int(10, 99)} ${r.int(10, 99)} ${r.int(10, 99)}`,
      status,
      ref: `FM-${(at / 1000).toFixed(0).slice(-7)}-${r.int(100, 999)}`,
      createdAt: iso(at),
    });
  };
  for (const p of Object.values(profiles)) {
    if (p.plan === "free" || !p.planUntil) continue;
    const renewed = new Date(p.planUntil).getTime() - 30 * DAY;
    pay(p.id, p.plan, renewed);
    if (r.chance(0.6)) pay(p.id, p.plan, renewed - 30 * DAY);
    if (r.chance(0.5)) pay(p.id, "boost", renewed + r.int(1, 6) * DAY);
  }
  for (const uid of ["f12", "m04", "f19", "m20", "f05"]) pay(uid, "boost", now - r.int(1, 25) * DAY);
  pay("m13", "premium", now - 2 * DAY, "failed");
  pay("f14", "premium", now - 6 * DAY, "failed");
  payments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  /* Signalements : de quoi montrer la modération */
  reports.push(
    {
      id: id("r"),
      by: "f09",
      target: "m90",
      reason: "argent",
      details: "Après deux jours de discussion, il m'a demandé 75.000 FCFA pour des « frais de douane » sur un colis de cadeaux.",
      priority: "critical",
      status: "open",
      createdAt: iso(now - 20 * 3_600_000),
    },
    {
      id: id("r"),
      by: "m13",
      target: "f90",
      reason: "faux_profil",
      details: "Ses photos viennent d'un compte Instagram connu, elle refuse tout appel vidéo et insiste pour passer sur WhatsApp.",
      priority: "high",
      status: "open",
      createdAt: iso(now - 30 * 3_600_000),
    },
    {
      id: id("r"),
      by: "m04",
      target: "f90",
      reason: "arnaque",
      details: "Me demande de recharger son crédit téléphone pour « pouvoir continuer à discuter ».",
      priority: "high",
      status: "open",
      createdAt: iso(now - 9 * 3_600_000),
    },
    {
      id: id("r"),
      by: "f15",
      target: "m91",
      reason: "harcelement",
      details: "Messages insistants et déplacés malgré mes refus répétés.",
      priority: "high",
      status: "resolved",
      action: "ban",
      createdAt: iso(now - 18 * DAY),
      resolvedAt: iso(now - 17 * DAY),
    },
    {
      id: id("r"),
      by: "m17",
      target: "f19",
      reason: "faux_profil",
      details: "Je pense que c'est un faux profil.",
      priority: "low",
      status: "dismissed",
      action: "none",
      createdAt: iso(now - 9 * DAY),
      resolvedAt: iso(now - 8 * DAY),
    },
  );
  profiles.m15.verification.photo = "pending";
  profiles.f21.verification.photo = "pending";

  return {
    v: DB_VERSION,
    seededAt: iso(now),
    seq,
    accounts,
    profiles,
    interests,
    matches,
    messages,
    visits,
    passes: [],
    blocks: [],
    reports,
    notifications,
    payments,
    scheduled: [],
    counters: {},
    flags: {},
  };
}
