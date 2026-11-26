import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { SheetHeader } from '@/components/ui';
import { ReminderForm } from '@/features/reminders/ReminderForm';
import { useSheetTopInset } from '@/hooks/useTopInset';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

/** Full-screen reminder editor (used from notifications and links). */
export default function ReminderEditor() {
  const { c } = useTheme();
  const sheetTop = useSheetTopInset();
  const params = useLocalSearchParams<{ id?: string; listId?: string }>();
  const existing = useStore((s) => s.reminders.find((r) => r.id === params.id && !r.deletedAt));
  const close = () => (router.canGoBack() ? router.back() : router.replace('/reminders'));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ReminderForm
        existing={existing}
        defaultListId={params.listId}
        onDone={close}
        contentStyle={{ padding: space.lg, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}
        header={(save, canSave) => (
          <View style={{ paddingTop: sheetTop }}>
            <SheetHeader title={existing ? 'Reminder' : 'New reminder'} onSave={save} canSave={canSave} />
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}
