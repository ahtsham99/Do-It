import { StyleSheet, View, type ViewProps } from 'react-native';

import { cardShadow, radius, space, useTheme } from '@/theme';

export function Card({ style, padded = true, ...rest }: ViewProps & { padded?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border, ...cardShadow(c) },
        padded && { padding: space.xl - 4 },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1 },
});
