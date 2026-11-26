import { router } from 'expo-router';

/** Hands the icon page its current value and where to send the choice. */
let request: { value: string; color: string; onPick: (icon: string) => void } | null = null;

export function openIconPicker(r: { value: string; color: string; onPick: (icon: string) => void }) {
  request = r;
  router.push('/icons');
}

export function iconRequest() {
  return request;
}
