import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ColorPicker, DateTimeField, IconPicker } from '@/components/pickers';
import { Button, Card, Checkbox, Chip, Field, Glyph, Icon, IconButton, Label, Press, Segmented, SheetHeader, Text, Toggle, showDialog, showToast } from '@/components/ui';
import { GOAL_ICONS, GOAL_TEMPLATES, daysLeftLabel, goalProgress } from '@/features/goals/logic';
import { addDays, todayKey } from '@/lib/dates';
import { addGoal, deleteGoal, linkHabit, logProgress, newStep, toggleStep, updateGoal, type GoalInput } from '@/store/actions/goals';
import { addTask } from '@/store/actions/tasks';
import { useHabits } from '@/store/hooks';
import { useStore } from '@/store/store';
import type { Goal, GoalKind, GoalStep } from '@/store/types';
import { SERIF, SWATCHES, font, hexAlpha, radius, space, useTheme } from '@/theme';

function celebrate(title: string) {
  showDialog({
    title: 'Goal achieved 🎉',
    message: `“${title}” is done. You started, you kept going, and you finished.`,
    actions: [{ label: 'Lovely', onPress: () => {} }],
  });
}

/**
 * Create or work on a goal. For an existing goal every change saves straight
 * away, so ticking a step or logging progress feels instant.
 */
