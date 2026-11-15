import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, space, useTheme } from '@/theme';

export function Card({ style, padded = true, ...rest }: ViewProps & { padded?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        padded && { padding: space.lg },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
});
