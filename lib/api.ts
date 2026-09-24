/**
 * Point d'entrée unique des données pour l'interface.
 *
 * Aujourd'hui : backend de démonstration (navigateur, profils fictifs, activité simulée).
 * En production : même liste de fonctions, implémentée sur Supabase
 * (voir supabase/migrations et docs/PASSAGE-EN-PRODUCTION.md). Les pages n'ont pas à changer.
 */
import * as demo from "./demo/backend";

export type {
  ActionResult,
  AdminMember,
  AdminReportGroup,
  AdminStats,
  Conversation,
  DiscoverFilters,
  MatchItem,
  ProfileCard,
  Quota,
  Session,
  SignUpInput,
} from "./demo/backend";

export const api = demo;

export const IS_DEMO = true;
