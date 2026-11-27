import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exportAll } from '@/store/store';

/** Native: write the backup to a file and open the share sheet (Save to Files, AirDrop…). */
export async function saveBackup() {
  const file = new File(Paths.cache, `do-it-backup-${new Date().toISOString().slice(0, 10)}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(exportAll());
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Save your Do It backup', UTI: 'public.json' });
}

/** Native: choose a backup file and return its text (null if cancelled). */
export async function pickBackup(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.[0]) return null;
  return new File(res.assets[0].uri).text();
}
