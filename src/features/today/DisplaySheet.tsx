import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Press, Text, Toggle, type IconName } from '@/components/ui';
import type { PlanDisplay } from '@/store/types';
import { radius, space, useTheme } from '@/theme';

import { setDisplay, useDisplay } from './display';

/** Layout and what shows on Today. Changes apply straight away. */
export function DisplaySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const d = useDisplay();
  const [y] = useState(() => new Animated.Value(0));
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  // Refs are only read inside the gesture callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [drag] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => y.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 110 || g.vy > 0.8) {
          close.current();
          y.setValue(0);
        } else Animated.spring(y, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay }]} onPress={onClose} accessibilityLabel="Close" />
      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: c.bg, maxHeight: height * 0.9, paddingBottom: insets.bottom + space.md, transform: [{ translateY: y }] }]}>
          <View {...drag.panHandlers} style={{ paddingTop: space.sm }}>
            <View style={[styles.grabber, { backgroundColor: c.border }]} />
            <View style={styles.header}>
              <Press onPress={onClose} accessibilityLabel="Close" style={[styles.round, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Icon name="close" size={20} color={c.text} />
              </Press>
              <Text variant="bodyStrong">Display</Text>
              <Press onPress={onClose} accessibilityLabel="Done" style={[styles.round, { backgroundColor: c.accent, borderColor: c.accent }]}>
                <Icon name="checkmark" size={20} color={c.accentText} />
              </Press>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: space.sm, gap: space.sm }}>
            <Group label="Layout">
              <View style={styles.layouts}>
                {(['day', 'week', 'month'] as const).map((k) => (
                  <LayoutOption key={k} kind={k} on={d.layout === k} onPress={() => setDisplay({ layout: k })} />
                ))}
              </View>
              <Divider />
              <Row icon="checkmark-circle-outline" label="Completed plans" value={d.showCompleted} onChange={(v) => setDisplay({ showCompleted: v })} />
              <Divider />
              <Row icon="hourglass-outline" label="Free time between plans" value={d.showFreeTime} onChange={(v) => setDisplay({ showFreeTime: v })} last />
            </Group>
            <Group label="Also on Today">
              <Row icon="flame-outline" label="Habits" value={d.showHabits} onChange={(v) => setDisplay({ showHabits: v })} />
              <Divider />
              <Row icon="stats-chart-outline" label="Streak and focus" value={d.showStats} onChange={(v) => setDisplay({ showStats: v })} />
              <Divider />
              <Row icon="flag-outline" label="Goals" value={d.showGoals} onChange={(v) => setDisplay({ showGoals: v })} last />
            </Group>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: space.sm, marginBottom: space.md }}>
      <Text tone="muted" style={{ marginLeft: space.xs, fontWeight: '500' }}>
        {label}
      </Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>{children}</View>
    </View>
  );
}

function Divider() {
  const { c } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 44 }} />;
}

function Row({ icon, label, value, onChange }: { icon: IconName; label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={styles.row}>
      <Icon name={icon} size={22} color={c.textMuted} />
      <Text style={{ flex: 1 }}>{label}</Text>
      <Toggle value={value} onValueChange={onChange} />
    </View>
  );
}

const LABELS: Record<PlanDisplay['layout'], string> = { day: 'Day', week: 'Week', month: 'Month' };

/** A little phone drawing of each layout. */
function LayoutOption({ kind, on, onPress }: { kind: PlanDisplay['layout']; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const ink = on ? c.accent : c.textFaint;
  return (
    <Press onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${LABELS[kind]} layout`} style={styles.layout}>
      <View style={[styles.phone, { borderColor: ink, backgroundColor: on ? c.accentSoft : 'transparent' }]}>
        {kind === 'day' &&
          [0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: ink }} />
              <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: ink }} />
            </View>
          ))}
        {kind === 'week' &&
          [0, 1, 2].map((i) => (
            <View key={i} style={{ gap: 2 }}>
              <View style={{ width: '45%', height: 2.5, borderRadius: 2, backgroundColor: ink, opacity: 0.6 }} />
              <View style={{ height: 7, borderRadius: 2, backgroundColor: ink }} />
            </View>
          ))}
        {kind === 'month' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2.5 }}>
            {Array.from({ length: 20 }, (_, i) => (
              <View key={i} style={{ width: 5.5, height: 5.5, borderRadius: 1.5, backgroundColor: ink, opacity: i === 9 ? 1 : 0.55 }} />
            ))}
          </View>
        )}
      </View>
      <View style={[styles.layoutLabel, on && { backgroundColor: c.accent }]}>
        <Text variant="small" color={on ? c.accentText : c.text} style={{ fontWeight: '600' }}>
          {LABELS[kind]}
        </Text>
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, width: '100%', maxWidth: 640, alignSelf: 'center', overflow: 'hidden' },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.sm },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.xl, borderWidth: 1, paddingHorizontal: space.lg },
  layouts: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: space.lg },
  layout: { alignItems: 'center', gap: space.sm, width: 84 },
  phone: { width: 46, height: 76, borderRadius: 9, borderWidth: 2, padding: 6, gap: 5, justifyContent: 'flex-start' },
  layoutLabel: { paddingHorizontal: 12, height: 26, borderRadius: 13, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 54 },
});
