/** Swatches users can pick for countdowns and habits (muted, to suit the palette). */
export const SWATCHES = [
  '#2F4F40', '#4A6B8A', '#8A5A44', '#B5873A', '#7A5C8E',
  '#A8554B', '#3F7C7A', '#5F6B4E', '#6B6660', '#22201D',
];

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  /** Deep green: primary buttons, hero cards, selected states. */
  accent: string;
  accentText: string;
  accentSoft: string;
  /** Near-black "ink" used for strong selected pills. */
  ink: string;
  inkText: string;
  flame: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  tabBar: string;
  overlay: string;
  shadow: string;
  /** The "Next" tag. */
  tag: string;
  tagText: string;
  /** Top-of-screen glow: three gradient stops, fading into the background. */
  glow: [string, string, string];
  glowOpacity: number;
  /** Dot texture colour and strength over the glow. */
  dots: string;
  dotsOpacity: number;
}

export const light: ThemeColors = {
  bg: '#F8F7F3',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EFE9',
  border: '#E5E3DB',
  text: '#1E1C19',
  textMuted: '#6F6C66',
  textFaint: '#ABA8A0',
  accent: '#2F4F40',
  accentText: '#FFFFFF',
  accentSoft: '#E8EEEA',
  ink: '#1E1C19',
  inkText: '#FFFFFF',
  flame: '#C8553D',
  danger: '#B4513E',
  dangerSoft: '#F6E4DF',
  success: '#3C7A5C',
  successSoft: '#E1EEE7',
  warning: '#A97B2F',
  warningSoft: '#F5ECD8',
  tabBar: 'rgba(251,250,247,0.8)',
  overlay: 'rgba(30,28,25,0.4)',
  shadow: 'rgba(30,28,25,0.07)',
  tag: '#2F4F40',
  tagText: '#FFFFFF',
  // Day: a whisper of green and faint dots, so the calm look stays calm.
  glow: ['#B9CFC2', '#DCE6DF', '#F8F7F3'],
  glowOpacity: 0.55,
  dots: '#2F4F40',
  dotsOpacity: 0.09,
};

export type NightColor = 'forest' | 'ember' | 'electric' | 'violet' | 'mono';

/** Night-mode colour choices: glow stops plus a bright accent that reads on black. */
export const NIGHT_COLORS: Record<NightColor, { label: string; glow: [string, string, string]; accent: string; accentText: string; swatch: [string, string] }> = {
  forest: { label: 'Forest', glow: ['#2F8A5F', '#155537', '#07170F'], accent: '#4FCB8C', accentText: '#04140B', swatch: ['#2F8A5F', '#06140D'] },
  ember: { label: 'Ember', glow: ['#FF3B1F', '#B5140C', '#2C0503'], accent: '#FF6A4D', accentText: '#FFFFFF', swatch: ['#FF3B1F', '#3A0604'] },
  electric: { label: 'Electric', glow: ['#4F6BFF', '#2433E6', '#0B0F55'], accent: '#7B91FF', accentText: '#FFFFFF', swatch: ['#4F6BFF', '#0B0F55'] },
  violet: { label: 'Violet', glow: ['#A35BFF', '#6A22D6', '#24074F'], accent: '#B98AFF', accentText: '#14052E', swatch: ['#A35BFF', '#24074F'] },
  mono: { label: 'Mono', glow: ['#8A8A8A', '#3A3A3A', '#141414'], accent: '#EDEDED', accentText: '#0B0B0B', swatch: ['#9A9A9A', '#141414'] },
};

/** Night mode: true black, dark cards, and the chosen glow colour. */
export function darkFor(choice: NightColor): ThemeColors {
  const n = NIGHT_COLORS[choice] ?? NIGHT_COLORS.forest;
  return {
    bg: '#050505',
    surface: '#141414',
    surfaceAlt: '#1F1F1F',
    border: '#262626',
    text: '#F4F3EE',
    textMuted: 'rgba(244,243,238,0.62)',
    textFaint: 'rgba(244,243,238,0.36)',
    accent: n.accent,
    accentText: n.accentText,
    accentSoft: hexAlpha(n.accent, 0.22),
    ink: '#F4F3EE',
    inkText: '#050505',
    flame: '#FF8A5C',
    danger: '#FF7A66',
    dangerSoft: '#2A1210',
    // "Done" follows the chosen night colour instead of always being green.
    success: n.accent,
    successSoft: hexAlpha(n.accent, 0.18),
    warning: '#F2C14E',
    warningSoft: '#2A2210',
    tabBar: 'rgba(30,30,30,0.78)',
    overlay: 'rgba(0,0,0,0.65)',
    shadow: 'rgba(0,0,0,0.5)',
    tag: '#C8FF3D',
    tagText: '#0B0B0B',
    glow: n.glow,
    glowOpacity: 1,
    dots: '#FFFFFF',
    dotsOpacity: 0.2,
  };
}

/** '#RRGGBB' + alpha → rgba(). */
export function hexAlpha(hex: string, a: number) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

export const dark = darkFor('forest');

// ---------- Night-mode colour boost ----------

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, s, l];
}

function hslToHex(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

/** The default item colour; at night it follows the chosen night colour. */
export const DEFAULT_ITEM_COLOR = '#2F4F40';

/**
 * Night mode: make an item colour (habit, goal, countdown) vivid enough for a
 * black background. 'line' = rings, dots, text; 'fill' = big coloured cards.
 */
export function vivid(hex: string, mode: 'line' | 'fill', accent: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const base = hex.toLowerCase() === DEFAULT_ITEM_COLOR.toLowerCase() ? accent : hex;
  const [h, s, l] = hexToHsl(base);
  if (s < 0.12) return hslToHex(h, s, mode === 'line' ? Math.max(l, 0.74) : Math.min(Math.max(l, 0.28), 0.36));
  const sat = Math.min(0.95, s * 1.8 + 0.15);
  return hslToHex(h, sat, mode === 'line' ? 0.62 : 0.46);
}
