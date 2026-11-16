import type { AppState } from '@/store/types';

/**
 * Web (incl. iPhone home-screen app): no local notification scheduling, so the
 * app falls back to the big in-app banners on the Today screen.
 */
export const supportsLocalNotifications = false;

export function configureNotifications() {
  return () => {};
}

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function rescheduleAll(_state: AppState) {}
