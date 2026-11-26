import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { Glyph, Icon, IconButton, Press, Text, showDialog } from '@/components/ui';
import { ICON_GROUPS } from '@/features/countdowns/iconCatalog';
import { iconRequest } from '@/features/countdowns/iconPick';
import { useSheetTopInset } from '@/hooks/useTopInset';
import { useEntitlements } from '@/lib/premium';
import { radius, space, useTheme } from '@/theme';

const COLS = 5;
const GAP = 10;

/** Choose a countdown icon, grouped by theme. */
export default function IconsScreen() {
  const { c } = useTheme();
  const top = useSheetTopInset();
  const { has } = useEntitlements();
  const unlocked = has('premiumIcons');
  const req = iconRequest();
  const [value, setValue] = useState(req?.value ?? '');
  const accent = req?.color ?? c.accent;
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(ICON_GROUPS[0].id);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const chips = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Record<string, number>>({});
  const chipX = useRef<Record<string, number>>({});
  const jumping = useRef(false);
  const cell = width ? Math.floor((width - GAP * (COLS - 1)) / COLS) : 0;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/countdowns'));
  const pick = (icon: string, premium: boolean) => {
    if (premium && !unlocked) {
      showDialog({
        title: 'Premium icons',
        message: 'Icons with a ✦ come with Do It Premium. Everything you use today stays free.',
        actions: [{ label: 'Sounds good', onPress: () => {} }],
      });
      return;
    }
    setValue(icon);
    req?.onPick(icon);
    close();
  };
  const showChip = (id: string) => chips.current?.scrollTo({ x: Math.max(0, (chipX.current[id] ?? 0) - 16), animated: true });
  const jump = (id: string) => {
    setActive(id);
    showChip(id);
    jumping.current = true;
    scroll.current?.scrollTo({ y: Math.max(0, (offsets.current[id] ?? 0) - 8), animated: true });
    setTimeout(() => (jumping.current = false), 500);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (jumping.current) return;
    const y = e.nativeEvent.contentOffset.y + 40;
    let now = ICON_GROUPS[0].id;
    for (const g of ICON_GROUPS) if ((offsets.current[g.id] ?? Infinity) <= y) now = g.id;
    if (now !== active) {
      setActive(now);
      showChip(now);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: top }}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={close} />
        <Text style={styles.title}>Icon</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView ref={chips} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0, flexShrink: 0, height: 58 }}>
        {ICON_GROUPS.map((g) => {
          const on = g.id === active;
          return (
            <Press
              key={g.id}
              onLayout={(e) => (chipX.current[g.id] = e.nativeEvent.layout.x)}
              onPress={() => jump(g.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.chip, { backgroundColor: on ? c.accent : c.surface, borderColor: on ? c.accent : c.border }]}>
              <Icon name={g.icon} size={16} color={on ? c.accentText : c.text} />
              <Text variant="small" color={on ? c.accentText : c.text} style={{ fontWeight: '600' }}>
                {g.label}
              </Text>
            </Press>
          );
        })}
      </ScrollView>

      <ScrollView ref={scroll} onScroll={onScroll} scrollEventThrottle={32} contentContainerStyle={styles.body}>
        <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {ICON_GROUPS.map((g) => (
            <View key={g.id} onLayout={(e) => (offsets.current[g.id] = e.nativeEvent.layout.y)} style={{ marginBottom: space.xl }}>
              <Text style={styles.section}>{g.label}</Text>
              <View style={styles.grid}>
                {[...g.free.map((i) => [i, false] as const), ...g.premium.map((i) => [i, true] as const)].map(([i, premium]) => {
                  const sel = i === value;
                  return (
                    <Press
                      key={i}
                      onPress={() => pick(i, premium)}
                      accessibilityLabel={premium && !unlocked ? `${i}, premium` : i}
                      accessibilityState={{ selected: sel }}
                      style={[styles.cell, { width: cell, height: cell, borderRadius: Math.round(cell * 0.3), backgroundColor: c.surface, borderColor: sel ? accent : c.border }]}>
                      <Glyph value={i} size={Math.round(cell * 0.46) || 28} color={c.text} />
                      {premium && (
                        <View style={styles.badge}>
                          <Icon name="sparkles" size={12} color="#E8B53A" />
                        </View>
                      )}
                    </Press>
                  );
                })}
              </View>
            </View>
          ))}
          {!unlocked && (
            <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
              Icons with a ✦ come with Premium.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.sm },
  title: { fontSize: 20, fontWeight: '700' },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 1 },
  body: { padding: space.lg, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  section: { fontSize: 20, fontWeight: '600', marginBottom: space.md, opacity: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 6, right: 6 },
});
