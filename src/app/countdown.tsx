import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { useSheetTopInset } from '@/hooks/useTopInset';
import { ColorPicker, DateTimeField } from '@/components/pickers';
import { Button, Card, Chip, Field, Glyph, Icon, Label, Press, SheetHeader, Text, showDialog } from '@/components/ui';
import { openIconPicker } from '@/features/countdowns/iconPick';
import { CATEGORY_DEFAULTS, DEFAULT_CATEGORIES, countdownLabel, daysUntil } from '@/features/countdowns/logic';
import { addDays, todayKey } from '@/lib/dates';
import { useEntitlements } from '@/lib/premium';
import { addCountdown, deleteCountdown, updateCountdown } from '@/store/actions/countdowns';
import { useCountdowns } from '@/store/hooks';
import { useStore } from '@/store/store';
import { NIGHT_COLORS, PREMIUM_COLORS, SWATCHES, radius, space, useTheme } from '@/theme';

export default function CountdownEditor() {
  const { c, paint } = useTheme();
  const premiumColours = useEntitlements().has('themes');
  const sheetTop = useSheetTopInset();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useStore((s) => s.countdowns.find((x) => x.id === id));
  const all = useCountdowns();

  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(existing?.date ?? addDays(todayKey(), 14));
  const [category, setCategory] = useState(existing?.category ?? 'Exams');
  const [icon, setIcon] = useState<string>(existing?.icon ?? CATEGORY_DEFAULTS.Exams.icon);
  const [color, setColor] = useState(existing?.color ?? CATEGORY_DEFAULTS.Exams.color);
  const [touchedLook, setTouchedLook] = useState(!!existing);
  const [custom, setCustom] = useState('');

  const categories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...all.map((x) => x.category), category])],
    [all, category],
  );

  const chooseCategory = (cat: string) => {
    setCategory(cat);
    // Until the user picks their own look, follow the category's default.
    const d = CATEGORY_DEFAULTS[cat];
    if (d && !touchedLook) {
      setIcon(d.icon);
      setColor(d.color);
    }
  };

  const canSave = title.trim().length > 0;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/countdowns'));
  const save = () => {
    if (!canSave) return;
    const data = { title: title.trim(), date, category, icon, color };
    if (existing) updateCountdown(existing.id, data);
    else addCountdown(data);
    close();
  };

  const preview = countdownLabel(daysUntil({ date } as never));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={existing ? 'Edit countdown' : 'New countdown'} onSave={save} canSave={canSave} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Press
            onPress={() => openIconPicker({ value: icon, color: paint(color), onPick: (v) => (setIcon(v), setTouchedLook(true)) })}
            accessibilityRole="button"
            accessibilityLabel="Change icon"
            style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 3, borderColor: paint(color), backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Glyph value={icon} size={26} color={paint(color)} />
            <View style={{ position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: paint(color), borderWidth: 2, borderColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="pencil" size={11} color="#FFFFFF" />
            </View>
          </Press>
          <View style={{ flex: 1 }}>
            <Field placeholder="What are you counting down to?" value={title} onChangeText={setTitle} autoFocus={!existing} />
          </View>
        </View>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text>Date</Text>
            <Text variant="small" tone="muted">
              {preview.big} {preview.small}
            </Text>
          </View>
          <DateTimeField mode="date" value={date} onChange={setDate} />
        </Card>

        <View style={{ gap: space.sm }}>
          <Label>Category</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {categories.map((cat) => (
              <Chip key={cat} label={cat} selected={category === cat} onPress={() => chooseCategory(cat)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Field placeholder="New category…" value={custom} onChangeText={setCustom} onSubmitEditing={() => custom.trim() && (chooseCategory(custom.trim()), setCustom(''))} />
            </View>
            <Button small kind="secondary" label="Add" disabled={!custom.trim()} onPress={() => (chooseCategory(custom.trim()), setCustom(''))} style={{ height: 50, borderRadius: radius.md }} />
          </View>
        </View>

        <View style={{ gap: space.sm }}>
          <Label>Colour</Label>
          <ColorPicker colors={SWATCHES} value={color} onChange={(v) => (setColor(v), setTouchedLook(true))} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.xs }}>
            <Icon name="sparkles" size={12} color="#E8B53A" />
            <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', fontSize: 11 }}>
              Premium colours
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PREMIUM_COLORS.map((k) => {
              const col = NIGHT_COLORS[k].shades![2];
              const on = color.toLowerCase() === col.toLowerCase();
              return (
                <Press
                  key={k}
                  onPress={() =>
                    premiumColours
                      ? (setColor(col), setTouchedLook(true))
                      : showDialog({
                          title: 'Premium colours',
                          message: `${NIGHT_COLORS[k].label} and the other palette colours come with Do It Premium. Everything you use today stays free.`,
                          actions: [{ label: 'Sounds good', onPress: () => {} }],
                        })
                  }
                  accessibilityLabel={`${NIGHT_COLORS[k].label}${premiumColours ? '' : ', premium'}`}
                  accessibilityState={{ selected: on }}
                  style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, padding: 3, borderColor: on ? c.text : 'transparent' }}>
                  <View style={{ flex: 1, borderRadius: 20, backgroundColor: col, alignItems: 'center', justifyContent: 'center' }}>
                    {!premiumColours && <Icon name="lock-closed" size={12} color="rgba(255,255,255,0.85)" />}
                  </View>
                </Press>
              );
            })}
          </View>
        </View>


        <Button label={existing ? 'Save changes' : 'Add countdown'} onPress={save} disabled={!canSave} />
        {existing && (
          <Button
            kind="danger"
            icon="trash-outline"
            label="Delete countdown"
            onPress={() =>
              showDialog({
                title: 'Delete countdown?',
                message: `“${existing.title}” will be removed.`,
                actions: [{ label: 'Delete', destructive: true, onPress: () => (deleteCountdown(existing.id), close()) }],
              })
            }
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
