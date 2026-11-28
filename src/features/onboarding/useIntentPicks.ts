import { useMemo, useState } from 'react';

import { t } from '@/lib/i18n';

import { INTENT_IDEAS, matchIntents as matchEnglish } from './intents';
import { suggestionKey, type Suggestion } from './suggestions';

/**
 * Typed intent → matching suggestions. When a new theme shows up while typing,
 * its goal and one habit are ticked for you (once; unticking sticks).
 */
/** Tapped ideas show in the app's language; match them as their English originals. */
function matchIntents(text: string) {
  const lower = text.toLowerCase();
  const extra = INTENT_IDEAS.filter((i) => t(i) !== i && lower.includes(t(i).toLowerCase())).join(', ');
  return matchEnglish(extra ? `${text}, ${extra}` : text);
}

export function useIntentPicks(selected: Set<string>, setSelected: (s: Set<string>) => void) {
  const [text, setTextState] = useState('');
  const [considered, setConsidered] = useState<Set<string>>(new Set());
  const matches = useMemo(() => matchIntents(text).items, [text]);

  const setText = (t: string) => {
    setTextState(t);
    const items = matchIntents(t).items;
    const fresh = items.filter((s) => !considered.has(suggestionKey(s)));
    if (!fresh.length) return;
    const auto = [...fresh.filter((s) => s.kind === 'goal'), ...fresh.filter((s) => s.kind === 'habit').slice(0, 1)].map(suggestionKey);
    setConsidered(new Set([...considered, ...fresh.map(suggestionKey)]));
    if (auto.length) setSelected(new Set([...selected, ...auto]));
  };

  /** Everything ticked, from the typed matches and the given extra list, without duplicates. */
  const chosen = (extra: Suggestion[]) => {
    const seen = new Set<string>();
    return [...matches, ...extra].filter((s) => {
      const k = suggestionKey(s);
      if (!selected.has(k) || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  return { text, setText, matches, chosen };
}
