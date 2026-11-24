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

/**
 * App colour choices. Each has the night glow, and a UI colour ("accent") for
 * buttons, the timer ring, the active tab and checkmarks: the chosen colour
 * made just a little darker, never a different shade. Day mode gets a deeper
 * accent and a faint tint of the same colour.
 */
export const NIGHT_COLORS: Record<
  NightColor,
  { label: string; glow: [string, string, string]; accent: string; accentText: string; swatch: [string, string]; day: { accent: string; glow: [string, string] } }
> = {
  forest: { label: 'Forest', glow: ['#2F8A5F', '#155537', '#07170F'], accent: '#287A53', accentText: '#FFFFFF', swatch: ['#2F8A5F', '#06140D'], day: { accent: '#2F4F40', glow: ['#B9CFC2', '#DCE6DF'] } },
  ember: { label: 'Ember', glow: ['#FF3B1F', '#B5140C', '#2C0503'], accent: '#E0301A', accentText: '#FFFFFF', swatch: ['#FF3B1F', '#3A0604'], day: { accent: '#C42B18', glow: ['#F5C4BB', '#F9E2DD'] } },
  electric: { label: 'Electric', glow: ['#4F6BFF', '#2433E6', '#0B0F55'], accent: '#3F5BF0', accentText: '#FFFFFF', swatch: ['#4F6BFF', '#0B0F55'], day: { accent: '#2B3FD6', glow: ['#C6CEF9', '#E3E7FB'] } },
  violet: { label: 'Violet', glow: ['#A35BFF', '#6A22D6', '#24074F'], accent: '#9246F2', accentText: '#FFFFFF', swatch: ['#A35BFF', '#24074F'], day: { accent: '#7A30D9', glow: ['#DCC9F8', '#EEE4FB'] } },
  mono: { label: 'Mono', glow: ['#8A8A8A', '#3A3A3A', '#141414'], accent: '#C8C8C8', accentText: '#0B0B0B', swatch: ['#9A9A9A', '#141414'], day: { accent: '#1E1C19', glow: ['#D9D7D2', '#EBE9E4'] } },
};

export type DayBackground = 'paper' | 'linen' | 'sand';
export type NightBackground = 'black' | 'matte';

/** Day backgrounds: from bright paper to a soft beige that's easier on the eyes. */
export const DAY_BACKGROUNDS: Record<DayBackground, { label: string; bg: string; surface: string; surfaceAlt: string; border: string }> = {
  paper: { label: 'Paper', bg: '#F8F7F3', surface: '#FFFFFF', surfaceAlt: '#F0EFE9', border: '#E5E3DB' },
  linen: { label: 'Linen', bg: '#F3EFE7', surface: '#FCFAF6', surfaceAlt: '#EAE5DA', border: '#E0D9CC' },
  sand: { label: 'Sand', bg: '#EDE6D8', surface: '#F8F4EC', surfaceAlt: '#E3DACA', border: '#D9CFBC' },
};

/** Night backgrounds: true black, or a softer matte black. */
export const NIGHT_BACKGROUNDS: Record<NightBackground, { label: string; bg: string; surface: string; surfaceAlt: string; border: string; tabBar: string }> = {
  black: { label: 'Black', bg: '#050505', surface: '#141414', surfaceAlt: '#1F1F1F', border: '#262626', tabBar: 'rgba(30,30,30,0.78)' },
  matte: { label: 'Matte', bg: '#161616', surface: '#212121', surfaceAlt: '#2B2B2B', border: '#343434', tabBar: 'rgba(42,42,42,0.8)' },
};

// ---------- Custom colour ----------

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, sat, l];
}

export function hslToHex(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0')).join('');
}

/** Build a full app colour (glow, accents, day tint) from any colour. */
export function customColor(hex: string) {
  const [h, s] = hexToHsl(/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#2F8A5F');
  const grey = s < 0.1;
  const sat = grey ? 0 : Math.max(0.45, s);
  const nightAccentL = grey ? 0.78 : 0.48;
  return {
    label: 'Custom',
    glow: [hslToHex(h, sat, 0.5), hslToHex(h, sat, 0.32), hslToHex(h, sat, 0.09)] as [string, string, string],
    accent: hslToHex(h, sat, nightAccentL),
    accentText: grey ? '#0B0B0B' : '#FFFFFF',
    swatch: [hslToHex(h, sat, 0.5), hslToHex(h, sat, 0.1)] as [string, string],
    day: { accent: hslToHex(h, sat, grey ? 0.12 : 0.36), glow: [hslToHex(h, sat * 0.6, 0.82), hslToHex(h, sat * 0.5, 0.91)] as [string, string] },
  };
}

function colorFor(choice: string, custom?: string) {
  if (choice === 'custom') return customColor(custom ?? '#2F8A5F');
  return NIGHT_COLORS[choice as NightColor] ?? NIGHT_COLORS.forest;
}

/** Day mode with the chosen app colour and background. */
export function lightFor(choice: string, custom?: string, bgChoice: DayBackground = 'paper'): ThemeColors {
  const d = colorFor(choice, custom).day;
  const b = DAY_BACKGROUNDS[bgChoice] ?? DAY_BACKGROUNDS.paper;
  return {
    ...light,
    bg: b.bg,
    surface: b.surface,
    surfaceAlt: b.surfaceAlt,
    border: b.border,
    tabBar: hexAlpha(b.surface, 0.82),
    accent: d.accent,
    accentSoft: hexAlpha(d.accent, 0.12),
    success: d.accent,
    successSoft: hexAlpha(d.accent, 0.12),
    tag: d.accent,
    glow: [d.glow[0], d.glow[1], b.bg],
    dots: d.accent,
  };
}

/** Night mode: dark background, dark cards, and the chosen glow colour. */
export function darkFor(choice: string, custom?: string, bgChoice: NightBackground = 'black'): ThemeColors {
  const n = colorFor(choice, custom);
  const b = NIGHT_BACKGROUNDS[bgChoice] ?? NIGHT_BACKGROUNDS.black;
  return {
    bg: b.bg,
    surface: b.surface,
    surfaceAlt: b.surfaceAlt,
    border: b.border,
    text: '#F4F3EE',
    textMuted: 'rgba(244,243,238,0.62)',
    textFaint: 'rgba(244,243,238,0.36)',
    accent: n.accent,
    accentText: n.accentText,
    accentSoft: hexAlpha(n.accent, 0.22),
    ink: '#F4F3EE',
    inkText: b.bg,
    flame: '#FF8A5C',
    danger: '#FF7A66',
    dangerSoft: '#2A1210',
    // "Done" follows the chosen colour instead of always being green.
    success: n.accent,
    successSoft: hexAlpha(n.accent, 0.18),
    warning: '#F2C14E',
    warningSoft: '#2A2210',
    tabBar: b.tabBar,
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

/** The default item colour; at night it follows the chosen night colour. */
export const DEFAULT_ITEM_COLOR = '#2F4F40';

/** Item colours keep their own colour; the default one follows the app colour. */
export function itemColor(hex: string, accent: string) {
  return hex.toLowerCase() === DEFAULT_ITEM_COLOR.toLowerCase() ? accent : hex;
}
