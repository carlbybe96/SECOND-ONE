"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { APP } from "@/lib/config";

type InstallEvent = Event & { prompt: () => Promise<void> };
type Mode = "hidden" | "ios" | "other";

const KEY = "fm_install_dismissed";
const CHANGE = "fm-install-change";

function detect(): Mode {
  try {
    if (window.localStorage.getItem(KEY)) return "hidden";
  } catch {
    // stockage indisponible : on affiche quand même l'invitation
  }
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "hidden";
  // Téléphones et tablettes uniquement : sur ordinateur, l'invitation n'a pas de sens.
  if (!window.matchMedia("(pointer: coarse)").matches || window.innerWidth >= 1024) return "hidden";
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "other";
}

function subscribe(notify: () => void) {
  window.addEventListener(CHANGE, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CHANGE, notify);
    window.removeEventListener("storage", notify);
  };
}

function dismiss() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // pas grave : l'invitation réapparaîtra à la prochaine visite
  }
  window.dispatchEvent(new Event(CHANGE));
}

/** Invite à ajouter l'app à l'écran d'accueil (le manifest la fait s'ouvrir en plein écran, comme une vraie application). */
export default function InstallHint() {
  const mode = useSyncExternalStore(subscribe, detect, () => "hidden" as Mode);
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", dismiss);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", dismiss);
    };
  }, []);

  if (mode === "hidden") return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    setPrompt(null);
  }

  return (
    <div className="panel install-hint">
      <span className="ih-ico">
        <Smartphone size={20} />
      </span>
      <div className="ih-txt">
        <b>Installe {APP.name} sur ton téléphone</b>
        {prompt ? (
          <span>Accès direct depuis l&apos;écran d&apos;accueil, en plein écran, comme une vraie application.</span>
        ) : mode === "ios" ? (
          <span>Touche le bouton « Partager » du navigateur, puis « Sur l&apos;écran d&apos;accueil ».</span>
        ) : (
          <span>Ouvre le menu du navigateur (les trois points), puis « Ajouter à l&apos;écran d&apos;accueil ».</span>
        )}
        {prompt && (
          <button type="button" className="btn btn-primary btn-sm" onClick={install}>
            <Download size={16} /> Installer
          </button>
        )}
      </div>
      <button type="button" className="icon-btn plain ih-close" onClick={dismiss} aria-label="Masquer cette invitation">
        <X size={18} />
      </button>
    </div>
  );
}
