import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

const TAG = 'focus';

/** Native: keep the screen on while `active`. */
export function useKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return;
    activateKeepAwakeAsync(TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(TAG).catch(() => {});
    };
  }, [active]);
}
