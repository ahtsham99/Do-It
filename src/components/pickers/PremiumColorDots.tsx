import { View } from 'react-native';

import { Icon, Press, showDialog } from '@/components/ui';
import { useEntitlements } from '@/lib/premium';
import { NIGHT_COLORS, PREMIUM_COLORS, useTheme } from '@/theme';

/** One rich shade from each premium palette, locked on the free plan. Sits inside a ColorPicker. */
export function PremiumColorDots({ value, onChange }: { value?: string | null; onChange: (col: string) => void }) {
  const { c } = useTheme();
  const unlocked = useEntitlements().has('themes');
  return (
    <>
        {PREMIUM_COLORS.map((k) => {
          const col = NIGHT_COLORS[k].shades![2];
          const on = (value ?? '').toLowerCase() === col.toLowerCase();
          return (
            <Press
              key={k}
              onPress={() =>
                unlocked
                  ? onChange(col)
                  : showDialog({
                      title: 'Premium colours',
                      message: `${NIGHT_COLORS[k].label} and the other palette colours come with Do It Premium. Everything you use today stays free.`,
                      actions: [{ label: 'Sounds good', onPress: () => {} }],
                    })
              }
              accessibilityLabel={`${NIGHT_COLORS[k].label}${unlocked ? '' : ', premium'}`}
              accessibilityState={{ selected: on }}
              style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, padding: 3, borderColor: on ? c.text : 'transparent' }}>
              <View style={{ flex: 1, borderRadius: 20, backgroundColor: col, alignItems: 'center', justifyContent: 'center' }}>
                {!unlocked && <Icon name="lock-closed" size={12} color="rgba(255,255,255,0.85)" />}
              </View>
            </Press>
          );
        })}
    </>
  );
}
