import type { Profile } from "../types";
import { hashString } from "./prng";

/**
 * Réponses automatiques des profils fictifs pendant la démo.
 * Simples règles par mots-clés, nourries par le profil du répondant,
 * pour que la conversation reste crédible devant un client.
 */

function g(me: Profile, masc: string, fem: string) {
  return me.gender === "femme" ? fem : masc;
}

function faithLine(bot: Profile): string {
  const muslim = bot.religion.key === "islam";
  const christian = bot.religion.key === "christianisme";
  if (bot.religion.practice === 0) {
    if (muslim) return "La foi est au centre de ma vie. Je fais mes cinq prières et j'aimerais qu'on prie ensemble à la maison.";
    if (christian) return "Dieu est au centre de ma vie. Je ne rate jamais le culte du dimanche et j'aimerais un foyer où l'on prie ensemble.";
  }
  if (bot.religion.practice === 1) {
    if (muslim) return `Je suis ${bot.gender === "femme" ? "pratiquante" : "pratiquant"}, je fais mes prières et le Ramadan compte beaucoup pour moi. La foi guide mes grandes décisions.`;
    if (christian) return "Je vais à l'église chaque semaine et la prière m'aide beaucoup au quotidien.";
  }
  if (bot.religion.key === "autre") return "J'ai ma propre spiritualité et je respecte profondément la foi des autres. Pour moi, c'est le respect qui compte.";
  return "La foi est importante pour moi, même si je la vis de manière discrète et personnelle.";
}

function familyLine(bot: Profile): string {
  const { kids, kidsCount, parents } = bot.family;
  const wish = bot.religion.key === "islam" ? "in sha Allah" : "si Dieu le veut";
  const kidsText =
    kids === "oui"
      ? `J'aimerais avoir ${kidsCount} enfants, ${wish}.`
      : kids === "deja"
        ? `J'ai déjà ${bot.children > 1 ? `${bot.children} enfants` : "un enfant"}, c'est ma plus grande fierté.`
        : kids === "non"
          ? "Pour être honnête, je ne souhaite pas d'enfants."
          : "Pour les enfants, je n'ai pas encore d'idée arrêtée, j'aimerais en décider à deux.";
  const parentsText =
    parents === "elargie"
      ? "La famille élargie compte énormément pour moi."
      : parents === "proximite"
        ? "Mes parents comptent beaucoup, mais je pense que le couple doit avoir son propre foyer."
        : "Je pense que le couple doit garder son indépendance.";
  return `${kidsText} ${parentsText}`;
}

const HOBBIES = [
  "Le week-end, j'aime rendre visite à la famille et cuisiner un bon plat.",
  "J'aime lire, marcher en fin de journée et regarder un bon match.",
  "Je fais un peu de sport le matin et j'adore découvrir de nouveaux restaurants.",
  "J'aime la musique, les sorties entre amis et les longues discussions.",
];

const FOLLOW_UPS = [
  "Et toi, qu'est-ce qui te rend {heureux} au quotidien ?",
  "Comment imagines-tu une journée idéale en famille ?",
  "Tu as des frères et sœurs ?",
  "Qu'est-ce que tu attends le plus de ton futur conjoint ?",
  "Quel est ton plus beau souvenir de voyage ?",
  "Qu'est-ce que tes proches disent de toi ?",
];

const SCAM_SCRIPT: Record<Profile["gender"], string[]> = {
  homme: [
    "Tu es encore plus belle que sur ta photo ❤️ Dieu a mis ce site sur mon chemin pour te trouver.",
    "Je suis en mission sur la plateforme jusqu'au mois prochain. J'ai déjà parlé de toi à ma mère, elle a hâte de te connaître.",
    "Ma chérie, j'ai un petit souci : ma carte est bloquée ici. Envoie-moi juste 50.000 F par Orange Money et je te rembourse le double à mon retour, je te le jure.",
    "Pourquoi tu ne réponds pas ? Si tu m'aimes vraiment tu vas m'aider. Passe sur WhatsApp, c'est plus simple.",
  ],
  femme: [
    "Tu es vraiment l'homme que j'attendais ❤️ Je le sens déjà.",
    "Je suis entre deux vols, je pense à toi à chaque escale. Tu me fais confiance ?",
    "Mon chéri, ma maman est malade et je n'ai pas encore reçu mon salaire. Envoie-moi 40.000 F par Orange Money pour ses médicaments, je te rembourse vite.",
    "Réponds-moi sur WhatsApp, ici je n'ai pas toujours le réseau. Tu ne vas pas me laisser tomber ?",
  ],
};

