import { View } from 'react-native';

import { Card, Chip, Label, Stepper, Text, Toggle } from '@/components/ui';
import { formatMoney } from '@/lib/dates';
import { policyLines } from '@/features/booking/wording';
import { updatePolicies } from '@/store/actions/shop';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

const WINDOWS = [
  { h: 0, label: 'Any time' },
  { h: 2, label: '2 hrs' },
  { h: 12, label: '12 hrs' },
  { h: 24, label: '24 hrs' },
  { h: 48, label: '48 hrs' },
];

/** Deposit toggle + amount, free-cancellation window, and a live preview of what clients read. */
export function PoliciesForm() {
  const p = useStore((s) => s.policies);
  const { c } = useTheme();
  return (
    <View style={{ gap: space.lg }}>
      <Card style={{ gap: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="heading">Take a deposit</Text>
            <Text variant="small" tone="muted">
              Clients pay a little when they book. It comes off their bill and puts off no-shows.
            </Text>
          </View>
          <Toggle accessibilityLabel="Take a deposit" value={p.depositEnabled} onValueChange={(depositEnabled) => updatePolicies({ depositEnabled })} />
        </View>
        {p.depositEnabled && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text tone="muted">Amount</Text>
            <Stepper
              label="deposit"
              value={p.depositAmount}
              onChange={(depositAmount) => updatePolicies({ depositAmount })}
              step={100}
              min={100}
              max={5000}
              format={formatMoney}
            />
          </View>
        )}
      </Card>

      <Card style={{ gap: space.md }}>
        <Text variant="heading">Free cancellation</Text>
        <Text variant="small" tone="muted">
          How long before the appointment clients can cancel or move it{p.depositEnabled ? ' and still get their deposit back' : ''}.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {WINDOWS.map((w) => (
            <Chip key={w.h} label={w.label} selected={p.cancelHours === w.h} onPress={() => updatePolicies({ cancelHours: w.h })} />
          ))}
        </View>
      </Card>

      <View style={{ gap: space.sm }}>
        <Label>What clients see before booking</Label>
        <View style={{ padding: space.lg, borderRadius: 20, backgroundColor: c.accentSoft, gap: space.sm }}>
          {policyLines(p.depositEnabled ? p.depositAmount : 0, p.cancelHours).map((l) => (
            <Text key={l} variant="small" style={{ lineHeight: 20 }}>
              {l}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
