import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Card, ListRow, Screen, Section, Segmented, Text, showDialog } from '@/components/ui';
import { WEEKDAYS, formatMoney, todayKey } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { hoursLabel } from '@/features/booking/rules';
import { loadSampleData, resetEverything } from '@/store/actions/sample';
import { updateSettings } from '@/store/actions/shop';
import { useServices, useTimeOff } from '@/store/hooks';
import { useStore } from '@/store/store';
import type { ThemePreference } from '@/store/types';
import { space } from '@/theme';

export default function ShopSettings() {
  const shop = useStore((s) => s.shop);
  const hours = useStore((s) => s.hours);
  const policies = useStore((s) => s.policies);
  const theme = useStore((s) => s.settings.theme);
  const messages = useStore((s) => s.messages);
  const services = useServices();
  const timeOff = useTimeOff();
  const today = todayKey();
  const upcomingOff = timeOff.filter((t) => t.end >= today).length;
  const openDays = hours.map((h, i) => (h.open ? WEEKDAYS[i].slice(0, 3) : null)).filter(Boolean);
  const now = useNow();
  const pending = messages.filter((m) => !m.cancelled && m.sendAt > now).length;

  return (
    <Screen title="Shop">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Avatar name={shop.name} photo={shop.photo} size={64} strong />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading" style={{ fontSize: 20 }}>{shop.name}</Text>
          <Text variant="small" tone="muted" numberOfLines={2}>{shop.address || 'No address yet'}</Text>
        </View>
      </Card>

      <Section title="Your shop">
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          <ListRow icon="storefront-outline" label="Profile" detail="Name, address, photo, bio" onPress={() => router.push('/edit/profile')} />
          <ListRow icon="cut-outline" label="Services & prices" detail={`${services.length} service${services.length === 1 ? '' : 's'}`} onPress={() => router.push('/edit/services')} />
          <ListRow icon="time-outline" label="Working hours" detail={openDays.length ? `Open ${openDays.join(', ')}` : 'Closed every day'} onPress={() => router.push('/edit/hours')} />
          <ListRow icon="moon-outline" label="Days off & holidays" detail={upcomingOff ? `${upcomingOff} coming up` : 'None booked'} onPress={() => router.push('/edit/time-off')} last />
        </Card>
      </Section>

      <Section title="Booking rules">
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          <ListRow
            icon="card-outline"
            label="Deposit & cancellations"
            detail={`${policies.depositEnabled ? `${formatMoney(policies.depositAmount)} deposit` : 'No deposit'} · free cancellation ${policies.cancelHours ? `up to ${hoursLabel(policies.cancelHours)} before` : 'any time'}`}
            onPress={() => router.push('/edit/policies')}
          />
          <ListRow icon="chatbubbles-outline" label="Texts to clients" detail={`Confirmations, reminders and cancellations · ${pending} scheduled`} onPress={() => router.push('/messages')} last />
        </Card>
      </Section>

      <Section title="Appearance">
        <Segmented<ThemePreference>
          value={theme}
          onChange={(t) => updateSettings({ theme: t })}
          options={[
            { value: 'system', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </Section>

      <Section title="Testing">
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          <ListRow
            icon="refresh-outline"
            label="Reload sample shop"
            detail="Replaces your data with Fade & Co."
            onPress={() =>
              showDialog({ title: 'Load the sample shop?', message: 'This replaces everything on this device.', actions: [{ label: 'Load sample data', destructive: true, onPress: loadSampleData }] })
            }
          />
          <ListRow
            icon="trash-outline"
            danger
            last
            label="Start again"
            detail="Erase everything and run setup"
            onPress={() =>
              showDialog({
                title: 'Erase everything?',
                message: 'Shop, services, bookings and clients on this device will be deleted.',
                actions: [{ label: 'Erase and start again', destructive: true, onPress: async () => (await resetEverything(), router.replace('/')) }],
              })
            }
          />
        </Card>
        <Text variant="small" tone="faint" style={{ textAlign: 'center' }}>
          All times are UK time · Chair 1.0
        </Text>
      </Section>
    </Screen>
  );
}
