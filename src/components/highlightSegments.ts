import type { TextInputProps } from 'react-native';

export type HighlightInputProps = Omit<TextInputProps, 'value' | 'children'> & {
  value: string;
  /** [start, end) ranges to highlight. */
  spans: [number, number][];
  highlight: { color: string; backgroundColor: string };
};

/** Split text into plain and highlighted pieces. */
export function segments(value: string, spans: [number, number][]) {
  const out: { text: string; hl: boolean }[] = [];
  let at = 0;
  for (const [a, b] of spans) {
    if (a < at || b > value.length || a >= b) continue;
    if (a > at) out.push({ text: value.slice(at, a), hl: false });
    out.push({ text: value.slice(a, b), hl: true });
    at = b;
  }
  if (at < value.length) out.push({ text: value.slice(at), hl: false });
  return out;
}
