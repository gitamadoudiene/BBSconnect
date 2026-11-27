/**
 * Colour families for the shop filter. Variant names are marketing names
 * ("Orange cosmique", "Bleu Sierra", "Minuit"…), so the family is read from
 * the swatch's hex code instead.
 */
export const COLOR_FAMILIES = [
  { id: "noir", label: "Noir", swatch: "#1c1c1e" },
  { id: "blanc", label: "Blanc", swatch: "#f2f2f0" },
  { id: "gris", label: "Gris & argent", swatch: "#a9acb2" },
  { id: "bleu", label: "Bleu", swatch: "#3c5a8c" },
  { id: "vert", label: "Vert", swatch: "#6f8f74" },
  { id: "violet", label: "Violet", swatch: "#8a76b0" },
  { id: "rose", label: "Rose", swatch: "#e7b8c2" },
  { id: "rouge", label: "Rouge", swatch: "#b23b3b" },
  { id: "orange", label: "Orange", swatch: "#d9672c" },
  { id: "jaune", label: "Jaune", swatch: "#e8d272" },
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number]["id"];

/** Words in a colour name, checked in this order (so "Titane bleu" is blue). */
const NAME_RULES: [RegExp, ColorFamily][] = [
  [/rose|pink/, "rose"],
  [/rouge|red\b|\(product\)/, "rouge"],
  [/orange|corail/, "orange"],
  [/jaune|citron|yellow|\bor\b|dor[ée]|gold/, "jaune"],
  [/vert|sauge|menthe|green/, "vert"],
  [/violet|lavande|mauve|purple/, "violet"],
  [/bleu|blue|sierra|azur/, "bleu"],
  [/blanc|white|nuage|lumi[eè]re stellaire/, "blanc"],
  [/noir|black|minuit|obsidienne|jais/, "noir"],
  [/gris|argent|silver|graphite|titane|transparent/, "gris"],
];

export function colorFamily(hex: string, name?: string): ColorFamily {
  if (name) {
    const n = name.toLowerCase();
    for (const [re, family] of NAME_RULES) if (re.test(n)) return family;
  }
  return familyFromHex(hex);
}

function familyFromHex(hex: string): ColorFamily {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "gris";
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;

  if (l < 0.2) return "noir";
  if (l > 0.88 && s < 0.35) return "blanc";
  if (s < 0.18) return l > 0.62 ? (l > 0.84 ? "blanc" : "gris") : l < 0.26 ? "noir" : "gris";
  if (h < 15 || h >= 345) return l > 0.7 ? "rose" : "rouge";
  if (h < 40) return "orange";
  if (h < 70) return "jaune";
  if (h < 170) return "vert";
  if (h < 245) return "bleu";
  if (h < 290) return "violet";
  return "rose";
}
