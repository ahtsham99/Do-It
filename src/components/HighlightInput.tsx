import { Text, TextInput, type TextStyle } from 'react-native';

import { segments, type HighlightInputProps } from './highlightSegments';

export { segments, type HighlightInputProps } from './highlightSegments';

/**
 * Native: a text field whose understood parts ("tomorrow", "at 7am") are
 * highlighted as you type, using styled text inside the input.
 */
export function HighlightInput({ value, spans, highlight, ...props }: HighlightInputProps) {
  const hl: TextStyle = { color: highlight.color, backgroundColor: highlight.backgroundColor };
  return (
    <TextInput {...props}>
      {segments(value, spans).map((s, i) => (
        <Text key={i} style={s.hl ? hl : undefined}>
          {s.text}
        </Text>
      ))}
    </TextInput>
  );
}
