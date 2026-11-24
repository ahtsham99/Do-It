import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Card, Icon, Press, Text } from '@/components/ui';
import { addDays, diffDays, formatDay, range, startOfWeek, toKey, todayKey, weekdayShort, type DayKey } from '@/lib/dates';
import { countFor } from '@/store/actions/habits';
import type { Habit } from '@/store/types';
import { SERIF, radius, space, useTheme } from '@/theme';

type Range = '1W' | '1M' | '3M' | '6M' | '1Y';
const RANGES: { id: Range; days: number }[] = [
  { id: '1W', days: 7 },
  { id: '1M', days: 30 },
  { id: '3M', days: 91 },
  { id: '6M', days: 182 },
  { id: '1Y', days: 364 },
];
const ALL = 'all';

/** How much of a habit got done on a day, 0–1 (counted habits give partial credit). */
function dayValue(h: Habit, d: DayKey) {
  if (h.history.includes(d)) return 1;
  const target = Math.max(1, h.perDay ?? 1);
  return target > 1 ? Math.min(1, countFor(h, d) / target) : 0;
}

/** Average over the habits that existed on that day. */
function valueOn(habits: Habit[], d: DayKey) {
  const live = habits.filter((h) => toKey(new Date(h.createdAt)) <= d || h.history.some((x) => x <= d));
  if (!live.length) return null;
  return live.reduce((m, h) => m + dayValue(h, d), 0) / live.length;
}

