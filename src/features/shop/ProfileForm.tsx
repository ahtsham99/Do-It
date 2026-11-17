import * as ImagePicker from 'expo-image-picker';
import { View } from 'react-native';

import { Avatar, Button, Field, Press, Text } from '@/components/ui';
import { updateShop } from '@/store/actions/shop';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

async function pickPhoto() {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.4,
    base64: true,
  });
  const asset = res.canceled ? null : res.assets[0];
  if (!asset) return;
  if (asset.base64) updateShop({ photo: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` });
  else updateShop({ photo: asset.uri });
}

/** Shop name, address, phone, photo, bio. Saves as you type. */
export function ProfileForm() {
  const shop = useStore((s) => s.shop);
  const { c } = useTheme();
  return (
    <View style={{ gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Press onPress={pickPhoto} accessibilityLabel="Choose shop photo">
          <Avatar name={shop.name || 'Shop'} photo={shop.photo} size={84} />
        </Press>
        <View style={{ flex: 1, gap: space.sm, alignItems: 'flex-start' }}>
          <Button small kind="secondary" icon="image-outline" label={shop.photo ? 'Change photo' : 'Add a photo'} onPress={pickPhoto} />
          {shop.photo ? (
            <Press onPress={() => updateShop({ photo: null })} hitSlop={8}>
              <Text variant="small" color={c.textMuted}>
                Remove photo
              </Text>
            </Press>
          ) : (
            <Text variant="small" tone="muted">
              Your shop front, or you at work.
            </Text>
          )}
        </View>
      </View>
      <Field label="Shop name" value={shop.name} onChangeText={(name) => updateShop({ name })} placeholder="e.g. Fade & Co." autoCapitalize="words" />
      <Field
        label="Address"
        value={shop.address}
        onChangeText={(address) => updateShop({ address })}
        placeholder="14 Oldham Street, Manchester M1 1JQ"
        autoCapitalize="words"
      />
      <Field
        label="Shop phone (shown to clients)"
        value={shop.phone}
        onChangeText={(phone) => updateShop({ phone })}
        placeholder="07700 900000"
        keyboardType="phone-pad"
      />
      <Field
        label="Short bio"
        value={shop.bio}
        onChangeText={(bio) => updateShop({ bio: bio.slice(0, 240) })}
        placeholder="What you're known for, in a sentence or two."
        multiline
      />
    </View>
  );
}
