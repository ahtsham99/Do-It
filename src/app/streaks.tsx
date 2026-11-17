import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Glyph, Icon, Section, SheetHeader, Text } from '@/components/ui';
import { bestHabitStreak, habitStreak, streakLabel } from '@/features/habits/logic';
import { useNudges } from '@/features/nudges/useNudges';
import { addDays, fromKey, range, startOfWeek, weekdayLetters } from '@/lib/dates';
import { useHabits, useSettings } from '@/store/hooks';
import { useStore } from '@/store/store';
import { SERIF, space, useTheme } from '@/theme';

const WEEKS = 6;

/** Your streak: how many days in a row you've shown up. */
export default function StreaksScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const n = useNudges();
  const { weekStartsOn } = useSettings();
  const stats = useStore((s) => s.stats);
  const habits = useHabits();
  const active = new Set(stats.activeDays);
  const first = addDays(startOfWeek(n.today, weekStartsOn), -(WEEKS - 1) * 7);

  const line = n.activeToday
    ? 'You showed up today. Come back tomorrow to keep it going.'
    : n.streak > 0
      ? 'One task, one habit, or planning your day keeps it going today.'
      : 'Plan your day, tick a habit or finish one task to begin a streak.';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: Platform.OS === 'web' ? insets.top : 0 }}>
        <SheetHeader title="Streak" cancelLabel="Close" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.lg }}>
          <Icon name={n.activeToday ? 'flame' : 'flame-outline'} size={34} color={c.flame} />
          <Text style={{ fontFamily: SERIF, fontSize: 88, lineHeight: 92 }}>{n.streak}</Text>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            {n.streak === 1 ? 'day in a row' : 'days in a row'}
          </Text>
          <Text tone="muted" style={{ textAlign: 'center', maxWidth: 300, lineHeight: 23, marginTop: space.sm }}>
            {line}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Stat label="Best streak" value={String(n.bestStreak)} />
          <Stat label="Days active" value={String(stats.activeDays.length)} />
          <Stat label="Days planned" value={String(stats.plannedDays.length)} />
        </View>

        <Section title="Last six weeks">
          <Card style={{ gap: space.sm }}>
            <View style={styles.week}>
              {weekdayLetters(weekStartsOn).map((l, i) => (
                <View key={i} style={styles.cell}>
                  <Text variant="small" tone="faint" style={{ fontSize: 12 }}>
                    {l}
                  </Text>
                </View>
              ))}
            </View>
            {Array.from({ length: WEEKS }, (_, w) => (
              <View key={w} style={styles.week}>
                {range(addDays(first, w * 7), 7).map((d) => {
                  const on = active.has(d);
                  const future = d > n.today;
                  return (
                    <View key={d} style={styles.cell}>
                      <View
                        accessibilityLabel={`${d}${on ? ', active' : ''}`}
                        style={[
                          styles.dot,
                          { backgroundColor: on ? c.accent : 'transparent', borderColor: d === n.today ? c.textMuted : on ? c.accent : c.border, opacity: future ? 0.35 : 1 },
                        ]}>
                        <Text style={{ fontSize: 12 }} color={on ? c.accentText : c.textMuted}>
                          {fromKey(d).getDate()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </Card>
        </Section>

        {habits.length > 0 && (
          <Section title="Habit streaks">
            <Card padded={false} style={{ paddingHorizontal: space.xl - 4 }}>
              {habits.map((h, i) => {
                const s = habitStreak(h, n.today, weekStartsOn);
                return (
                  <View key={h.id} style={[styles.habit, i < habits.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                    <Glyph value={h.icon} size={22} color={h.color} />
                    <Text style={{ flex: 1, fontSize: 17 }} numberOfLines={1}>
                      {h.name}
                    </Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 17 }}>{streakLabel(h, s)}</Text>
                      <Text variant="small" tone="muted" style={{ fontSize: 12 }}>
                        best {Math.max(s, bestHabitStreak(h, weekStartsOn))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: space.sm }}>
      <Text style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 38 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 12, textAlign: 'center' }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl - 4, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  week: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  habit: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64 },
});
