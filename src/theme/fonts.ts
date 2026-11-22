/**
 * Font choices. Only the fonts in use are loaded at start-up; the Fonts screen
 * loads one face of each option so it can show live previews.
 *
 * Each face is imported from its own subpath so only that file is bundled
 * per weight (not every weight of every family).
 */
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif/400Regular';
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader/400Regular';
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader/500Medium';
import { Newsreader_600SemiBold } from '@expo-google-fonts/newsreader/600SemiBold';
import { SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4/600SemiBold';
import { SourceSerif4_700Bold } from '@expo-google-fonts/source-serif-4/700Bold';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display/500Medium';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { AtkinsonHyperlegible_400Regular } from '@expo-google-fonts/atkinson-hyperlegible/400Regular';
import { AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible/700Bold';

type Source = number | string;
type Face = { family: string; source: Source };

/** A single-weight face used for big headings and the logo. */
export interface DisplayFont {
  id: string;
  label: string;
  blurb: string;
  face: Face | null; // null = the device's own font
}

/** A body font, with one face per weight so bold text looks right everywhere. */
export interface TextFont {
  id: string;
  label: string;
  blurb: string;
  weights: Partial<Record<400 | 500 | 600 | 700, Face>> | null; // null = system
}

const f = (family: string, source: Source): Face => ({ family, source });

export const DISPLAY_FONTS: DisplayFont[] = [
  { id: 'newsreader', label: 'Classic', blurb: 'Bookish and warm', face: f('Newsreader_500Medium', Newsreader_500Medium) },
  { id: 'instrument', label: 'Editorial', blurb: 'Tall and refined', face: f('InstrumentSerif_400Regular', InstrumentSerif_400Regular) },
  { id: 'source-serif', label: 'Book', blurb: 'Clear and sturdy', face: f('SourceSerif4_600SemiBold', SourceSerif4_600SemiBold) },
  { id: 'fraunces', label: 'Soft', blurb: 'Round and friendly', face: f('Fraunces_500Medium', Fraunces_500Medium) },
  { id: 'playfair', label: 'Elegant', blurb: 'High contrast', face: f('PlayfairDisplay_500Medium', PlayfairDisplay_500Medium) },
  { id: 'dm-serif', label: 'Bold', blurb: 'Heavy and confident', face: f('DMSerifDisplay_400Regular', DMSerifDisplay_400Regular) },
  { id: 'inter', label: 'Modern', blurb: 'Clean sans-serif', face: f('Inter_600SemiBold', Inter_600SemiBold) },
  { id: 'system', label: 'System', blurb: 'Your phone’s font', face: null },
];

export const TEXT_FONTS: TextFont[] = [
  { id: 'system', label: 'System', blurb: 'Your phone’s font (San Francisco on iPhone)', weights: null },
  {
    id: 'inter',
    label: 'Inter',
    blurb: 'Neutral and very readable',
    weights: { 400: f('Inter_400Regular', Inter_400Regular), 500: f('Inter_500Medium', Inter_500Medium), 600: f('Inter_600SemiBold', Inter_600SemiBold), 700: f('Inter_700Bold', Inter_700Bold) },
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    blurb: 'Geometric and calm',
    weights: { 400: f('DMSans_400Regular', DMSans_400Regular), 500: f('DMSans_500Medium', DMSans_500Medium), 600: f('DMSans_600SemiBold', DMSans_600SemiBold), 700: f('DMSans_700Bold', DMSans_700Bold) },
  },
  {
    id: 'nunito',
    label: 'Rounded',
    blurb: 'Soft, rounded letters',
    weights: { 400: f('Nunito_400Regular', Nunito_400Regular), 500: f('Nunito_500Medium', Nunito_500Medium), 600: f('Nunito_600SemiBold', Nunito_600SemiBold), 700: f('Nunito_700Bold', Nunito_700Bold) },
  },
  {
    id: 'atkinson',
    label: 'Easy to read',
    blurb: 'Designed for low vision and dyslexia',
    weights: { 400: f('AtkinsonHyperlegible_400Regular', AtkinsonHyperlegible_400Regular), 700: f('AtkinsonHyperlegible_700Bold', AtkinsonHyperlegible_700Bold) },
  },
  {
    id: 'serif',
    label: 'Serif',
    blurb: 'Like reading a book',
    weights: { 400: f('Newsreader_400Regular', Newsreader_400Regular), 500: f('Newsreader_500Medium', Newsreader_500Medium), 600: f('Newsreader_600SemiBold', Newsreader_600SemiBold), 700: f('SourceSerif4_700Bold', SourceSerif4_700Bold) },
  },
];

export const displayFont = (id: string) => DISPLAY_FONTS.find((x) => x.id === id) ?? DISPLAY_FONTS[1];
export const textFont = (id: string) => TEXT_FONTS.find((x) => x.id === id) ?? TEXT_FONTS[0];

/** Nearest available face for a weight (e.g. 500 → 400 when only 400/700 exist). */
export function faceForWeight(font: TextFont, weight: number): Face | null {
  if (!font.weights) return null;
  const w = weight >= 650 ? 700 : weight >= 550 ? 600 : weight >= 450 ? 500 : 400;
  const order = w === 700 ? [700, 600, 500, 400] : w === 600 ? [600, 700, 500, 400] : w === 500 ? [500, 400, 600, 700] : [400, 500, 600, 700];
  for (const k of order) {
    const face = font.weights[k as 400];
    if (face) return face;
  }
  return null;
}

export interface FontChoice {
  display: string;
  text: string;
  logo: string;
}

/** Everything that must be loaded to render with these choices. */
export function facesFor(choice: FontChoice): Record<string, Source> {
  const map: Record<string, Source> = {};
  for (const face of [displayFont(choice.display).face, displayFont(choice.logo).face]) if (face) map[face.family] = face.source;
  for (const face of Object.values(textFont(choice.text).weights ?? {})) if (face) map[face.family] = face.source;
  return map;
}

/** One face per option, for the live previews on the Fonts screen. */
export function previewFaces(): Record<string, Source> {
  const map: Record<string, Source> = {};
  for (const d of DISPLAY_FONTS) if (d.face) map[d.face.family] = d.face.source;
  for (const t of TEXT_FONTS) {
    const face = faceForWeight(t, 400);
    if (face) map[face.family] = face.source;
  }
  return map;
}
