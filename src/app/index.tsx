import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, Text } from '@/components/ui';
import { loadSampleData } from '@/store/actions/sample';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

const POINTS: [React.ComponentProps<typeof Icon>['name'], string][] = [
  ['wallet-outline', 'One flat monthly fee. No commission, ever.'],
  ['qr-code-outline', 'Your own booking link and a QR code for the mirror.'],
  ['chatbubble-ellipses-outline', 'Clients book in seconds and get text reminders.'],
];

export default function Welcome() {
  const setupComplete = useStore((s) => s.settings.setupComplete);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  if (setupComplete) return <Redirect href="/calendar" />;

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl }]}>
      <View style={{ gap: space.lg }}>
        <View style={[styles.mark, { backgroundColor: c.ink }]}>
          <Icon name="cut-outline" size={30} color={c.inkText} />
        </View>
        <Text variant="display" style={{ fontSize: 52, lineHeight: 56 }}>
          Chair
        </Text>
        <Text variant="title" tone="muted" style={{ fontSize: 26, lineHeight: 31 }}>
          Bookings for independent barbers.
        </Text>
      </View>

      <View style={{ gap: space.lg }}>
        {POINTS.map(([icon, text]) => (
          <View key={text} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <View style={[styles.point, { backgroundColor: c.accentSoft }]}>
              <Icon name={icon} size={20} color={c.accent} />
            </View>
            <Text style={{ flex: 1, lineHeight: 22 }}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: space.sm }}>
        <Button label="Set up my shop" icon="arrow-forward" onPress={() => router.push('/setup')} />
        <Button
          kind="secondary"
          label="Explore with a sample shop"
          onPress={async () => {
            await loadSampleData();
            router.replace('/calendar');
          }}
        />
        <Text variant="small" tone="faint" style={{ textAlign: 'center', marginTop: space.sm }}>
          About 3 minutes. You can change everything later.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl, justifyContent: 'space-between', width: '100%', maxWidth: 560, alignSelf: 'center' },
  mark: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  point: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
