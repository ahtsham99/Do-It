import { Platform } from 'react-native';

import { tap } from '@/components/ui';

/** A soft two-note chime when a timer ends (web), haptic on native. */
export function chime() {
  if (Platform.OS !== 'web') {
    tap('success');
    return;
  }
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 1);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1600);
  } catch {
    // Audio can be unavailable (e.g. silent mode / no user gesture yet); the toast still shows.
  }
}
