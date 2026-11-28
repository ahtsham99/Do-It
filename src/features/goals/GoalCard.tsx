import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Glyph, Press, SwipeToDelete, Text } from '@/components/ui';
import { deleteGoalWithUndo } from '@/features/delete/deleteWithUndo';
import type { Goal } from '@/store/types';
import { SERIF, hexAlpha, radius, space, useTheme } from '@/theme';

import { daysLeftLabel, goalProgress, goalStatus, isSimple } from './logic';
import { t } from '@/lib/i18n';

export function GoalCard({ goal, compact }: { goal: Goal; compact?: boolean }) {
  const { c, paint } = useTheme();
  const color = paint(goal.color);
  const p = goalProgress(goal);
  const pct = Math.round(p * 100);
  const left = daysLeftLabel(goal);
  const done = !!goal.completedAt;
  const simple = isSimple(goal);
  return (
    <SwipeToDelete onDelete={() => deleteGoalWithUndo(goal)}>
    <Press haptic={false} onPress={() => router.push({ pathname: '/goal', params: { id: goal.id } })}>
      <Card style={{ gap: space.md, padding: compact || simple ? space.lg : space.xl - 4, opacity: done ? 0.75 : 1 }}>
        <View style={styles.top}>
          <View style={[styles.tile, { backgroundColor: hexAlpha(color, 0.16), borderColor: hexAlpha(color, 0.5) }]}>
            <Glyph value={goal.icon} size={compact ? 20 : 24} color={color} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: compact ? 17 : 19, fontWeight: '500' }} numberOfLines={2}>
              {goal.title}
            </Text>
            {simple ? (
              goal.why?.trim() || done ? (
                <Text variant="small" tone="muted" numberOfLines={1} style={{ fontStyle: done ? 'normal' : 'italic' }}>
                  {done ? t('Achieved') : `“${goal.why!.trim()}”`}
                </Text>
              ) : null
            ) : (
              <Text variant="small" tone="muted" numberOfLines={1}>
                {goalStatus(goal)}
              </Text>
            )}
          </View>
          {simple ? (
            left ? (
              <Text variant="small" tone={left.includes('past') ? 'danger' : 'muted'} style={{ fontWeight: '500' }}>
                {left}
              </Text>
            ) : done ? (
              <Text variant="small" color={c.success} style={{ fontWeight: '600' }}>
                ✓
              </Text>
            ) : null
          ) : (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: SERIF, fontSize: compact ? 30 : 38, lineHeight: compact ? 34 : 42 }}>
              {pct}
              <Text variant="small" tone="muted">
                %
              </Text>
            </Text>
          </View>
          )}
        </View>
        {!simple && (
          <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
            <View style={{ width: `${Math.max(pct, p > 0 ? 3 : 0)}%`, height: '100%', borderRadius: radius.pill, backgroundColor: done ? c.success : color }} />
          </View>
        )}
        {!simple && !compact && (left || goal.why) ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
            <Text variant="small" tone="muted" numberOfLines={1} style={{ flex: 1, fontStyle: goal.why ? 'italic' : 'normal' }}>
              {goal.why ? `“${goal.why}”` : ''}
            </Text>
            {left && (
              <Text variant="small" tone={left.includes('past') ? 'danger' : 'muted'} style={{ fontWeight: '500' }}>
                {left}
              </Text>
            )}
          </View>
        ) : null}
      </Card>
    </Press>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tile: { width: 50, height: 50, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
});
