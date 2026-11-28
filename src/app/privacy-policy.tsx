import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Card, SheetHeader, Text } from '@/components/ui';
import { useSheetTopInset } from '@/hooks/useTopInset';
import { SUPPORT_EMAIL } from '@/lib/appInfo';
import { SERIF, radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

const SECTIONS: { title: string; body: string }[] = [
  { title: 'Your data stays on your device', body: 'Your plans, habits, reminders, countdowns, goals, focus sessions, settings, name and profile picture are stored only on this device. They are never uploaded, synced or sent to us or anyone else.' },
  { title: 'We collect nothing', body: 'There is no sign-up, account or login. We don’t use analytics, advertising, crash-reporting or tracking tools, and we don’t sell or share data, because we never have it.' },
  { title: 'Notifications are local', body: 'Reminders and nudges are scheduled on your device by your phone’s own notification system. They are not sent from a server, and turning them off stops them completely.' },
  { title: 'Photos', body: 'If you choose a profile picture, Do It opens your photo library only for the photo you pick, and keeps a small copy on this device. Nothing else is read or uploaded.' },
  { title: 'Backups are yours', body: '“Back up to a file” creates a file that you save wherever you choose. We never see it. “Restore from a backup” reads only the file you pick.' },
  { title: 'Deleting your data', body: 'Go to Settings → Erase everything, or delete the app. Because your data only exists on this device, that removes it completely.' },
  { title: 'Changes', body: 'If this policy changes, we’ll update it here. If Do It ever starts collecting data, we’ll say so in the app first.' },
];

/** The privacy policy, in the app (the same text is published at /privacy). */
export default function PrivacyPolicyScreen() {
  const { c } = useTheme();
  const top = useSheetTopInset();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: top }}>
        <SheetHeader title={t('Privacy')} cancelLabel={t('Close')} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.summary, { backgroundColor: c.accent }]}>
          <Text color={c.accentText} style={{ fontSize: 17, lineHeight: 25 }}>
            {t('Do It keeps everything on your device. No accounts, no ads, no tracking, and nothing is sent to a server.')}
          </Text>
        </View>
        {SECTIONS.map((s) => (
          <Card key={s.title} style={{ gap: 6 }}>
            <Text style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 28 }}>{t(s.title)}</Text>
            <Text tone="muted" style={{ lineHeight: 23 }}>
              {t(s.body)}
            </Text>
          </Card>
        ))}
        <Card style={{ gap: 6 }}>
          <Text style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 28 }}>{t('Contact')}</Text>
          <Text tone="muted" style={{ lineHeight: 23 }}>
            Questions?{' '}
            <Text color={c.accent} style={{ fontWeight: '600' }} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
              {SUPPORT_EMAIL}
            </Text>
          </Text>
        </Card>
        <Text variant="small" tone="faint" style={{ textAlign: 'center' }}>
          {t('Last updated 27 November 2026')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  summary: { borderRadius: radius.xl, padding: space.lg + 2 },
});
