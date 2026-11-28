import { StyleSheet, View } from 'react-native';

import { Press, Text } from '@/components/ui';
import { radius, useTheme } from '@/theme';

import { HISTORY_RANGES, type HistoryRange } from './historyRanges';
import { t } from '@/lib/i18n';

export function RangePicker({ value, onChange }: { value: HistoryRange; onChange: (r: HistoryRange) => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: c.surfaceAlt }]}>
      {HISTORY_RANGES.map((r) => {
        const on = r.id === value;
        return (
          <Press key={r.id} onPress={() => onChange(r.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[styles.item, on && { backgroundColor: c.surface }]}>
            <Text variant="small" color={on ? c.text : c.textMuted} style={{ fontWeight: on ? '700' : '500' }}>
              {r.id === 'Max' ? t('Max') : r.id}
            </Text>
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.pill, padding: 3 },
  item: { flex: 1, minWidth: 0, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
