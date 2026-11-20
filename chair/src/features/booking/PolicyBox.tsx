import { View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { space, useTheme } from '@/theme';

import { policyLines } from './wording';

export function PolicyBox({
  deposit,
  cancelHours,
  title = 'Before you book',
  note,
}: {
  deposit: number;
  cancelHours: number;
  title?: string;
  /** Extra line shown first, e.g. when the chosen time is already inside the window. */
  note?: string | null;
}) {
  const { c } = useTheme();
  return (
    <View style={{ padding: space.lg, borderRadius: 20, backgroundColor: c.accentSoft, gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Icon name="information-circle-outline" size={18} color={c.accent} />
        <Text variant="bodyStrong">{title}</Text>
      </View>
      {(note ? [note, ...policyLines(deposit, cancelHours)] : policyLines(deposit, cancelHours)).map((l) => (
        <View key={l} style={{ flexDirection: 'row', gap: space.sm }}>
          <Text color={c.accent}>•</Text>
          <Text variant="small" style={{ flex: 1, lineHeight: 20 }}>
            {l}
          </Text>
        </View>
      ))}
    </View>
  );
}
