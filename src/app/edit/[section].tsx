import { Redirect, useLocalSearchParams } from 'expo-router';

import { ModalScreen, Text } from '@/components/ui';
import { HoursEditor } from '@/features/shop/HoursEditor';
import { PoliciesForm } from '@/features/shop/PoliciesForm';
import { ProfileForm } from '@/features/shop/ProfileForm';
import { ServicesEditor } from '@/features/shop/ServicesEditor';
import { TimeOffEditor } from '@/features/shop/TimeOffEditor';

const SECTIONS = {
  profile: { title: 'Shop profile', body: <ProfileForm /> },
  services: { title: 'Services & prices', body: <ServicesEditor /> },
  hours: {
    title: 'Working hours',
    body: (
      <>
        <HoursEditor />
        <Text variant="small" tone="muted" style={{ marginLeft: 2 }}>
          All times are UK time. For lunch or a one-off gap, block time on the calendar instead.
        </Text>
      </>
    ),
  },
  'time-off': { title: 'Days off & holidays', body: <TimeOffEditor /> },
  policies: { title: 'Deposit & cancellations', body: <PoliciesForm /> },
} as const;

export default function EditSection() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const s = SECTIONS[section as keyof typeof SECTIONS];
  if (!s) return <Redirect href="/settings" />;
  return <ModalScreen title={s.title}>{s.body}</ModalScreen>;
}
