import type { AvatarSpec, Gender } from "./types";

/**
 * Portraits illustrés (SVG) pour les profils sans photo.
 * Les profils de démonstration n'utilisent jamais de vraies photos de personnes :
 * un visage réel associé à un faux profil de rencontre serait trompeur.
 */

export const SKINS = ["#8D5A3B", "#7B4A2C", "#6A3E25", "#A56B45", "#5B3421", "#B98055", "#4B2A18"];
export const BGS = ["#DDF3EA", "#F4E6D3", "#E0EAF6", "#F6E0DC", "#E9E3F4", "#FAF0CE", "#E3F0E0"];
export const OUTFITS = ["#0E7C66", "#1F4E79", "#8C2F39", "#C47F0A", "#5B3E96", "#2D6A4F", "#B5485D", "#264653", "#D1603D", "#6D597A", "#3A7CA5", "#A61E4D"];
export const WRAPS = ["#1F3B4D", "#6B2737", "#2F5D50", "#B08A63", "#5E4B8B", "#B0413E", "#374151", "#C98B8B", "#D08C1E", "#1E7B4F"];
const HAIR = "#1C1512";

function hex(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");
}

/** amt < 0 assombrit, amt > 0 éclaircit (mélange avec noir / blanc). */
export function shade(color: string, amt: number) {
  const c = color.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return `#${hex(r + (t - r) * p)}${hex(g + (t - g) * p)}${hex(b + (t - b) * p)}`;
}

const pick = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length];

