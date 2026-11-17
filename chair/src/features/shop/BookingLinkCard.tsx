import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { bookingUrl, prettyUrl } from '@/lib/links';
import { copyLink, shareLink } from '@/lib/share';
import { useStore } from '@/store/store';
import { space } from '@/theme';

import { QrCode } from './QrCode';

export function BookingLinkCard() {
  const shop = useStore((s) => s.shop);
  const url = bookingUrl(shop.slug);
  return (
    <Card style={{ alignItems: 'center', gap: space.lg }}>
      <QrCode value={url} size={210} />
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
          Your booking link
        </Text>
        <Text variant="bodyStrong" selectable style={{ textAlign: 'center' }}>
          {prettyUrl(url)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' }}>
        <Button kind="secondary" icon="copy-outline" label="Copy" onPress={() => copyLink(url)} style={{ flex: 1 }} />
        <Button kind="secondary" icon="share-outline" label="Share" onPress={() => shareLink(url, `Book at ${shop.name}`)} style={{ flex: 1 }} />
      </View>
      <Button icon="print-outline" label="Print QR poster" onPress={() => router.push('/poster')} style={{ alignSelf: 'stretch' }} />
      <Button kind="ghost" icon="eye-outline" label="See it as a client" onPress={() => router.push(`/b/${shop.slug}`)} style={{ alignSelf: 'stretch' }} />
    </Card>
  );
}