function average(values: (number | null)[]) {
  const v = values.filter((x): x is number => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

/**
 * Habit history like a stock chart: pick a range (1W–1Y), see % kept vs the
 * previous range, a line of how consistent you were, and the days underneath.
 */
export function HabitHistory({ habits, weekStartsOn }: { habits: Habit[]; weekStartsOn: 0 | 1 }) {
  const { c, paint } = useTheme();
  const [rangeId, setRange] = useState<Range>('1M');
  const [pick, setPick] = useState<string>(ALL);
  const [w, setW] = useState(300);
  const today = todayKey();
  const days = RANGES.find((r) => r.id === rangeId)!.days;
  const selected = pick === ALL ? habits : habits.filter((h) => h.id === pick);
  const color = pick === ALL || !selected[0] ? c.accent : paint(selected[0].color);

  const data = useMemo(() => {
    const start = addDays(today, -(days - 1));
    const list = range(start, days);
    const vals = list.map((d) => valueOn(selected, d));
    const prev = range(addDays(start, -days), days).map((d) => valueOn(selected, d));
    // Chart points: daily for short ranges, weekly averages for long ones.
    const step = days <= 31 ? 1 : 7;
    const points: number[] = [];
    for (let i = 0; i < vals.length; i += step) points.push(average(vals.slice(i, i + step)));
    return { start, list, vals, pct: Math.round(average(vals) * 100), prevPct: Math.round(average(prev) * 100), points, hasPrev: prev.some((v) => v != null) };
  }, [selected, days, today]);

  const change = data.pct - data.prevPct;
  const up = change >= 0;

  // Line chart path
  const H = 110;
  const n = data.points.length;
  const xy = data.points.map((v, i) => [n === 1 ? w / 2 : (i / (n - 1)) * w, 6 + (1 - v) * (H - 12)]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = n ? `${line} L${w},${H} L0,${H} Z` : '';

  // Day grid: weeks as columns, sized to fit the card
  const gridStart = startOfWeek(data.start, weekStartsOn);
  const weeks = Math.ceil((diffDays(gridStart, today) + 1) / 7);
  const gap = days > 100 ? 2 : 3;
  const cell = Math.max(3, Math.min(18, (w - gap * (weeks - 1)) / weeks));

  return (
    <Card style={{ gap: space.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {[{ id: ALL, label: 'All habits' }, ...habits.map((h) => ({ id: h.id, label: `${h.icon} ${h.name}` }))].map((x) => {
          const on = pick === x.id;
          return (
            <Press key={x.id} onPress={() => setPick(x.id)} style={[styles.chip, { backgroundColor: on ? c.accent : c.surfaceAlt }]}>
              <Text variant="small" color={on ? c.accentText : c.text} style={{ fontWeight: '600' }}>
                {x.label}
              </Text>
            </Press>
          );
        })}
      </ScrollView>

      <View>
        <Text style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 56 }}>
          {data.pct}
          <Text tone="muted" style={{ fontSize: 22 }}>
            % kept
          </Text>
        </Text>
        {data.hasPrev && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name={up ? 'caret-up' : 'caret-down'} size={14} color={up ? c.success : c.danger} />
            <Text variant="small" color={up ? c.success : c.danger} style={{ fontWeight: '600' }}>
              {Math.abs(change)}%
            </Text>
            <Text variant="small" tone="muted">
              vs previous {rangeId === '1W' ? 'week' : rangeId === '1M' ? 'month' : rangeId === '1Y' ? 'year' : rangeId.replace('M', ' months')}
            </Text>
          </View>
        )}
      </View>

      <View onLayout={(e: LayoutChangeEvent) => setW(Math.max(100, e.nativeEvent.layout.width))}>
        <Svg width={w} height={H}>
          <Defs>
            <LinearGradient id="hh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.28} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <Path key={g} d={`M0,${6 + g * (H - 12)} L${w},${6 + g * (H - 12)}`} stroke={c.border} strokeWidth={1} strokeDasharray="3 5" />
          ))}
          {n > 0 && <Path d={area} fill="url(#hh)" />}
          {n > 0 && <Path d={line} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
        </Svg>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text variant="small" tone="muted" style={{ fontSize: 11 }}>
            {formatDay(data.start, { relative: false })}
          </Text>
          <Text variant="small" tone="muted" style={{ fontSize: 11 }}>
            Today
          </Text>
        </View>
      </View>

      {/* Days: a calendar for short ranges, a full-width week grid for long ones */}
      {days <= 31 ? (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {range(gridStart, 7).map((d) => (
              <Text key={d} variant="small" tone="faint" style={{ flex: 1, textAlign: 'center', fontSize: 11 }}>
                {weekdayShort(d).slice(0, 1)}
              </Text>
            ))}
          </View>
          {Array.from({ length: weeks }, (_, wi) => (
            <View key={wi} style={{ flexDirection: 'row', gap: 6 }}>
              {range(addDays(gridStart, wi * 7), 7).map((d) => {
                const v = d < data.start || d > today ? null : valueOn(selected, d);
                return (
                  <View key={d} style={{ flex: 1, height: days === 7 ? 40 : 30, borderRadius: 8, backgroundColor: v == null ? 'transparent' : v > 0 ? color : c.surfaceAlt, opacity: v == null ? 1 : v > 0 ? 0.35 + v * 0.65 : 1, alignItems: 'center', justifyContent: 'center' }}>
                    {v != null && (
                      <Text variant="small" color={v > 0.5 ? '#fff' : c.textMuted} style={{ fontSize: 11 }}>
                        {Number(d.slice(8))}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap }}>
          {Array.from({ length: weeks }, (_, wi) => (
            <View key={wi} style={{ flex: 1, gap }}>
              {range(addDays(gridStart, wi * 7), 7).map((d) => {
                const v = d < data.start || d > today ? null : valueOn(selected, d);
                return (
                  <View
                    key={d}
                    style={{ height: cell, borderRadius: Math.min(4, cell / 3), backgroundColor: v == null ? 'transparent' : v > 0 ? color : c.surfaceAlt, opacity: v == null ? 1 : v > 0 ? 0.35 + v * 0.65 : 1 }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      )}

      <View style={[styles.ranges, { backgroundColor: c.surfaceAlt }]}>
        {RANGES.map((r) => {
          const on = r.id === rangeId;
          return (
            <Press key={r.id} onPress={() => setRange(r.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[styles.range, on && { backgroundColor: c.surface }]}>
              <Text variant="small" color={on ? c.text : c.textMuted} style={{ fontWeight: on ? '700' : '500' }}>
                {r.id}
              </Text>
            </Press>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 16, justifyContent: 'center' },
  ranges: { flexDirection: 'row', borderRadius: radius.pill, padding: 3 },
  range: { flex: 1, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
