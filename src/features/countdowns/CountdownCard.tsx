import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Glyph, Press, SwipeToDelete, Text } from '@/components/ui';
import { deleteCountdownWithUndo } from '@/features/delete/deleteWithUndo';
import { formatDay } from '@/lib/dates';
import type { Countdown } from '@/store/types';
import { SERIF, radius, space, useTheme } from '@/theme';

import { countdownLabel, daysUntil } from './logic';
import { t } from '@/lib/i18n';

const WHITE = '#FFFFFF';
const SOFT = 'rgba(255,255,255,0.72)';

/** Coloured countdown card. `hero` is the large "Next up" version on Today. */
export function CountdownCard({ item, hero, flat }: { item: Countdown; hero?: boolean; flat?: boolean }) {
  const { c, paint } = useTheme();
  const fill = paint(item.color, 'fill');
  const days = daysUntil(item);
  const past = days < 0;
  const { big, small } = countdownLabel(days);
  const open = () => router.push({ pathname: '/countdown', params: { id: item.id } });
  const shadow = { boxShadow: `0px 10px 24px ${c.shadow}` };

  if (hero) {
    return (
      <Press onPress={open} style={[styles.hero, { backgroundColor: fill }, !flat && shadow]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text variant="caption" color={SOFT} style={{ textTransform: 'uppercase' }}>
            {t('Next up')}
          </Text>
          <View style={styles.heroIcon}>
            <Glyph value={item.icon} size={18} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm, flexWrap: 'wrap', marginTop: -space.sm }}>
          <Text color={WHITE} style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 48 }}>
            {big}
          </Text>
          <Text color={WHITE} style={{ fontSize: 16, flexShrink: 1 }} numberOfLines={2}>
            {days === 0 ? `is ${item.title}` : `${days === 1 ? 'day' : 'days'} to ${item.title}`}
          </Text>
        </View>
        <Text variant="small" color={SOFT}>
          {formatDay(item.date, { relative: false })}
        </Text>
      </Press>
    );
  }

  return (
    <SwipeToDelete onDelete={() => deleteCountdownWithUndo(item)}>
    <Press onPress={open} style={[styles.row, { backgroundColor: fill, opacity: past ? 0.7 : 1 }, shadow]}>
      <View style={styles.tile}>
        <Glyph value={item.icon} size={26} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text color={WHITE} style={{ fontSize: 19 }} numberOfLines={2}>
          {item.title}
        </Text>
        <Text variant="caption" color={SOFT} style={{ textTransform: 'uppercase' }}>
          {formatDay(item.date, { relative: false })}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text color={WHITE} style={{ fontFamily: SERIF, fontSize: days === 0 ? 30 : 40, lineHeight: 44 }}>
          {big}
        </Text>
        {small ? (
          <Text color={SOFT} style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
            {small}
          </Text>
        ) : null}
      </View>
    </Press>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, paddingHorizontal: space.xl - 4, paddingVertical: space.lg, gap: space.sm, minHeight: 128, justifyContent: 'space-between' },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.lg + 2,
    paddingRight: space.xl,
    borderRadius: radius.xl,
  },
  tile: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
