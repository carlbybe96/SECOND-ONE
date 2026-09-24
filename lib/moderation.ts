import type { RiskLevel } from "./types";

/**
 * Modération des messages (PRD §25 et §43), version règles.
 * En production, cette étape passe par une API de modération / un LLM ;
 * les catégories et niveaux restent les mêmes.
 *   none  → envoyé
 *   info  → envoyé, conseil discret
 *   warn  → envoyé, bandeau d'alerte dans la conversation
 *   block → refusé
 */

export type Analysis = {
  level: RiskLevel;
  flags: string[];
  notice?: string;
};

const MONEY_TERMS =
  /(orange\s*money|moov\s*money|\bwave\b|western\s*union|money\s*gram|\bria\b|mobile\s*money|carte[s]?\s*cadeau|frais\s+de\s+(douane|dossier|transport|visa)|\bdouane\b|transfert|virement|recharge|cr[ée]dit\s+t[ée]l[ée]phone)/i;
const MONEY_ASK =
  /(envoie|envoyer|envoies|envoyez|pr[êe]te|pr[êe]ter|d[ée]panne|d[ée]panner|aide[- ]moi|besoin|fais[- ]moi|donne[- ]moi|avance|payer|paie|rembourse)/i;
const MONEY_AMOUNT = /(\d[\d .]{1,9}\s*(f\b|fcfa|cfa|francs?|€|euros?|\$|dollars?|mille|k\b))|\bargent\b|\bsous\b|\bthune\b/i;

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|info|xyz|me|link|ly)\b)/i;
const PHONE = /(\+?\d[\d .-]{7,}\d)/;

// Liste volontairement courte et ciblée (mots entiers) pour éviter les faux positifs.
const ABUSE =
  /\b(salope|pute|putain|connard|connasse|encul[ée]|b[âa]tard|pd|nique|ta\s+gueule|fils\s+de\s+pute|chienne)\b/i;
const SEXUAL = /\b(nude|nudes|photo[s]?\s+(nue|sexy|intime)|coucher\s+avec|sexe|sexy|sucer|porno|seins|fesses)\b/i;

export function analyzeMessage(text: string): Analysis {
  const t = text.normalize("NFC");

  if (ABUSE.test(t)) {
    return {
      level: "block",
      flags: ["harcelement"],
      notice: "Message non envoyé : il ne respecte pas la charte de bonne conduite.",
    };
  }
  if (SEXUAL.test(t)) {
    return {
      level: "block",
      flags: ["contenu_sexuel"],
      notice: "Message non envoyé : les contenus à caractère sexuel ne sont pas autorisés.",
    };
  }

  const flags: string[] = [];
  const moneyContext = MONEY_TERMS.test(t) || MONEY_AMOUNT.test(t);
  if (moneyContext && (MONEY_ASK.test(t) || MONEY_TERMS.test(t))) flags.push("argent");
  if (LINK.test(t)) flags.push("lien");

  if (flags.includes("argent")) {
    return {
      level: "warn",
      flags,
      notice:
        "Cette conversation semble contenir une demande d'argent. Ne transfère jamais d'argent à une personne que tu n'as pas rencontrée.",
    };
  }
  if (flags.includes("lien")) {
    return { level: "warn", flags, notice: "Lien externe détecté. N'ouvre pas un lien envoyé par une personne que tu ne connais pas encore." };
  }
  if (PHONE.test(t)) {
    return {
      level: "info",
      flags: ["contact"],
      notice: "Prends le temps de faire connaissance avant de partager ton numéro. Tu peux continuer à échanger ici en toute sécurité.",
    };
  }
  return { level: "none", flags: [] };
}
