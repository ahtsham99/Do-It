import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Card, Glow, Icon, Label, ListRow, Press, SheetHeader, Text, showDialog, showToast } from '@/components/ui';
import { useNudges } from '@/features/nudges/useNudges';
import { PERSONAS } from '@/features/onboarding/suggestions';
import { AboutYou } from '@/features/profile/AboutYou';
import { Avatar, isPhoto } from '@/features/profile/Avatar';
import { milestones } from '@/features/profile/milestones';
import { pickProfilePhoto } from '@/features/profile/pickPhoto';
import { useSheetTopInset } from '@/hooks/useTopInset';
import { pickBackup, saveBackup } from '@/lib/backup';
import { PREMIUM_AVAILABLE, useEntitlements } from '@/lib/premium';
import { updateSettings } from '@/store/actions/settings';
import { useGoals, useHabits, useReminders, useSettings, useTasks } from '@/store/hooks';
import { restoreAll, useStore } from '@/store/store';
import { SERIF, radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

const EMOJIS = ['🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐧', '🦉', '🐙', '🦋', '🌻', '🌙', '⭐', '🔥', '🌊', '🍀', '🎧', '📚', '☕', '🚀', '🎨', '⚽', '🧠', '😊'];

/** Profile: who you are, what you've done, and your data. */
export default function ProfileScreen() {
  const { c, fonts } = useTheme();
  const sheetTop = useSheetTopInset();
  const s = useSettings();
  const n = useNudges();
  const tasks = useTasks();
  const habits = useHabits();
  const goals = useGoals();
  const reminders = useReminders();
  const sessions = useStore((x) => x.sessions);
  const activeDays = useStore((x) => x.stats.activeDays);
  const { isPremium } = useEntitlements();
  const [emojiOpen, setEmojiOpen] = useState(false);

  const totals = useMemo(
    () => ({
      plansDone: tasks.reduce((sum, t) => sum + t.completedDates.length, 0),
      checkIns: habits.reduce((sum, h) => sum + h.history.length, 0),
      focusMin: sessions.filter((x) => x.mode === 'focus' && !x.deletedAt).reduce((m, x) => m + x.minutes, 0),
      remindersDone: reminders.filter((r) => r.done).length,
      bestStreak: n.bestStreak,
      goalsDone: goals.filter((g) => g.completedAt).length,
    }),
    [tasks, habits, sessions, reminders, goals, n.bestStreak],
  );
  const badges = useMemo(() => milestones(totals), [totals]);
  const earned = badges.filter((b) => b.done).length;

  // "With Do It since …": the first day you showed up or added something.
  const since = useMemo(() => {
    const times = [...activeDays.map((d) => new Date(`${d}T12:00:00`).getTime()), ...tasks.map((t) => t.createdAt)].filter((x) => x > 1_577_836_800_000); // ignore missing or placeholder dates (before 2020)
    if (!times.length) return '';
    const d = new Date(Math.min(...times));
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [activeDays, tasks]);

  const persona = PERSONAS.find((p) => p.value === s.persona);
  const focus = totals.focusMin >= 60 ? t('{h}h', { h: Math.floor(totals.focusMin / 60) }) : t('{m}m', { m: totals.focusMin });

  const choosePhoto = async () => {
    try {
      const uri = await pickProfilePhoto();
      if (uri) {
        updateSettings({ avatar: uri });
        setEmojiOpen(false);
      }
    } catch {
      showToast(t('Couldn’t open that photo'), 'alert-circle-outline');
    }
  };
  const editAvatar = () =>
    showDialog({
      title: t('Profile picture'),
      actions: [
        { label: t('Choose a photo'), onPress: choosePhoto },
        { label: t('Pick an emoji'), onPress: () => setEmojiOpen(true) },
        ...(s.avatar ? [{ label: isPhoto(s.avatar) ? t('Remove photo') : t('Use my initials'), onPress: () => updateSettings({ avatar: '' }) }] : []),
      ],
    });

  const backup = async () => {
    try {
      await saveBackup();
    } catch {
      showToast(t('Couldn’t save the backup'), 'alert-circle-outline');
    }
  };
  const restore = async () => {
    const text = await pickBackup().catch(() => null);
    if (!text) return;
    showDialog({
      title: t('Restore this backup?'),
      message: t('Everything on this phone will be replaced with what’s in the backup.'),
      actions: [
        {
          label: t('Restore'),
          destructive: true,
          onPress: async () => {
            try {
              const r = await restoreAll(text);
              showToast(t('Restored {tasks} plans and {habits} habits', { tasks: r.tasks, habits: r.habits }));
            } catch (e) {
              showToast((e as Error).message, 'alert-circle-outline');
            }
          },
        },
      ],
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Glow height={420} />
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={t('Profile')} cancelLabel={t('Close')} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {/* Who you are */}
        <View style={{ alignItems: 'center', gap: space.sm }}>
          <Press onPress={editAvatar} accessibilityRole="button" accessibilityLabel={t('Change profile picture')}>
            <Avatar size={108} ring />
            <View style={[styles.edit, { backgroundColor: c.accent, borderColor: c.bg }]}>
              <Icon name="camera" size={14} color={c.accentText} />
            </View>
          </Press>
          {emojiOpen && (
            <Card style={styles.emojis}>
              {EMOJIS.map((e) => (
                <Press
                  key={e}
                  onPress={() => (updateSettings({ avatar: e }), setEmojiOpen(false))}
                  accessibilityLabel={e}
                  style={[styles.emoji, { backgroundColor: s.avatar === e ? c.accentSoft : 'transparent' }]}>
                  <Text style={{ fontSize: 24 }}>{e}</Text>
                </Press>
              ))}
            </Card>
          )}
          <TextInput
            value={s.name}
            onChangeText={(name) => updateSettings({ name })}
            placeholder={t('Your name')}
            placeholderTextColor={c.textFaint}
            accessibilityLabel={t('Your name')}
            returnKeyType="done"
            style={[styles.name, { color: c.text, fontFamily: fonts.display }, { outlineStyle: 'none' } as object]}
          />
          <Text tone="muted" style={{ textAlign: 'center' }}>
            {[s.persona === 'other' && s.personaLabel.trim() ? s.personaLabel.trim() : persona && persona.value !== 'other' ? t(persona.label) : null, since ? t('with Do It since {date}', { date: since }) : null].filter(Boolean).join(' · ') || t('Tap your name to change it')}
          </Text>
          {n.bestStreak > 0 && (
            <View style={[styles.pill, { backgroundColor: c.accentSoft }]}>
              <Text variant="small" color={c.accent} style={{ fontWeight: '600' }}>
                🔥 {t('{n}-day streak', { n: n.streak })}{n.bestStreak > n.streak ? ` · ${t('best {n}', { n: n.bestStreak })}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Your why */}
        <View style={{ gap: space.sm }}>
          <Label>{t('Your why')}</Label>
          <Card style={{ gap: space.xs }}>
            <TextInput
              value={s.why}
              onChangeText={(why) => updateSettings({ why })}
              placeholder={t('Why are you using Do It? e.g. Finish uni without the last-minute panic.')}
              placeholderTextColor={c.textFaint}
              multiline
              maxLength={140}
              accessibilityLabel={t('Your why')}
              style={[styles.why, { color: c.text, fontFamily: fonts.display }, { outlineStyle: 'none' } as object]}
            />
            <Text variant="small" tone="muted">
              {t('We’ll show this on Today when things pile up.')}
            </Text>
          </Card>
        </View>

        {/* All time */}
        <View style={{ gap: space.sm }}>
          <Label>{t('All time')}</Label>
          <View style={styles.grid}>
            <Stat value={String(totals.plansDone)} label={t('Plans done')} />
            <Stat value={String(totals.checkIns)} label={t('Habit check-ins')} />
            <Stat value={focus} label={t('Focused')} />
            <Stat value={String(totals.remindersDone)} label={t('Reminders done')} />
          </View>
        </View>

        {/* Milestones */}
        <View style={{ gap: space.sm }}>
          <Label>{t('Milestones · {earned} of {n}', { earned, n: badges.length })}</Label>
          <Card padded={false}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badges}>
              {badges.map((b) => (
                <View key={b.id} style={styles.badge} accessibilityLabel={`${t(b.label)}${b.done ? t(', earned') : t(', not yet')}`}>
                  <View style={[styles.badgeIcon, { backgroundColor: b.done ? b.tint : c.surfaceAlt, opacity: b.done ? 1 : 0.55 }]}>
                    <Text style={{ fontSize: 26, opacity: b.done ? 1 : 0.35 }}>{b.icon}</Text>
                  </View>
                  {!b.done && (
                    <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
                      <View style={{ width: `${Math.max(6, b.progress * 100)}%`, height: '100%', borderRadius: 2, backgroundColor: c.accent }} />
                    </View>
                  )}
                  <Text variant="small" tone={b.done ? 'default' : 'muted'} numberOfLines={2} style={{ fontSize: 11, textAlign: 'center' }}>
                    {t(b.label)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card>
        </View>

        <AboutYou />

        {/* Plan: hidden until Premium can be bought. */}
        {PREMIUM_AVAILABLE && (
          <View style={{ gap: space.sm }}>
            <Label>{t('Plan')}</Label>
            <View style={[styles.plan, { backgroundColor: c.accent }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text color={c.accentText} style={{ fontWeight: '700', fontSize: 16 }}>
                  {isPremium ? t('Premium') : t('Free plan')}
                </Text>
                <Text variant="small" color={c.accentText} style={{ opacity: 0.8 }}>
                  {isPremium ? t('Thanks for supporting Do It.') : t('Premium palettes, icons and sync are coming.')}
                </Text>
              </View>
              {!isPremium && (
                <Press
                  onPress={() =>
                    showDialog({
                      title: t('Premium is coming'),
                      message: t('Sync across devices, more themes and icons, and deeper stats. Everything you use today stays free.'),
                      actions: [{ label: t('Sounds good'), onPress: () => {} }],
                    })
                  }
                  style={[styles.planBtn, { backgroundColor: c.accentText }]}>
                  <Text variant="small" color={c.accent} style={{ fontWeight: '700' }}>
                    {t('See Premium')}
                  </Text>
                </Press>
              )}
            </View>
          </View>
        )}

        {/* Shortcuts */}
        <Card padded={false} style={{ paddingHorizontal: space.xl - 4 }}>
          <ListRow icon="bulb-outline" label={t('Suggested habits and reminders')} onPress={() => router.push('/suggestions')} />
          <ListRow icon="flame-outline" label={t('Your streak')} onPress={() => router.push('/streaks')} />
          <ListRow icon="stats-chart-outline" label={t('Your history')} last onPress={() => router.push('/history')} />
        </Card>

        {/* Your data */}
        <View style={{ gap: space.sm }}>
          <Label>{t('Your data')}</Label>
          <Card padded={false} style={{ paddingHorizontal: space.xl - 4 }}>
            <ListRow icon="download-outline" label={t('Back up to a file')} onPress={backup} />
            <ListRow icon="push-outline" label={t('Restore from a backup')} last onPress={restore} />
          </Card>
          <Text variant="small" tone="muted">
            Everything lives on this {Platform.OS === 'web' ? 'device' : 'phone'}. A backup keeps it safe if you switch phones or clear your browser.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 38 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl - 4, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  edit: { position: 'absolute', right: 2, bottom: 2, width: 32, height: 32, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  emojis: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, padding: space.sm, marginTop: space.xs },
  emoji: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 40, lineHeight: 48, textAlign: 'center', minWidth: 200, paddingVertical: 0 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  why: { fontSize: 22, lineHeight: 28, fontStyle: 'italic', minHeight: 56, paddingVertical: 0, textAlignVertical: 'top' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: { flexBasis: '45%', flexGrow: 1, gap: 2 },
  badges: { gap: space.md, padding: space.lg },
  badge: { width: 76, alignItems: 'center', gap: 6 },
  badgeIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  track: { width: 44, height: 4, borderRadius: 2, overflow: 'hidden' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.xl },
  planBtn: { paddingHorizontal: 14, height: 36, borderRadius: 18, justifyContent: 'center' },
});