export function botReply(bot: Profile, me: Profile, userText: string, turn: number): string {
  const t = userText.toLowerCase();
  const muslim = bot.religion.key === "islam";
  const seed = hashString(`${bot.id}:${turn}`);
  const followUp = FOLLOW_UPS[seed % FOLLOW_UPS.length].replace("{heureux}", g(me, "heureux", "heureuse"));

  if (bot.persona === "scam") {
    const script = SCAM_SCRIPT[bot.gender];
    return script[Math.min(turn, script.length - 1)];
  }

  if (/(argent|fcfa|orange money|moov|wave|envoie[- ]moi)/.test(t)) {
    return "Je préfère qu'on ne parle pas d'argent ici, j'espère que tu comprends. Apprenons d'abord à nous connaître 🙂";
  }
  if (/(appel|appeler|num[ée]ro|whatsapp|rencontr|se voir|caf[ée])/.test(t)) {
    return "Avec plaisir, mais j'aimerais qu'on échange encore un peu ici avant, pour mieux se connaître. Ensuite, pourquoi pas un appel, avec la bénédiction de nos familles 😊";
  }
  if (/(salam|assalam|bonjour|bonsoir|salut|coucou|hello)/.test(t) && turn === 0) {
    const hello = muslim ? `Wa alaykoum salam ${me.firstName} 😊` : `Bonjour ${me.firstName} 😊`;
    return `${hello} Merci pour ton message, ça me fait plaisir. Comment se passe ta journée ?`;
  }
  if (/(travail|m[ée]tier|boulot|profession|fais quoi|job)/.test(t)) {
    return `Je suis ${bot.profession.toLowerCase()} à ${bot.city}. J'aime ce que je fais, même si c'est prenant. ${followUp}`;
  }
  if (/(enfant|famille|parents|maman|papa|fr[èe]re|s[œo]eur)/.test(t)) {
    return `${familyLine(bot)} Et toi, comment vois-tu ta future famille ?`;
  }
  if (/(pri[eè]re|prier|mosqu|[ée]glise|foi|religion|dieu|allah|coran|bible|messe|ramadan|car[eê]me|culte)/.test(t)) {
    return faithLine(bot);
  }
  if (/(mariage|marier|[ée]pou|mari\b|foyer)/.test(t)) {
    return `Pour moi, le mariage c'est un engagement sincère devant ${muslim ? "Allah" : "Dieu"} et devant nos familles. Je cherche quelqu'un avec qui avancer pas à pas. ${followUp}`;
  }
  if (/(quartier|ville|habite|vis o[uù]|d'o[uù])/.test(t)) {
    return `J'habite à ${bot.city}. ${bot.country === "Burkina Faso" ? "Je m'y sens bien, c'est chez moi." : "Mais le Burkina reste toujours dans mon cœur."} Et toi, tu vis dans quel quartier ?`;
  }
  if (/(week|loisir|aimes faire|passion|sport|temps libre)/.test(t)) {
    return `${HOBBIES[seed % HOBBIES.length]} Et toi ?`;
  }
  if (/(merci|belle|beau|jolie|charmant|gentil)/.test(t)) {
    return `Merci, c'est gentil 😊 ${followUp}`;
  }
  if (t.includes("?")) {
    return `Bonne question ! Je dirais que la sincérité compte plus que tout pour moi. ${followUp}`;
  }
  const generic = [
    `Je comprends tout à fait. ${followUp}`,
    `C'est intéressant, j'aime ta façon de voir les choses. ${followUp}`,
    `Je te rejoins là-dessus. ${followUp}`,
  ];
  return generic[seed % generic.length];
}
