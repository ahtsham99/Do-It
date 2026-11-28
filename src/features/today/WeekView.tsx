import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, Press, Text } from '@/components/ui';
import { completeTask } from '@/features/nudges/celebrate';
import { occurrencesOn, type Occurrence } from '@/features/tasks/logic';
import { fromKey, formatTime, nowTime, todayKey, weekdayShort, type DayKey } from '@/lib/dates';
import { useSettings } from '@/store/hooks';
import type { Task } from '@/store/types';
import { SERIF, radius, space, useTheme } from '@/theme';

import { useDisplay } from './display';

/**
 * The week on one card: a row per day, the date on the left and that day's
 * plans as short lines on the right. Past days are quieter, today stands out.
 * Tap the date to open that day; + adds to it.
 */
export function WeekView({ days, tasks, onOpenDay }: { days: DayKey[]; tasks: Task[]; onOpenDay: (d: DayKey) => void }) {
  const { c } = useTheme();
  const today = todayKey();
  const { showCompleted } = useDisplay();
  // Runs of past days with nothing planned fold into one slim line.
  const blocks: (DayKey | DayKey[])[] = [];
  for (const d of days) {
    const quiet = d < today && occurrencesOn(tasks, d).length === 0;
    const last = blocks[blocks.length - 1];
    if (quiet && Array.isArray(last)) last.push(d);
    else blocks.push(quiet ? [d] : d);
  }
  return (
    <Card padded={false} style={{ paddingHorizontal: space.md }}>
      {blocks.map((b, i) => {
        const border = i < blocks.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border };
        if (Array.isArray(b)) {
          const label = b.length === 1 ? weekdayShort(b[0]) : `${weekdayShort(b[0])}–${weekdayShort(b[b.length - 1])}`;
          return (
            <Press key={b[0]} onPress={() => onOpenDay(b[0])} style={[styles.quiet, border]} accessibilityLabel={`${label}: nothing planned`}>
              <View style={{ width: 44, alignItems: 'center' }}>
                <View style={[styles.quietDot, { backgroundColor: c.border }]} />
              </View>
              <Text variant="small" tone="faint">
                {label} · nothing planned
              </Text>
            </Press>
          );
        }
        const d = b;
        const all = occurrencesOn(tasks, d).sort((a, b) => ((a.task.time ?? '') < (b.task.time ?? '') ? -1 : 1));
        const items = showCompleted ? all : all.filter((o) => !o.done);
        const done = all.filter((o) => o.done).length;
        const isToday = d === today;
        const past = d < today;
        return (
          <View key={d} style={[styles.day, border, past && { opacity: 0.55 }]}>
            <Press onPress={() => onOpenDay(d)} accessibilityRole="button" accessibilityLabel={`Open ${weekdayShort(d)} ${fromKey(d).getDate()}`} style={styles.date}>
              <Text variant="caption" color={isToday ? c.accent : c.textMuted} style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>
                {weekdayShort(d).toUpperCase()}
              </Text>
              <View style={[styles.num, isToday && { backgroundColor: c.accent }]}>
                <Text color={isToday ? c.accentText : c.text} style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 26 }}>
                  {fromKey(d).getDate()}
                </Text>
              </View>
            </Press>
            <View style={{ flex: 1, gap: 2, paddingVertical: 2 }}>
              {items.length === 0 ? (
                <Press onPress={() => onOpenDay(d)} style={styles.empty}>
                  <Text variant="small" tone="faint">
                    {all.length ? `All ${all.length} done ✓` : past ? 'Nothing planned' : 'Free'}
                  </Text>
                </Press>
              ) : (
                items.map((o) => <Line key={`${o.task.id}:${o.day}`} occ={o} />)
              )}
            </View>
            <View style={styles.side}>
              {all.length > 0 && (
                <Text variant="small" tone="faint" style={{ fontSize: 11 }}>
                  {done}/{all.length}
                </Text>
              )}
              {!past && (
                <Press onPress={() => router.push({ pathname: '/task', params: { date: d } })} hitSlop={8} accessibilityLabel={`Add to ${weekdayShort(d)}`} style={[styles.add, { backgroundColor: c.surfaceAlt }]}>
                  <Icon name="add" size={15} color={c.textMuted} />
                </Press>
              )}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

function Line({ occ }: { occ: Occurrence }) {
  const { c } = useTheme();
  const { use24h } = useSettings();
  const { task, day, done } = occ;
  const late = !done && (day < todayKey() || (day === todayKey() && !!task.time && task.time < nowTime()));
  return (
    <View style={styles.line}>
      <Press
        haptic={false}
        onPress={() => completeTask(task, day)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`Complete ${task.title}`}
        style={[styles.tick, { borderColor: done ? c.accent : late ? c.danger : c.border, backgroundColor: done ? c.accent : 'transparent' }]}>
        {done && <Icon name="checkmark" size={11} color={c.accentText} />}
      </Press>
      <Press haptic={false} onPress={() => router.push({ pathname: '/task', params: { id: task.id, day } })} style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        {task.time ? (
          <Text variant="small" tone={late ? 'danger' : 'muted'} style={{ fontSize: 12, minWidth: 40 }}>
            {formatTime(task.time, use24h)}
          </Text>
        ) : null}
        <Text numberOfLines={1} tone={done ? 'faint' : 'default'} style={[{ flex: 1, fontSize: 15 }, done && { textDecorationLine: 'line-through' }]}>
          {task.title}
        </Text>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  quietDot: { width: 6, height: 6, borderRadius: 3 },
  quiet: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  day: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingVertical: space.md, minHeight: 64 },
  date: { width: 44, alignItems: 'center', gap: 2 },
  num: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 44, justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 30 },
  tick: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  side: { alignItems: 'flex-end', justifyContent: 'space-between', gap: space.sm, minHeight: 44, paddingTop: 4 },
  add: { width: 26, height: 26, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
