import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import type { AppState } from '@/store/types';

import { planNotifications } from './plan';

/** Native platforms can deliver real local notifications. */
export const supportsLocalNotifications = true;

let configured = false;

export function configureNotifications() {
  if (configured) return () => {};
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('nudges', {
      name: 'Nudges & reminders',
      // eslint-disable-next-line import/namespace -- re-exported enum the resolver can't follow
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {});
  }
  const sub = Notifications.addNotificationResponseReceivedListener((res) => {
    const url = res.notification.request.content.data?.url;
    if (typeof url === 'string') router.push(url as never);
  });
  return () => sub.remove();
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function rescheduleAll(state: AppState) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!state.settings.notificationsEnabled) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  for (const n of planNotifications(state)) {
    await Notifications.scheduleNotificationAsync({
      identifier: n.id,
      content: { title: n.title, body: n.body, data: { url: n.url }, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: n.date,
        channelId: Platform.OS === 'android' ? 'nudges' : undefined,
      },
    });
  }
}
