import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * In a Safari tab on iPhone, iOS softly fades whatever sits just below the
 * status bar. Push content a little further down there so headings stay crisp.
 * The installed home-screen app and native builds don't need this.
 */
const SAFARI_FADE = 22;

function inIosSafariTab() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  return ios && !standalone;
}

const extra = inIosSafariTab() ? SAFARI_FADE : 0;

/** Top padding for a full screen. */
export function useTopInset() {
  return useSafeAreaInsets().top + extra;
}

/** Top padding for a sheet/modal header (native modals handle their own). */
export function useSheetTopInset() {
  const top = useTopInset();
  return Platform.OS === 'web' ? top : 0;
}

/**
 * Gap between the floating tab bar and the bottom of the screen: sits just
 * above the iPhone home bar instead of a full home-bar height above it.
 */
export function useTabBarBottom() {
  const bottom = useSafeAreaInsets().bottom;
  return Math.max(bottom - 14, 10);
}
