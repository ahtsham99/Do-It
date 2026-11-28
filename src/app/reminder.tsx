import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { SheetHeader, SheetScreen } from '@/components/ui';
import { ReminderForm } from '@/features/reminders/ReminderForm';
import { useStore } from '@/store/store';
import { space } from '@/theme';

/** Reminder editor (used from notifications and links), shown as a sheet. */
export default function ReminderEditor() {
  const params = useLocalSearchParams<{ id?: string; listId?: string }>();
  const existing = useStore((s) => s.reminders.find((r) => r.id === params.id && !r.deletedAt));
  const close = () => (router.canGoBack() ? router.back() : router.replace('/reminders'));

  return (
    <SheetScreen>
      <ReminderForm
        existing={existing}
        defaultListId={params.listId}
        onDone={close}
        contentStyle={{ padding: space.lg, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}
        header={(save, canSave) => (
          <View>
            <SheetHeader title={existing ? 'Reminder' : 'New reminder'} onSave={save} canSave={canSave} />
          </View>
        )}
      />
    </SheetScreen>
  );
}
