import { router } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Press, SwipeToDelete, Text } from '@/components/ui';
import { deleteTaskWithUndo } from '@/features/delete/deleteWithUndo';
import { completeTask } from '@/features/nudges/celebrate';
import type { Occurrence } from '@/features/tasks/logic';
import { addMinutesToTime, formatDuration, formatTime, minutesBetween, nowTime, todayKey, type DayKey } from '@/lib/dates';
import { useSettings } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

const TIME_W = 54;

/**
 * The day as a simple timeline: "Anytime" first, then everything with a time
 * in order, with a "Now" line on today. Tap the circle to tick, tap the row to
 * edit, swipe left to delete.
 */
export function DayPlan({ day, items, compact }: { day: DayKey; items: Occurrence[]; compact?: boolean }) {
  const { c } = useTheme();
  const { use24h } = useSettings();
  const today = todayKey();
  const now = nowTime();
  const anytime = items.filter((o) => !o.task.time);
  const timed = items.filter((o) => o.task.time).sort((a, b) => (a.task.time! < b.task.time! ? -1 : 1));
  const nowIndex = day === today ? timed.findIndex((o) => o.task.time! > now) : -1;
  const showNowAtEnd = day === today && timed.length > 0 && nowIndex === -1;

  if (items.length === 0 && compact) {
    return (
      <Text variant="small" tone="faint" style={{ paddingHorizontal: 4 }}>
        Nothing planned
      </Text>
    );
  }
  if (items.length === 0) {
    return (
      <Card style={{ alignItems: 'center', paddingVertical: space.xl, gap: 4 }}>
        <Icon name="calendar-clear-outline" size={22} color={c.textFaint} />
        <Text style={{ fontWeight: '500', marginTop: 4 }}>{day === today ? 'Nothing planned yet' : 'A free day'}</Text>
        <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
          {day === today ? 'Add the first thing below. Try “Gym at 7am”.' : 'Tap below to plan it, or type “Gym at 7am”.'}
        </Text>
        {/* Today already has the add field right underneath; other days get a clear button. */}
        {day !== today && (
          <Button small label="Plan this day" icon="add" onPress={() => router.push({ pathname: '/task', params: { date: day } })} style={{ marginTop: space.sm }} />
        )}
      </Card>
    );
  }

  return (
    <Card padded={false} style={{ paddingVertical: space.sm, paddingHorizontal: space.md, overflow: 'hidden' }}>
      {anytime.map((o, i) => (
        <Row key={`${o.task.id}:${o.day}`} occ={o} label={i === 0 ? 'Anytime' : ''} last={i === anytime.length - 1 && timed.length === 0} />
      ))}
      {timed.map((o, i) => {
        // Free time between the end of the previous plan and this one.
        const prev = timed[i - 1];
        const prevEnd = prev ? addMinutesToTime(prev.task.time!, prev.task.duration ?? 0) : null;
        const free = prevEnd ? minutesBetween(prevEnd, o.task.time!) : 0;
        return (
          <Fragment key={`${o.task.id}:${o.day}`}>
            {free >= 30 && !compact && <FreeGap minutes={free} />}
            {i === nowIndex && <NowLine now={now} use24h={use24h} />}
            <Row occ={o} label={formatTime(o.task.time!, use24h)} last={i === timed.length - 1 && !showNowAtEnd} />
          </Fragment>
        );
      })}
      {showNowAtEnd && <NowLine now={now} use24h={use24h} />}
    </Card>
  );
}

function FreeGap({ minutes }: { minutes: number }) {
  const { c } = useTheme();
  return (
    <View style={styles.freeRow}>
      <View style={{ width: TIME_W }} />
      <View style={styles.rail}>
        <View style={[styles.freeLine, { borderColor: c.border }]} />
      </View>
      <Text variant="small" tone="faint" style={{ paddingLeft: 6, fontSize: 12 }}>
        Free · {formatDuration(minutes)}
      </Text>
    </View>
  );
}

