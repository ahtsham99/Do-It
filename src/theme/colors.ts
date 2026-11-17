export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  /** Brass: primary buttons, selected states, links. */
  accent: string;
  accentText: string;
  accentSoft: string;
  /** Near-black "ink" for strong pills and the hero card. */
  ink: string;
  inkText: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  /** Calendar blocks */
  booking: string;
  bookingText: string;
  walkIn: string;
  blocked: string;
  tabBar: string;
  overlay: string;
  shadow: string;
}

export const light: ThemeColors = {
  bg: '#F6F4EF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEEBE4',
  border: '#E2DED5',
  text: '#16150F',
  textMuted: '#6B675E',
  textFaint: '#A7A297',
  accent: '#8C6A3A',
  accentText: '#FFFFFF',
  accentSoft: '#F1E8DA',
  ink: '#16150F',
  inkText: '#F6F4EF',
  danger: '#A9483A',
  dangerSoft: '#F5E2DE',
  success: '#3D7356',
  successSoft: '#E0EDE5',
  warning: '#9C7124',
  warningSoft: '#F4EAD3',
  booking: '#16150F',
  bookingText: '#F6F4EF',
  walkIn: '#8C6A3A',
  blocked: '#E7E3DA',
  tabBar: 'rgba(250,249,246,0.82)',
  overlay: 'rgba(22,21,15,0.45)',
  shadow: 'rgba(22,21,15,0.07)',
};

export const dark: ThemeColors = {
  bg: '#0E0E0D',
  surface: '#181816',
  surfaceAlt: '#23221F',
  border: '#2F2E2A',
  text: '#F1EEE7',
  textMuted: '#A29E94',
  textFaint: '#67645D',
  accent: '#C9A36B',
  accentText: '#14120D',
  accentSoft: '#2B251B',
  ink: '#F1EEE7',
  inkText: '#0E0E0D',
  danger: '#D9725F',
  dangerSoft: '#3A211C',
  success: '#6DB28C',
  successSoft: '#1B2B22',
  warning: '#D6A853',
  warningSoft: '#33290F',
  booking: '#F1EEE7',
  bookingText: '#0E0E0D',
  walkIn: '#C9A36B',
  blocked: '#262522',
  tabBar: 'rgba(28,28,26,0.8)',
  overlay: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(0,0,0,0.4)',
};
