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
};

export const dark: ThemeColors = {
  bg: '#121412',
  surface: '#1B1E1B',
  surfaceAlt: '#262A26',
  border: '#323732',
  text: '#F2F1EC',
  textMuted: '#A5A8A1',
  textFaint: '#6C706A',
  accent: '#4C8369',
  accentText: '#FFFFFF',
  accentSoft: '#22302A',
  ink: '#F2F1EC',
  inkText: '#121412',
  flame: '#E07A60',
  danger: '#D9705C',
  dangerSoft: '#3A211C',
  success: '#6CB590',
  successSoft: '#1D2E26',
  warning: '#D2A251',
  warningSoft: '#33290F',
  tabBar: 'rgba(30,33,30,0.78)',
  overlay: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(0,0,0,0.35)',
};
