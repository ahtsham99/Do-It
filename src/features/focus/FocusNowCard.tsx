import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text } from '@/components/ui';
import { remainingSec } from '@/store/actions/timer';
import { useStore } from '@/store/store';
import { SERIF, radius, space, useTheme } from '@/theme';

import { TimerRing } from './TimerRing';
import { formatClock, useTick } from './useTick';

/** Compact live timer shown on Today while a session is running or paused. */
export function FocusNowCard({ compact }: { compact?: boolean }) {
  const { c } = useTheme();
  const timer = useStore((s) => s.timer);
  const now = useTick(timer.status === 'running');
  if (timer.status === 'idle') return null;
  const left = remainingSec(timer, now);
  const isBreak = timer.mode === 'break';
  return (
    <Press onPress={() => router.push('/focus')} style={[styles.wrap, compact && styles.compact, { backgroundColor: c.surface, borderColor: c.border, boxShadow: `0px 6px 22px ${c.shadow}` }]}>
      <TimerRing progress={timer.durationSec ? left / timer.durationSec : 0} size={compact ? 36 : 56} stroke={compact ? 4 : 5} color={isBreak ? c.warning : c.accent}>
        <Icon name={timer.status === 'paused' ? 'pause' : isBreak ? 'cafe-outline' : 'timer-outline'} size={compact ? 15 : 20} color={c.textMuted} />
      </TimerRing>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
          {timer.status === 'paused' ? 'Paused' : isBreak ? 'On a break' : 'Focusing'}
        </Text>
        <Text numberOfLines={1}>{timer.label || 'Focus session'}</Text>
      </View>
      <Text style={{ fontFamily: SERIF, fontSize: compact ? 26 : 34, lineHeight: compact ? 30 : 38, fontVariant: ['tabular-nums'] }}>{formatClock(left)}</Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.lg, borderRadius: radius.xl, borderWidth: 1 },
  compact: { paddingVertical: 6, paddingHorizontal: space.md, gap: space.md, borderRadius: radius.pill },
});
