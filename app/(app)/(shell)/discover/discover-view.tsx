"use client";

import { Briefcase, Crown, Heart, Lock, MapPin, Rocket, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MatchModal, PaywallModal, SuperInterestModal } from "@/components/dialogs";
import { Empty, PremiumBadge, Skeleton, Verified } from "@/components/ui/bits";
import { Modal } from "@/components/ui/modal";
import ProfilePhoto from "@/components/ui/photo";
import { CategoryBars, CompatPoints, ScoreRing } from "@/components/ui/score";
import { toast } from "@/components/ui/toaster";
import { api, type DiscoverFilters, type ProfileCard } from "@/lib/api";
import { COUNTRIES, PRACTICE_LEVELS } from "@/lib/config";
import { useQuery, useSession } from "@/lib/hooks";
import { practiceLabel, religionLine } from "@/lib/profile-utils";

const FILTERS_KEY = "fm_discover_filters";

function loadFilters(): DiscoverFilters {
  try {
    const raw = window.sessionStorage.getItem(FILTERS_KEY);
    return raw ? { ...api.DEFAULT_FILTERS, ...JSON.parse(raw) } : api.DEFAULT_FILTERS;
  } catch {
    return api.DEFAULT_FILTERS;
  }
}

export default function DiscoverView() {
  const { data: session } = useSession();
  const me = session?.profile;
  // La page ne s'affiche qu'une fois la session chargée côté navigateur : pas de risque d'écart d'hydratation.
  const [filters, setFilters] = useState<DiscoverFilters>(() => (typeof window === "undefined" ? api.DEFAULT_FILTERS : loadFilters()));
  const { data, loading } = useQuery(`discover:${JSON.stringify(filters)}`, () => api.discover(filters));
  const [leaving, setLeaving] = useState<{ id: string; dir: "left" | "right" } | null>(null);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [superFor, setSuperFor] = useState<ProfileCard | null>(null);
  const [matched, setMatched] = useState<{ card: ProfileCard; matchId: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const current = data?.items[0];
  const premium = data?.quota.plan !== "free";
  const drag = useRef<{ x: number; y: number; t: number; id: number; active: boolean } | null>(null);
  const swiped = useRef(false);

  // Renvoie false si l'action n'a pas abouti (quota, erreur) : la carte doit alors revenir à sa place.
  const act = useCallback(
    async (kind: "pass" | "interest"): Promise<boolean> => {
      if (!current || leaving) return false;
      setLeaving({ id: current.profile.id, dir: kind === "pass" ? "left" : "right" });
      await new Promise((r) => window.setTimeout(r, 230));
      if (kind === "pass") {
        await api.pass(current.profile.id);
      } else {
        const res = await api.sendInterest(current.profile.id, "interest");
        if (!res.ok) {
          setLeaving(null);
          if (res.code === "quota" || res.code === "premium") setPaywall(res.error ?? null);
          else toast({ title: "Action impossible", body: res.error, kind: "error" });
          return false;
        }
        if (res.matchId) setMatched({ card: current, matchId: res.matchId });
        else toast({ title: `Intérêt envoyé à ${current.profile.firstName}`, body: "Tu seras prévenu(e) dès qu'il y a une réponse.", kind: "interest" });
      }
      setLeaving(null);
      return true;
    },
    [current, leaving],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.querySelector(".modal-backdrop")) return;
      if (e.key === "ArrowLeft") act("pass");
      if (e.key === "ArrowRight") act("interest");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  function applyFilters(f: DiscoverFilters) {
    setFilters(f);
    try {
      window.sessionStorage.setItem(FILTERS_KEY, JSON.stringify(f));
    } catch {
      // pas grave : les filtres ne seront simplement pas mémorisés
    }
    setShowFilters(false);
  }

  // Glisser la carte (tactile) : à droite = intérêt, à gauche = passer. Le défilement vertical reste natif (touch-action: pan-y).
  function resetCard(el: HTMLElement) {
    el.style.transition = "";
    el.style.transform = "";
    el.style.opacity = "";
    el.style.removeProperty("--swipe");
    el.style.willChange = "";
  }
  function onCardDown(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType === "mouse" || leaving) return;
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, active: false };
  }
  function onCardMove(e: React.PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const el = e.currentTarget;
    if (!d.active) {
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null;
        return;
      }
      if (Math.abs(dx) < 12) return;
      d.active = true;
      el.setPointerCapture(e.pointerId);
      el.style.transition = "none";
      el.style.willChange = "transform";
    }
    el.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`;
    el.style.setProperty("--swipe", String(Math.max(-1, Math.min(1, dx / 110))));
  }
  function onCardUp(e: React.PointerEvent<HTMLElement>) {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    const el = e.currentTarget;
    const dx = e.clientX - d.x;
    const speed = Math.abs(dx) / Math.max(1, performance.now() - d.t);
    // Le doigt levé sur la photo ne doit pas ouvrir le profil.
    swiped.current = true;
    window.setTimeout(() => (swiped.current = false), 60);
    el.style.transition = "";
    if (Math.abs(dx) > 100 || (Math.abs(dx) > 40 && speed > 0.5)) {
      const right = dx > 0;
      el.style.transform = `translateX(${right ? 130 : -130}%) rotate(${right ? 14 : -14}deg)`;
      el.style.opacity = "0";
      void act(right ? "interest" : "pass").then((done) => {
        if (!done) resetCard(el);
      });
    } else {
      resetCard(el);
    }
  }
  function onCardCancel(e: React.PointerEvent<HTMLElement>) {
    if (drag.current?.active) resetCard(e.currentTarget);
    drag.current = null;
  }

  function openSuper() {
    if (!current || !data) return;
    if (data.quota.supers.limit === 0) return setPaywall("Le super-intérêt, avec message, est réservé aux membres Premium.");
    if (data.quota.supers.used >= data.quota.supers.limit) return setPaywall("Tu as utilisé tous tes super-intérêts du jour.");
    setSuperFor(current);
  }

  if (!me) return null;
  const q = data?.quota;
  const activeFilters = [filters.country, filters.practice !== null, filters.verifiedOnly, filters.noChildren, filters.ageMin > 18 || filters.ageMax < 80, filters.sort !== "compat"].filter(Boolean).length;

  return (
    <div className="page discover">
      <div className="page-head">
        <div>
          <h2>Tes profils compatibles</h2>
          <p className="muted small">{data ? (data.exhausted ? "Limite quotidienne atteinte" : `${data.items.length} profils correspondent à tes critères, triés par compatibilité.`) : "Chargement…"}</p>
        </div>
        <div className="head-actions">
          {q && q.plan === "free" && (
            <span className="quota-pill" title="Offre gratuite">
              <Heart size={14} /> {Math.max(0, q.interests.limit - q.interests.used)}/{q.interests.limit} intérêts aujourd&apos;hui
            </span>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal size={16} /> Filtres{activeFilters > 0 && <span className="count-dot" style={{ background: "var(--primary)" }}>{activeFilters}</span>}
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="discover-grid">
          <Skeleton h={560} r={24} />
          <Skeleton h={560} r={24} />
        </div>
      ) : data?.exhausted ? (
        <div className="panel">
          <Empty icon={Sparkles} title="C'est tout pour aujourd'hui" text={`L'offre gratuite propose ${q?.views.limit} profils par jour, pour privilégier la qualité. Reviens demain, ou passe Premium pour des recommandations illimitées.`}>
            <Link href="/subscription" className="btn btn-gold">
              <Crown size={16} /> Découvrir Premium
            </Link>
          </Empty>
        </div>
      ) : !current ? (
        <div className="panel">
          <Empty icon={Heart} title="Tu as vu tous les profils compatibles" text="De nouveaux membres s'inscrivent chaque jour. Tu peux aussi élargir tes filtres ou tes critères de recherche.">
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {activeFilters > 0 && (
                <button type="button" className="btn btn-primary" onClick={() => applyFilters(api.DEFAULT_FILTERS)}>
                  Réinitialiser les filtres
                </button>
              )}
              <Link href="/profile" className="btn btn-outline">
                Modifier mes critères
              </Link>
            </div>
          </Empty>
        </div>
      ) : (
        <div className="discover-grid">
          <article
            key={current.profile.id}
            className={`d-card${leaving?.id === current.profile.id ? ` leave-${leaving.dir}` : ""}`}
            onPointerDown={onCardDown}
            onPointerMove={onCardMove}
            onPointerUp={onCardUp}
            onPointerCancel={onCardCancel}
            onClickCapture={(e) => {
              if (swiped.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <span className="d-stamp like" aria-hidden="true">
              Intéressé(e)
            </span>
            <span className="d-stamp nope" aria-hidden="true">
              Passer
            </span>
            <Link href={`/profile/${current.profile.id}`} className="d-photo-link" aria-label={`Voir le profil de ${current.profile.firstName}`}>
              <ProfilePhoto profile={current.profile} locked={current.photoLocked} className="d-photo" />
              <div className="d-badges">
                {current.boosted && (
                  <span className="badge badge-dark">
                    <Rocket size={12} /> Mis en avant
                  </span>
                )}
                {current.online && <span className="badge badge-dark"><span className="online-dot" /> En ligne</span>}
              </div>
            </Link>
            <div className="d-actions">
              <button type="button" className="round-btn pass" onClick={() => act("pass")} aria-label="Passer" title="Passer (flèche gauche)">
                <X size={26} />
              </button>
              <button type="button" className="round-btn super" onClick={openSuper} aria-label="Super-intérêt" title="Super-intérêt avec message">
                <Star size={22} />
              </button>
              <button type="button" className="round-btn like" onClick={() => act("interest")} aria-label="Je suis intéressé(e)" title="Intéressé(e) (flèche droite)">
                <Heart size={26} fill="currentColor" />
              </button>
            </div>
            <div className="d-info">
              <div className="d-name">
                <h3>
                  {current.profile.firstName}, {current.profile.age}
                </h3>
                <Verified profile={current.profile} />
                <PremiumBadge plan={current.profile.plan} />
              </div>
              <div className="d-meta">
                <span>
                  <MapPin size={14} /> {current.profile.city}, {current.profile.country}
                </span>
                <span>
                  <Briefcase size={14} /> {current.profile.profession}
                </span>
              </div>
              <div className="d-tags">
                <span className="badge badge-green">{religionLine(current.profile)}</span>
                <span className="badge badge-gray">{practiceLabel(current.profile)}</span>
                <span className="badge badge-gray">{current.profile.intention === "mariage" ? "💍 Mariage" : "🤝 Relation sérieuse"}</span>
              </div>
              <p className="d-bio">{current.profile.bio}</p>
              <p className="swipe-hint">↔ Glisse la carte : à droite pour t&apos;intéresser, à gauche pour passer</p>
            </div>
          </article>

          <aside className="d-compat panel panel-pad">
            <div className="d-score">
              <ScoreRing score={current.compat.score} size={104} stroke={9} />
              <div>
                <b>{current.compat.label}</b>
                <p className="muted tiny">Calculée sur 8 dimensions : religion, valeurs, couple, famille, enfants, finances, mode de vie et distance.</p>
              </div>
            </div>
            <div className="divider" />
            {premium ? (
              <CategoryBars categories={current.compat.categories} />
            ) : (
              <div className="locked-bars">
                <CategoryBars categories={current.compat.categories} />
                <Link href="/subscription" className="locked-over">
                  <Lock size={16} /> Détail par domaine avec Premium
                </Link>
              </div>
            )}
            <div className="divider" />
            <CompatPoints compat={current.compat} />
            <Link href={`/profile/${current.profile.id}`} className="btn btn-outline btn-block" style={{ marginTop: 18 }}>
              Voir le profil complet
            </Link>
            <p className="tiny muted kbd-hint">Astuce : flèche ← pour passer, → pour manifester ton intérêt.</p>
          </aside>
        </div>
      )}

      <FiltersModal open={showFilters} onClose={() => setShowFilters(false)} value={filters} premium={!!premium} onApply={applyFilters} onPaywall={(r) => setPaywall(r)} />
      <PaywallModal open={!!paywall} onClose={() => setPaywall(null)} reason={paywall ?? ""} />
      {superFor && (
        <SuperInterestModal
          profile={superFor.profile}
          open
          onClose={() => setSuperFor(null)}
          onSent={(matchId) => {
            const card = superFor;
            setSuperFor(null);
            if (matchId) setMatched({ card, matchId });
            else toast({ title: `Super-intérêt envoyé ⭐`, body: `${card.profile.firstName} verra ton message en priorité.`, kind: "interest" });
          }}
        />
      )}
      {matched && <MatchModal me={me} other={matched.card.profile} matchId={matched.matchId} onClose={() => setMatched(null)} />}
    </div>
  );
}

