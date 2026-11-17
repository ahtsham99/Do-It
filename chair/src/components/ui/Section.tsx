import type { ReactNode } from 'react';
import { View } from 'react-native';

import { space } from '@/theme';

import { Text } from './Text';

export function Section({ title, right, children }: { title?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      {(title || right) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 20 }}>
          {title ? (
            <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
              {title}
            </Text>
          ) : (
            <View />
          )}
          {right}
        </View>
      )}
      {children}
    </View>
  );
}
