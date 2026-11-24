/**
 * Focus sounds (native): not available yet — the native build will need
 * recorded loops via expo-audio. The web version is in sounds.web.ts.
 */
export type SoundId = 'off' | 'rain' | 'ocean' | 'brown' | 'white' | 'tick';

export const SOUNDS: { id: SoundId; label: string; icon: string }[] = [
  { id: 'off', label: 'Silent', icon: '🔇' },
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'brown', label: 'Deep', icon: '🟤' },
  { id: 'white', label: 'White', icon: '⚪' },
  { id: 'tick', label: 'Tick', icon: '⏱️' },
];

export const soundsSupported = false;
export function playSound(_id: SoundId) {}
export function stopSound() {}
