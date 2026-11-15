export const palette = {
  ember: '#E8613C',
  emberSoft: '#F4A487',
  gold: '#D9A441',
  sage: '#6E9F7F',
  sky: '#5B8DEF',
  plum: '#8E6BBF',
  rose: '#D9677F',
  slate: '#6B7280',
  ink: '#14120F',
  paper: '#F7F5F0',
};

/** Swatches users can pick for countdowns and habits. */
export const SWATCHES = [
  '#E8613C', '#D9A441', '#6E9F7F', '#3FA3A0', '#5B8DEF',
  '#8E6BBF', '#D9677F', '#B5835A', '#6B7280', '#2F3A4A',
];

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  tabBar: string;
  overlay: string;
}

export const light: ThemeColors = {
  bg: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceAlt: '#EFECE5',
  border: '#E4E0D7',
  text: '#14120F',
  textMuted: '#6B665D',
  textFaint: '#A39E94',
  accent: '#E8613C',
  accentText: '#FFFFFF',
  accentSoft: '#FBE5DC',
  danger: '#C8442F',
  dangerSoft: '#F9DED8',
  success: '#3E8B5F',
  successSoft: '#DDEFE3',
  warning: '#B7801F',
  warningSoft: '#F6EACD',
  tabBar: '#FFFFFF',
  overlay: 'rgba(20,18,15,0.45)',
};

export const dark: ThemeColors = {
  bg: '#14120F',
  surface: '#1E1B17',
  surfaceAlt: '#29251F',
  border: '#34302A',
  text: '#F4F1EA',
  textMuted: '#A8A296',
  textFaint: '#6E695F',
  accent: '#F06C46',
  accentText: '#FFFFFF',
  accentSoft: '#3A2219',
  danger: '#F0705A',
  dangerSoft: '#3B1E19',
  success: '#6CC08D',
  successSoft: '#1B3024',
  warning: '#E4B24D',
  warningSoft: '#352A14',
  tabBar: '#1A1714',
  overlay: 'rgba(0,0,0,0.6)',
};