function FiltersModal({
  open,
  onClose,
  value,
  premium,
  onApply,
  onPaywall,
}: {
  open: boolean;
  onClose: () => void;
  value: DiscoverFilters;
  premium: boolean;
  onApply: (f: DiscoverFilters) => void;
  onPaywall: (reason: string) => void;
}) {
  const [f, setF] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setF(value);
  }
  const ages = Array.from({ length: 63 }, (_, i) => 18 + i);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filtrer les profils"
      description="Ces filtres s'ajoutent à tes critères de recherche."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={() => onApply(api.DEFAULT_FILTERS)}>
            Réinitialiser
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onApply(f)}>
            Appliquer
          </button>
        </>
      }
    >
      <div className="row-label" style={{ marginTop: 0 }}>
        Trier par
      </div>
      <div className="chip-row">
        {(
          [
            ["compat", "Compatibilité"],
            ["recent", "Activité récente"],
            ["distance", "Proximité"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" className={`chip${f.sort === k ? " sel" : ""}`} onClick={() => setF({ ...f, sort: k })}>
            {label}
          </button>
        ))}
      </div>
      <div className="form-grid" style={{ marginTop: 16 }}>
        <div className="field">
          <label htmlFor="fAgeMin">Âge minimum</label>
          <select id="fAgeMin" value={f.ageMin} onChange={(e) => setF({ ...f, ageMin: Number(e.target.value) })}>
            {ages.map((a) => (
              <option key={a} value={a}>
                {a} ans
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fAgeMax">Âge maximum</label>
          <select id="fAgeMax" value={f.ageMax} onChange={(e) => setF({ ...f, ageMax: Number(e.target.value) })}>
            {ages.map((a) => (
              <option key={a} value={a}>
                {a} ans
              </option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="fCountry">Pays</label>
          <select id="fCountry" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}>
            <option value="">Tous les pays</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row-label">Niveau de pratique</div>
      <div className="chip-row">
        <button type="button" className={`chip${f.practice === null ? " sel" : ""}`} onClick={() => setF({ ...f, practice: null })}>
          Tous
        </button>
        {PRACTICE_LEVELS.map((label, i) => (
          <button key={label} type="button" className={`chip${f.practice === i ? " sel" : ""}`} onClick={() => setF({ ...f, practice: i })}>
            {label}
          </button>
        ))}
      </div>
      <div className="filter-switches">
        <label className="switch-row">
          <span>Sans enfant</span>
          <span className="switch">
            <input type="checkbox" checked={f.noChildren} onChange={(e) => setF({ ...f, noChildren: e.target.checked })} />
            <span />
          </span>
        </label>
        <label className="switch-row">
          <span>
            Profils vérifiés uniquement <span className="badge badge-gold" style={{ marginLeft: 6 }}><Crown size={11} /> Premium</span>
          </span>
          <span className="switch">
            <input
              type="checkbox"
              checked={f.verifiedOnly}
              onChange={(e) => {
                if (!premium) return onPaywall("Le filtre « profils vérifiés uniquement » fait partie de l'offre Premium.");
                setF({ ...f, verifiedOnly: e.target.checked });
              }}
            />
            <span />
          </span>
        </label>
      </div>
    </Modal>
  );
}
