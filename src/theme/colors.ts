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

/** Day mode with the chosen app colour. */
export function lightFor(choice: NightColor): ThemeColors {
  const d = (NIGHT_COLORS[choice] ?? NIGHT_COLORS.forest).day;
  return {
    ...light,
    accent: d.accent,
    accentSoft: hexAlpha(d.accent, 0.12),
    success: d.accent,
    successSoft: hexAlpha(d.accent, 0.12),
    tag: d.accent,
    glow: [d.glow[0], d.glow[1], light.bg],
    dots: d.accent,
  };
}

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

/** The default item colour; at night it follows the chosen night colour. */
export const DEFAULT_ITEM_COLOR = '#2F4F40';

/** Item colours keep their own colour; the default one follows the app colour. */
export function itemColor(hex: string, accent: string) {
  return hex.toLowerCase() === DEFAULT_ITEM_COLOR.toLowerCase() ? accent : hex;
}
