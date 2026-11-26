import { useSyncExternalStore } from 'react';

import { keyboardOpen, subscribeKeyboard } from '@/lib/viewport';

/** Web: whether the on-screen keyboard is covering part of the screen. */
export function useKeyboardVisible() {
  return useSyncExternalStore(subscribeKeyboard, keyboardOpen, () => false);
}
