import { setState } from '../store';
import type { Settings } from '../types';

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ settings: { ...s.settings, ...patch } }));
}
