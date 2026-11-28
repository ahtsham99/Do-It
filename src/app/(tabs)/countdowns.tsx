import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Empty, Fab, Field, Icon, IconButton, Press, Screen, Section, Segmented, Text, showDialog } from '@/components/ui';
import { useTabBarBottom } from '@/hooks/useTopInset';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { groupCountdowns } from '@/features/countdowns/logic';
import { todayKey } from '@/lib/dates';
import { useCountdowns } from '@/store/hooks';
import { TAB_BAR_SPACE, cardShadow, radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

type When = 'future' | 'past';

export default function CountdownsScreen() {
  const { c } = useTheme();
  const tabBottom = useTabBarBottom();
  const items = useCountdowns();
  const today = todayKey();
  const [when, setWhen] = useState<When>('future');
  const [category, setCategory] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const futureCount = items.filter((x) => x.date >= today).length;
  const categories = useMemo(() => [...new Set(items.map((x) => x.category))].sort(), [items]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = items.filter(
      (x) =>
        (when === 'future' ? x.date >= today : x.date < today) &&
        (!category || x.category === category) &&
        (!q || x.title.toLowerCase().includes(q)),
    );
    return groupCountdowns(visible, today);
  }, [items, when, category, query, today]);

  const add = () => router.push('/countdown');
  const chooseCategory = () =>
    showDialog({
      title: t('Show'),
      actions: [
        { label: t('All events'), onPress: () => setCategory(null) },
        ...categories.map((cat) => ({ label: cat, onPress: () => setCategory(cat) })),
      ],
    });

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title={t('Countdowns')}
        subtitle={t('The days worth watching')}
        contentStyle={{ paddingBottom: TAB_BAR_SPACE + tabBottom + 160 }}
        right={
          <>
            <IconButton
              icon={searching ? 'close' : 'search'}
              label={t('Search')}
              size={20}
              onPress={() => {
                setSearching(!searching);
                setQuery('');
              }}
            />
            <IconButton icon="close" label={t('Close')} size={20} onPress={() => (router.canGoBack() ? router.back() : router.replace({ pathname: '/habits', params: { view: 'goals' } }))} />
          </>
        }>
        {searching && <Field placeholder={t('Search countdowns…')} value={query} onChangeText={setQuery} autoFocus />}

        {items.length > 0 && (
          <Press onPress={chooseCategory} style={[styles.filter, { backgroundColor: c.surface, borderColor: c.border, ...cardShadow(c) }]}>
            <Text style={{ fontSize: 17 }}>{category ?? 'All events'}</Text>
            <Icon name="chevron-down" size={18} color={c.textMuted} />
          </Press>
        )}

        {items.length === 0 ? (
          <Empty
            icon="hourglass-outline"
            title={t('Nothing to count down to')}
            body={t('Add exams, appointments, trips and birthdays, and watch the days drop.')}
            action={t('Add a countdown')}
            onAction={add}
          />
        ) : groups.length === 0 ? (
          <Text tone="muted" style={{ textAlign: 'center', paddingVertical: space.xl }}>
            {query ? t('No matches.') : when === 'future' ? 'Nothing coming up here.' : 'Nothing in the past yet.'}
          </Text>
        ) : (
          groups.map((g) => (
            <Section key={g.category} title={category ? undefined : g.category}>
              <View style={{ gap: space.md }}>
                {g.items.map((x) => (
                  <CountdownCard key={x.id} item={x} />
                ))}
              </View>
            </Section>
          ))
        )}
      </Screen>

      <Fab label={t('Add countdown')} onPress={add} lift={items.length > 0 ? 62 : 0} />
      {items.length > 0 && (
        <View pointerEvents="box-none" style={[styles.when, { bottom: TAB_BAR_SPACE + tabBottom - 2 }]}>
          <View style={{ width: '100%', maxWidth: 600 }}>
            <Segmented
              tone="ink"
              value={when}
              onChange={setWhen}
              options={[
                { value: 'future', label: t('Future'), badge: futureCount },
                { value: 'past', label: t('Past'), badge: items.length - futureCount },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 58,
    paddingHorizontal: space.xl - 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  when: { position: 'absolute', left: 0, right: 0, paddingHorizontal: space.xl - 4, alignItems: 'center' },
});
