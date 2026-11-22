import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { font, radius, space, useTheme } from '@/theme';

import { Text } from './Text';

export function Field({ label, style, ...rest }: TextInputProps & { label?: string }) {
  const { c, fonts } = useTheme();
  return (
    <View style={{ gap: space.xs }}>
      {label && <Label>{label}</Label>}
      <TextInput
        placeholderTextColor={c.textFaint}
        {...rest}
        style={[
          font.body,
          { fontFamily: fonts.text(400) },
          styles.input,
          { color: c.text, backgroundColor: c.surface, borderColor: c.border },
          rest.multiline && { minHeight: 88, textAlignVertical: 'top', paddingTop: 14 },
          style,
        ]}
      />
    </View>
  );
}

export function Label({ children }: { children: string }) {
  return (
    <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', marginLeft: 2 }}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    fontSize: 16, // ≥16 stops iOS Safari zooming on focus
  },
});