export function avatarSvg(spec: AvatarSpec, gender: Gender): string {
  const skin = pick(SKINS, spec.skin);
  const skinShade = shade(skin, -0.18);
  const bg = pick(BGS, spec.bg);
  const outfit = pick(OUTFITS, spec.outfit);
  const wrap = pick(WRAPS, spec.wrap ?? spec.outfit);
  const wrapShade = shade(wrap, -0.22);
  const female = gender === "femme";
  const hijab = spec.headwear === "hijab";
  const parts: string[] = [];

  parts.push(`<rect width="200" height="200" fill="${bg}"/>`);
  parts.push(`<circle cx="100" cy="98" r="74" fill="${shade(bg, 0.45)}"/>`);

  /* Cheveux arrière (sous le visage) */
  if (!hijab && spec.headwear !== "foulard") {
    if (spec.hair === "tresses") {
      parts.push(
        `<path d="M62 92C58 60 76 44 100 44C124 44 142 60 138 92L143 160C137 168 126 166 122 157L119 122L81 122L78 157C74 166 63 168 57 160Z" fill="${HAIR}"/>`,
      );
      for (const x of [63, 70, 130, 137]) {
        parts.push(`<path d="M${x} 104L${x + (x < 100 ? -1 : 1)} 156" stroke="${shade(HAIR, 0.18)}" stroke-width="1.6" stroke-dasharray="3 3"/>`);
      }
    } else if (spec.hair === "lisse") {
      parts.push(`<path d="M60 96C56 58 76 42 100 42C124 42 144 58 140 96L147 168L53 168Z" fill="${HAIR}"/>`);
    } else if (spec.hair === "afro") {
      parts.push(`<ellipse cx="100" cy="${female ? 72 : 66}" rx="${female ? 50 : 42}" ry="${female ? 42 : 29}" fill="${HAIR}"/>`);
    } else if (spec.hair === "puff") {
      parts.push(`<circle cx="100" cy="40" r="23" fill="${HAIR}"/>`);
    } else if (spec.hair === "chignon") {
      parts.push(`<circle cx="100" cy="47" r="15" fill="${HAIR}"/>`);
    }
  }

  /* Buste */
  parts.push(`<path d="M24 200C26 166 52 146 100 146C148 146 174 166 176 200Z" fill="${outfit}"/>`);
  parts.push(`<path d="M88 118L88 146Q100 154 112 146L112 118Z" fill="${skinShade}"/>`);
  parts.push(`<path d="M87 146L100 163L113 146Z" fill="${skinShade}"/>`);
  if (female) {
    for (const [x, y] of [[48, 178], [70, 188], [132, 186], [152, 176], [60, 196], [140, 197]]) {
      parts.push(`<circle cx="${x}" cy="${y}" r="3.2" fill="${shade(outfit, 0.35)}"/>`);
    }
  } else {
    parts.push(`<path d="M84 147Q100 170 116 147" stroke="${shade(outfit, 0.4)}" stroke-width="2.4" fill="none"/>`);
    parts.push(`<path d="M100 166L100 196" stroke="${shade(outfit, 0.3)}" stroke-width="2" stroke-dasharray="2 5"/>`);
  }

  /* Voile : drapé derrière le visage */
  if (hijab) {
    parts.push(
      `<path d="M58 100C56 60 76 40 100 40C124 40 144 60 142 100C142 124 140 140 154 158C136 170 118 174 100 174C82 174 64 170 46 158C60 140 58 124 58 100Z" fill="${wrap}"/>`,
    );
  }

  /* Oreilles et visage */
  if (!hijab) {
    parts.push(`<ellipse cx="68.5" cy="95" rx="5.5" ry="9" fill="${skinShade}"/>`);
    parts.push(`<ellipse cx="131.5" cy="95" rx="5.5" ry="9" fill="${skinShade}"/>`);
  }
  parts.push(`<ellipse cx="100" cy="92" rx="32" ry="39" fill="${skin}"/>`);

  /* Coiffure / couvre-chef avant */
  if (hijab) {
    parts.push(`<path d="M68 86C70 63 84 54 100 54C116 54 130 63 132 86C125 72 114 66 100 66C86 66 75 72 68 86Z" fill="${wrapShade}"/>`);
    parts.push(`<path d="M69 106C72 128 86 139 100 139C114 139 128 128 131 106C134 132 121 148 100 150C79 148 66 132 69 106Z" fill="${wrap}"/>`);
  } else if (spec.headwear === "foulard") {
    parts.push(`<path d="M63 88C57 56 78 33 104 33C131 33 147 54 138 88C131 72 117 63 100 63C83 63 71 72 63 88Z" fill="${wrap}"/>`);
    parts.push(`<path d="M70 69Q100 50 132 69" stroke="${wrapShade}" stroke-width="3" fill="none" opacity=".6"/>`);
    parts.push(`<path d="M66 80Q100 60 136 80" stroke="${shade(wrap, 0.35)}" stroke-width="2" fill="none" opacity=".7"/>`);
    parts.push(`<path d="M98 37C86 21 70 25 74 38C78 47 92 43 100 39Z" fill="${wrapShade}"/>`);
    parts.push(`<path d="M102 37C114 21 131 25 127 38C123 47 109 43 101 39Z" fill="${wrapShade}"/>`);
  } else if (spec.headwear === "kufi") {
    const kufi = spec.wrap !== undefined ? wrap : "#F2EEE4";
    parts.push(`<path d="M71 72C71 55 84 47 100 47C116 47 129 55 129 72Z" fill="${kufi}"/>`);
    parts.push(`<path d="M71 71.5L129 71.5" stroke="${shade(kufi, -0.25)}" stroke-width="3"/>`);
    for (const x of [80, 90, 100, 110, 120]) parts.push(`<circle cx="${x}" cy="61" r="1.6" fill="${shade(kufi, -0.3)}"/>`);
  } else if (spec.hair !== "chauve") {
    const soft = spec.hair === "degrade";
    const d = female
      ? "M67 90C66 60 82 48 100 48C118 48 134 60 133 90C128 76 118 66 104 66C97 72 84 75 67 90Z"
      : soft
        ? "M69 82C69 62 82 52 100 52C118 52 131 62 131 82C127 72 118 66 100 66C82 66 73 72 69 82Z"
        : "M68 88C66 62 80 50 100 50C120 50 134 62 132 88C130 80 126 72 118 69C110 66 90 66 82 69C74 72 70 80 68 88Z";
    parts.push(`<path d="${d}" fill="${HAIR}"${soft ? ' opacity=".88"' : ""}/>`);
  } else {
    parts.push(`<ellipse cx="92" cy="62" rx="12" ry="5" fill="#fff" opacity=".08"/>`);
  }

  /* Barbe (avant la bouche) */
  if (spec.beard) {
    parts.push(
      `<path d="M68.5 96C69 118 82 134 100 134C118 134 131 118 131.5 96L127 98C126 110 120 120 112 123C108 119 92 119 88 123C80 120 74 110 73 98Z" fill="${HAIR}"/>`,
    );
    parts.push(`<path d="M89.5 112C94 108 106 108 110.5 112C106 110.8 94 110.8 89.5 112Z" fill="${HAIR}"/>`);
  }

  /* Traits du visage */
  const brow = female ? 2.1 : 2.7;
  parts.push(`<path d="M81.5 87.5Q88 84 94 86.5" stroke="${HAIR}" stroke-width="${brow}" stroke-linecap="round" fill="none"/>`);
  parts.push(`<path d="M106 86.5Q112 84 118.5 87.5" stroke="${HAIR}" stroke-width="${brow}" stroke-linecap="round" fill="none"/>`);
  for (const x of [88, 112]) {
    parts.push(`<ellipse cx="${x}" cy="96" rx="3.3" ry="3.9" fill="#1A1210"/>`);
    parts.push(`<circle cx="${x + 1.2}" cy="94.6" r="1" fill="#fff" opacity=".85"/>`);
  }
  parts.push(`<path d="M97.2 105.6Q100 108.6 102.8 105.6" stroke="${shade(skin, -0.32)}" stroke-width="1.9" stroke-linecap="round" fill="none"/>`);
  if (female) {
    parts.push(`<path d="M91 115.5Q95.5 113.2 100 114.6Q104.5 113.2 109 115.5Q100 123.5 91 115.5Z" fill="#8E3B34"/>`);
  } else {
    parts.push(
      `<path d="M91.5 115.5Q100 122 108.5 115.5" stroke="${spec.beard ? "#7A3A31" : "#4A1F1A"}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
    );
  }

  if (spec.glasses) {
    parts.push(`<circle cx="88" cy="96" r="8.2" stroke="#2B2522" stroke-width="2" fill="#fff" fill-opacity=".12"/>`);
    parts.push(`<circle cx="112" cy="96" r="8.2" stroke="#2B2522" stroke-width="2" fill="#fff" fill-opacity=".12"/>`);
    parts.push(`<path d="M96.2 95.5L103.8 95.5M79.8 94L70 91.5M120.2 94L130 91.5" stroke="#2B2522" stroke-width="2" stroke-linecap="round"/>`);
  }
  if (spec.earrings && !hijab) {
    parts.push(`<circle cx="68.5" cy="107" r="3.4" stroke="#D4A017" stroke-width="1.8" fill="none"/>`);
    parts.push(`<circle cx="131.5" cy="107" r="3.4" stroke="#D4A017" stroke-width="1.8" fill="none"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${parts.join("")}</svg>`;
}

const cache = new Map<string, string>();

export function avatarDataUrl(spec: AvatarSpec, gender: Gender): string {
  const key = `${gender}:${JSON.stringify(spec)}`;
  let url = cache.get(key);
  if (!url) {
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg(spec, gender))}`;
    cache.set(key, url);
  }
  return url;
}

/** Avatar par défaut, cohérent avec le genre et la religion déclarés. */
export function defaultAvatar(gender: Gender, seed: number, muslim: boolean): AvatarSpec {
  const r = (n: number) => Math.abs(Math.floor(Math.sin(seed * 9301 + n * 49297) * 10000));
  if (gender === "femme") {
    const hairs: AvatarSpec["hair"][] = ["tresses", "chignon", "puff", "lisse", "court", "afro"];
    const headwear = muslim ? (r(1) % 3 === 0 ? "foulard" : "hijab") : r(1) % 4 === 0 ? "foulard" : null;
    return { skin: r(2) % SKINS.length, bg: r(3) % BGS.length, outfit: r(4) % OUTFITS.length, wrap: r(5) % WRAPS.length, hair: hairs[r(6) % hairs.length], headwear, earrings: r(7) % 2 === 0, glasses: r(8) % 7 === 0 };
  }
  const hairs: AvatarSpec["hair"][] = ["court", "degrade", "chauve", "afro"];
  return {
    skin: r(2) % SKINS.length,
    bg: r(3) % BGS.length,
    outfit: r(4) % OUTFITS.length,
    hair: hairs[r(6) % hairs.length],
    headwear: muslim && r(1) % 3 === 0 ? "kufi" : null,
    beard: r(7) % 2 === 0,
    glasses: r(8) % 5 === 0,
  };
}