function NowLine({ now, use24h }: { now: string; use24h: boolean }) {
  const { c } = useTheme();
  return (
    <View style={styles.nowRow} accessibilityLabel={`Now, ${formatTime(now, use24h)}`}>
      <Text variant="small" color={c.accent} style={{ width: TIME_W, fontSize: 11, fontWeight: '700' }}>
        NOW
      </Text>
      <View style={[styles.nowDot, { backgroundColor: c.accent }]} />
      <View style={[styles.nowLine, { backgroundColor: c.accent }]} />
    </View>
  );
}

function Row({ occ, label, last }: { occ: Occurrence; label: string; last: boolean }) {
  const { c } = useTheme();
  const { task, day, done } = occ;
  const late = !done && (day < todayKey() || (day === todayKey() && !!task.time && task.time < nowTime()));
  const { use24h } = useSettings();
  const end = task.time && task.duration ? addMinutesToTime(task.time, task.duration) : null;
  // Longer plans get taller blocks, so the day's shape is visible at a glance.
  const blockH = task.duration ? Math.min(140, Math.max(50, task.duration * 0.8)) : 50;
  return (
    <SwipeToDelete onDelete={() => deleteTaskWithUndo(task, day)} borderRadius={radius.md}>
      <View style={[styles.row, { backgroundColor: c.surface, minHeight: blockH }]}>
        <View style={{ width: TIME_W }}>
          <Text variant="small" tone={late ? 'danger' : 'muted'} style={{ fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
            {label}
          </Text>
          {end && (
            <Text variant="small" tone="faint" style={{ fontSize: 11 }} numberOfLines={1}>
              –{formatTime(end, use24h)}
            </Text>
          )}
        </View>
        <View style={styles.rail}>
          {!last && <View style={[styles.line, { backgroundColor: c.border }]} />}
          <Press
            haptic={false}
            onPress={() => completeTask(task, day)}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={`Complete ${task.title}`}
            style={[styles.dot, { borderColor: done ? c.accent : late ? c.danger : c.border, backgroundColor: done ? c.accent : c.surface }]}>
            {done && <Icon name="checkmark" size={14} color={c.accentText} />}
          </Press>
        </View>
        <Press
          haptic={false}
          style={[styles.body, task.duration ? [styles.block, { backgroundColor: done ? c.surfaceAlt : c.accentSoft, borderLeftColor: done ? c.border : c.accent }] : null]}
          onPress={() => router.push({ pathname: '/task', params: { id: task.id, day } })}>
          <Text numberOfLines={2} tone={done ? 'faint' : 'default'} style={[{ fontWeight: '500' }, done && { textDecorationLine: 'line-through' }]}>
            {task.title}
          </Text>
          {(task.repeat !== 'none' || task.reminder != null || task.duration) && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2, alignItems: 'center' }}>
              {task.duration ? (
                <Text variant="small" tone="muted" style={{ fontSize: 12 }}>
                  {formatDuration(task.duration)}
                </Text>
              ) : null}
              {task.repeat !== 'none' && <Icon name="repeat" size={13} color={c.textFaint} />}
              {task.reminder != null && <Icon name="notifications-outline" size={12} color={c.textFaint} />}
            </View>
          )}
        </Press>
      </View>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 50, paddingVertical: 4 },
  rail: { width: 34, alignItems: 'center', alignSelf: 'stretch' },
  line: { position: 'absolute', top: 30, bottom: -8, width: 2, borderRadius: 1 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  body: { flex: 1, paddingLeft: 6, paddingTop: 2, paddingBottom: 8, paddingRight: 4 },
  block: { borderRadius: radius.md, borderLeftWidth: 3, paddingLeft: 10, paddingTop: 6, marginBottom: 6, marginRight: 2 },
  freeRow: { flexDirection: 'row', alignItems: 'center', height: 26 },
  freeLine: { position: 'absolute', top: 0, bottom: 0, borderLeftWidth: 2, borderStyle: 'dashed' },
  nowRow: { flexDirection: 'row', alignItems: 'center', height: 18 },
  nowDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 13, marginRight: -2 },
  nowLine: { flex: 1, height: 2, borderRadius: 1 },
});
