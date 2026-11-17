import { Platform, Share } from 'react-native';

import { showToast } from '@/components/ui';

/** Native share sheet; on web, the share sheet if the browser has one, else copy. */
export async function shareLink(url: string, title: string) {
  try {
    if (Platform.OS === 'web') {
      const nav = globalThis.navigator as Navigator | undefined;
      if (nav?.share) return await nav.share({ title, url });
      await nav?.clipboard?.writeText(url);
      return showToast('Link copied', 'link');
    }
    await Share.share({ message: `${title}: ${url}`, url });
  } catch {
    // user closed the share sheet
  }
}

export async function copyLink(url: string) {
  try {
    if (Platform.OS === 'web') {
      await globalThis.navigator?.clipboard?.writeText(url);
      return showToast('Link copied', 'link');
    }
  } catch {}
  return shareLink(url, 'Booking link');
}