export default function GoalScreen() {
  const { c, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; template?: string }>();
  const existing = useStore((s) => s.goals.find((g) => g.id === params.id && !g.deletedAt));
  const habits = useHabits();
  const template = params.template != null ? GOAL_TEMPLATES[Number(params.template)] : undefined;

  const [draft, setDraft] = useState<GoalInput>(() =>
    existing
      ? { ...existing }
      : {
          title: template?.title ?? '',
          why: template?.why ?? '',
          icon: template?.icon ?? '🎯',
          color: SWATCHES[0],
          kind: template?.kind ?? 'steps',
          targetDate: null,
          steps: (template?.steps ?? []).map(newStep),
          target: template?.target ?? 10,
          current: 0,
          unit: template?.unit ?? '',
        },
  );
  const [stepText, setStepText] = useState('');

  // The live goal (for an existing one) or the draft (for a new one).
  const g: GoalInput = existing ?? draft;
  const apply = (patch: Partial<Goal>) => {
    setDraft((d) => ({ ...d, ...patch }));
    if (existing && updateGoal(existing.id, patch)) celebrate(existing.title);
  };

  const canSave = g.title.trim().length > 0;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/habits'));
  const save = () => {
    if (!canSave) return;
    if (!existing) {
      const created = addGoal({ ...draft, title: draft.title.trim(), why: draft.why?.trim() || undefined });
      showToast('Goal set. Start with the first small step.', 'flag-outline');
      router.replace({ pathname: '/goal', params: { id: created.id } });
      return;
    }
    close();
  };

  const tick = (step: GoalStep) => {
    if (existing) {
      if (toggleStep(existing.id, step.id)) celebrate(existing.title);
    } else {
      apply({ steps: g.steps.map((s) => (s.id === step.id ? { ...s, doneAt: s.doneAt ? null : Date.now() } : s)) });
    }
  };
  const addOne = () => {
    if (!stepText.trim()) return;
    apply({ steps: [...g.steps, newStep(stepText)] });
    setStepText('');
  };
  const log = (delta: number) => {
    if (existing) {
      if (logProgress(existing.id, delta)) celebrate(existing.title);
    } else apply({ current: Math.max(0, (g.current ?? 0) + delta) });
  };

  const p = goalProgress(g as Goal);
  const left = daysLeftLabel(g as Goal);
  const linked = habits.filter((h) => existing && h.goalId === existing.id);
  const unlinked = habits.filter((h) => !h.goalId);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: Platform.OS === 'web' ? insets.top : 0 }}>
        <SheetHeader title={existing ? 'Goal' : 'New goal'} onSave={save} saveLabel={existing ? 'Done' : 'Save'} canSave={canSave} cancelLabel={existing ? 'Close' : 'Cancel'} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={[styles.icon, { borderColor: g.color, backgroundColor: hexAlpha(g.color, 0.12) }]}>
            <Glyph value={g.icon} size={28} color={g.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Field placeholder="What do you want to achieve?" value={g.title} onChangeText={(title) => apply({ title })} autoFocus={!existing && !template} />
          </View>
        </View>

        {!existing && !template && !draft.title && (
          <View style={{ gap: space.sm }}>
            <Label>Or start from an idea</Label>
            <View style={styles.wrap}>
              {GOAL_TEMPLATES.map((t) => (
                <Chip
                  key={t.title}
                  label={`${t.icon}  ${t.title}`}
                  onPress={() => setDraft((d) => ({ ...d, title: t.title, icon: t.icon, kind: t.kind, steps: (t.steps ?? []).map(newStep), target: t.target ?? d.target, unit: t.unit ?? '' }))}
                />
              ))}
            </View>
          </View>
        )}

        {/* Progress */}
        <Card style={{ gap: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
                Progress
              </Text>
              <Text style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 60 }}>
                {Math.round(p * 100)}
                <Text tone="muted"> %</Text>
              </Text>
            </View>
            {left && (
              <Text variant="small" tone={left.includes('past') ? 'danger' : 'muted'} style={{ fontWeight: '500', paddingBottom: 10 }}>
                {left}
              </Text>
            )}
          </View>
          <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
            <View style={{ width: `${Math.max(p * 100, p > 0 ? 3 : 0)}%`, height: '100%', borderRadius: radius.pill, backgroundColor: g.color }} />
          </View>

          {g.kind === 'steps' ? (
            <View>
              {g.steps.length === 0 && (
                <Text variant="small" tone="muted" style={{ marginBottom: space.sm }}>
                  Break it into small steps, each something you could start in 10 minutes.
                </Text>
              )}
              {g.steps.map((s, i) => (
                <View key={s.id} style={[styles.step, i < g.steps.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                  <Checkbox checked={!!s.doneAt} onToggle={() => tick(s)} color={g.color} label={`Complete ${s.title}`} />
                  <Text style={[{ flex: 1 }, !!s.doneAt && { textDecorationLine: 'line-through' }]} tone={s.doneAt ? 'faint' : 'default'}>
                    {s.title}
                  </Text>
                  {existing && !s.doneAt && (
                    <Press
                      onPress={() => {
                        addTask({ title: s.title, date: todayKey(), repeat: 'none', reminder: null, time: null });
                        showToast('Added to today’s reminders.', 'alarm-outline');
                      }}
                      accessibilityLabel={`Add ${s.title} to today`}
                      style={[styles.mini, { backgroundColor: c.surfaceAlt }]}>
                      <Text variant="small" style={{ fontWeight: '600' }}>
                        Today
                      </Text>
                    </Press>
                  )}
                  <Press onPress={() => apply({ steps: g.steps.filter((x) => x.id !== s.id) })} hitSlop={10} accessibilityLabel={`Remove ${s.title}`}>
                    <Icon name="close" size={18} color={c.textFaint} />
                  </Press>
                </View>
              ))}
              <View style={[styles.addStep, { borderColor: c.border }]}>
                <Icon name="add" size={20} color={c.textFaint} />
                <TextInput
                  value={stepText}
                  onChangeText={setStepText}
                  onSubmitEditing={addOne}
                  submitBehavior="submit"
                  returnKeyType="done"
                  placeholder="Add a small step…"
                  placeholderTextColor={c.textFaint}
                  style={[font.body, { flex: 1, height: 48, color: c.text, fontFamily: fonts.text(400), outlineStyle: 'none' } as object]}
                />
                {stepText.trim().length > 0 && <IconButton icon="arrow-up" label="Add step" size={16} diameter={34} bg={c.accent} color={c.accentText} onPress={addOne} />}
              </View>
            </View>
          ) : (
            <View style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
                <IconButton icon="remove" label="Less" onPress={() => log(-1)} />
                <Text style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 44, minWidth: 120, textAlign: 'center' }}>
                  {g.current ?? 0}
                  <Text tone="muted" style={{ fontSize: 20 }}>
                    {' '}
                    / {g.target ?? 0}
                  </Text>
                </Text>
                <IconButton icon="add" label="More" onPress={() => log(1)} bg={c.accent} color={c.accentText} />
              </View>
              {g.unit ? (
                <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
                  {g.unit}
                </Text>
              ) : null}
            </View>
          )}
        </Card>

        <Field label="Why does this matter to you?" placeholder="e.g. So I feel proud of myself" value={g.why ?? ''} onChangeText={(why) => apply({ why })} multiline />

        <Card style={{ gap: space.md }}>
          <View style={styles.row}>
            <Text>Target date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              {g.targetDate && <DateTimeField mode="date" value={g.targetDate} onChange={(targetDate) => apply({ targetDate })} />}
              <Toggle value={!!g.targetDate} onValueChange={(v) => apply({ targetDate: v ? addDays(todayKey(), 30) : null })} />
            </View>
          </View>
        </Card>

        <View style={{ gap: space.sm }}>
          <Label>Track progress by</Label>
          <Segmented<GoalKind>
            options={[
              { value: 'steps', label: 'Small steps', icon: 'list-outline' },
              { value: 'number', label: 'A number', icon: 'stats-chart-outline' },
            ]}
            value={g.kind}
            onChange={(kind) => apply({ kind })}
          />
          {g.kind === 'number' && (
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Target"
                  keyboardType="numeric"
                  value={String(g.target ?? '')}
                  onChangeText={(v) => apply({ target: Math.max(0, Number(v.replace(/[^0-9.]/g, '')) || 0) })}
                />
              </View>
              <View style={{ flex: 1.4 }}>
                <Field label="Unit" placeholder="books, km, £…" value={g.unit ?? ''} onChangeText={(unit) => apply({ unit })} />
              </View>
            </View>
          )}
        </View>

        {existing && habits.length > 0 && (
          <View style={{ gap: space.sm }}>
            <Label>Habits that help</Label>
            {linked.length > 0 && (
              <View style={styles.wrap}>
                {linked.map((h) => (
                  <Chip key={h.id} label={`${h.icon}  ${h.name}`} selected onPress={() => linkHabit(h.id, null)} />
                ))}
              </View>
            )}
            {unlinked.length > 0 && (
              <>
                <Text variant="small" tone="muted">
                  Tap a habit to link it to this goal.
                </Text>
                <View style={styles.wrap}>
                  {unlinked.map((h) => (
                    <Chip key={h.id} label={`${h.icon}  ${h.name}`} onPress={() => linkHabit(h.id, existing.id)} />
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        <View style={{ gap: space.sm }}>
          <Label>Colour</Label>
          <ColorPicker colors={SWATCHES} value={g.color} onChange={(color) => apply({ color })} />
        </View>
        <View style={{ gap: space.sm }}>
          <Label>Icon</Label>
          <IconPicker icons={GOAL_ICONS} value={g.icon} color={g.color} onChange={(icon) => apply({ icon })} />
        </View>

        {!existing && <Button label="Set this goal" icon="flag-outline" onPress={save} disabled={!canSave} />}
        {existing && (
          <Button
            kind="secondary"
            icon="timer-outline"
            label="Focus on this goal for 5 minutes"
            onPress={() => {
              close();
              router.push('/focus');
            }}
          />
        )}
        {existing && (
          <Button
            kind="danger"
            icon="trash-outline"
            label="Delete goal"
            onPress={() =>
              showDialog({
                title: 'Delete goal?',
                message: `“${existing.title}” and its steps will be removed. Linked habits stay.`,
                actions: [{ label: 'Delete', destructive: true, onPress: () => (deleteGoal(existing.id), close()) }],
              })
            }
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  icon: { width: 58, height: 58, borderRadius: 29, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  track: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56 },
  mini: { height: 32, paddingHorizontal: 12, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  addStep: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderTopWidth: 1, marginTop: 2, paddingTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
});
