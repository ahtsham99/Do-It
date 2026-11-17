import { Screen, Text } from '@/components/ui';
import { BookingLinkCard } from '@/features/shop/BookingLinkCard';

export default function ShareScreen() {
  return (
    <Screen title="Link & QR" subtitle="Clients book here. No app, no account.">
      <BookingLinkCard />
      <Text variant="small" tone="muted" style={{ textAlign: 'center', lineHeight: 20 }}>
        Put the link in your Instagram bio and Google profile. Print the poster for your window or mirror: clients scan it with their phone camera.
      </Text>
    </Screen>
  );
}
