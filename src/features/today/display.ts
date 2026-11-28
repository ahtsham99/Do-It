import { useMemo } from 'react';

import { updateSettings } from '@/store/actions/settings';
import { useStore, getState } from '@/store/store';
import { DEFAULT_DISPLAY, type PlanDisplay } from '@/store/types';

/** How Today looks, with defaults for anything not saved yet. */
export function useDisplay(): PlanDisplay {
  const saved = useStore((s) => s.settings.display);
  return useMemo(() => ({ ...DEFAULT_DISPLAY, ...saved }), [saved]);
}

export function setDisplay(patch: Partial<PlanDisplay>) {
  updateSettings({ display: { ...DEFAULT_DISPLAY, ...getState().settings.display, ...patch } });
}
