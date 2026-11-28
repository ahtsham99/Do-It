import { getLocales } from 'expo-localization';
import { I18nManager, Platform } from 'react-native';

import ar from './locales/ar';
import de from './locales/de';
import es from './locales/es';
import fr from './locales/fr';
import id from './locales/id';
import ms from './locales/ms';
import tr from './locales/tr';
import ur from './locales/ur';

/** A translation: plain text, or plural forms (Intl.PluralRules categories). */
export type Entry = string | Partial<Record<Intl.LDMLPluralRule, string>>;
export type Dictionary = Record<string, Entry>;

export const LANGUAGES = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'ur', name: 'اردو', rtl: true },
  { code: 'es', name: 'Español', rtl: false },
  { code: 'fr', name: 'Français', rtl: false },
  { code: 'de', name: 'Deutsch', rtl: false },
  { code: 'tr', name: 'Türkçe', rtl: false },
  { code: 'id', name: 'Bahasa Indonesia', rtl: false },
  { code: 'ms', name: 'Bahasa Melayu', rtl: false },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const DICTS: Partial<Record<LanguageCode, Dictionary>> = { ar, ur, es, fr, de, tr, id, ms };

let lang: LanguageCode = 'en';

/** The phone's language, if we have it; otherwise English. */
export function deviceLanguage(): LanguageCode {
  try {
    const code = getLocales()[0]?.languageCode ?? 'en';
    return LANGUAGES.some((l) => l.code === code) ? (code as LanguageCode) : 'en';
  } catch {
    return 'en';
  }
}

export function resolveLanguage(setting: string | undefined): LanguageCode {
  if (setting && setting !== 'system' && LANGUAGES.some((l) => l.code === setting)) return setting as LanguageCode;
  return deviceLanguage();
}

export function currentLanguage() {
  return lang;
}

export function isRTL(code: LanguageCode = lang) {
  return LANGUAGES.find((l) => l.code === code)?.rtl ?? false;
}

/** Locale for Intl (dates, plurals). Latin digits everywhere, so numbers stay consistent. */
export function locale(code: LanguageCode = lang) {
  return code === 'ar' || code === 'ur' ? `${code}-u-nu-latn` : code;
}

/**
 * Switch language. Web flips the page direction straight away; the native app
 * needs a restart to flip (returns true when one is needed).
 */
export function applyLanguage(code: LanguageCode): boolean {
  lang = code;
  const rtl = isRTL(code);
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    }
    return false;
  }
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
}

const fill = (s: string, vars?: Record<string, string | number | null | undefined>) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s);

/**
 * Translate. The English text is the key, so anything missing falls back to
 * English. `{name}` placeholders are filled from `vars`.
 */
export function t(en: string, vars?: Record<string, string | number | null | undefined>): string {
  const e = lang === 'en' ? undefined : DICTS[lang]?.[en];
  const s = typeof e === 'string' ? e : typeof e === 'object' ? (e.other ?? en) : en;
  return fill(s, vars);
}

/**
 * Plural: tn(3, '{n} plan', '{n} plans'). Other languages store the plural
 * forms they need under the English plural text.
 */
export function tn(n: number, one: string, other: string, vars?: Record<string, string | number | null | undefined>): string {
  const v = { n, ...vars };
  if (lang === 'en') return fill(n === 1 ? one : other, v);
  const e = DICTS[lang]?.[other] ?? DICTS[lang]?.[one];
  if (!e) return fill(n === 1 ? one : other, v);
  if (typeof e === 'string') return fill(e, v);
  const cat = new Intl.PluralRules(locale()).select(n);
  return fill(e[cat] ?? e.other ?? other, v);
}

/** Marks text for translation without translating it yet (for constants made at load time). */
export const tk = (en: string) => en;
