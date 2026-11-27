import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Pick a photo, square it, and shrink it to a small JPEG kept with your
 * settings (so it's included in backups and works offline). Returns a data
 * URI, or null if cancelled.
 */
export async function pickProfilePhoto(): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  const ctx = ImageManipulator.manipulate(a.uri);
  // Centre-crop to a square (web has no crop UI), then shrink.
  const side = Math.min(a.width || 0, a.height || 0);
  if (side && a.width !== a.height) ctx.crop({ originX: (a.width - side) / 2, originY: (a.height - side) / 2, width: side, height: side });
  ctx.resize({ width: 320 });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
  return out.base64 ? `data:image/jpeg;base64,${out.base64}` : null;
}
