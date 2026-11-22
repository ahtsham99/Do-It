import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text, type IconName } from '@/components/ui';
import { radius, space, useTheme } from '@/theme';

export interface Nudge {
  key: string;
  icon: IconName;
  title: string;
  kind: 'accent' | 'danger' | 'warning';
  onPress?: () => void;
}

/** One slim line for the most important nudge, so Today fits on one screen. */
export function NudgeStrip({ nudge, more, onMore }: { nudge: Nudge; more: number; onMore: () => void }) {
  const { c } = useTheme();
  const tone = {
    accent: { bg: c.accentSoft, fg: c.accent },
    danger: { bg: c.dangerSoft, fg: c.danger },
    warning: { bg: c.warningSoft, fg: c.warning },
  }[nudge.kind];
  return (
    <View style={styles.row}>
      <Press onPress={nudge.onPress} style={[styles.strip, { backgroundColor: tone.bg }]} accessibilityRole="button">
        <Icon name={nudge.icon} size={18} color={tone.fg} />
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, fontWeight: '500' }}>
          {nudge.title}
        </Text>
        <Icon name="chevron-forward" size={16} color={c.textMuted} />
      </Press>
      {more > 0 && (
        <Press onPress={onMore} accessibilityLabel={`${more} more`} style={[styles.more, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text variant="small" style={{ fontWeight: '600' }}>
            +{more}
          </Text>
        </Press>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  strip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 42, paddingHorizontal: space.lg, borderRadius: radius.pill },
  more: { height: 42, minWidth: 42, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
