import { useEffect, useRef, type ComponentRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { segments, type HighlightInputProps } from './highlightSegments';

export { segments, type HighlightInputProps } from './highlightSegments';

/**
 * Web: inputs can't style part of their text, so a copy of the text is drawn
 * underneath with the highlights, and the input's own text is transparent
 * (the caret and selection stay visible). Scrolling is kept in step.
 */
export function HighlightInput({ value, spans, highlight, style, ...props }: HighlightInputProps) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const layer = useRef<ComponentRef<typeof View>>(null);

  // Keep the drawn copy aligned when a long entry scrolls sideways.
  useEffect(() => {
    const el = input.current as unknown as HTMLInputElement | null;
    const ov = layer.current as unknown as HTMLElement | null;
    if (!el || !ov) return;
    const sync = () => (ov.style.transform = `translateX(${-el.scrollLeft}px)`);
    const events = ['scroll', 'input', 'keyup', 'select', 'click', 'focus'];
    events.forEach((e) => el.addEventListener(e, sync));
    sync();
    return () => events.forEach((e) => el.removeEventListener(e, sync));
  }, [value]);

  const flat = StyleSheet.flatten(style) ?? {};
  const color = (flat.color as string) ?? '#000';
  // Text metrics both layers share.
  const text = {
    fontFamily: flat.fontFamily,
    fontSize: flat.fontSize,
    fontWeight: flat.fontWeight,
    letterSpacing: flat.letterSpacing,
    lineHeight: flat.lineHeight,
  };

  return (
    <View style={[styles.wrap, { flex: flat.flex, height: flat.height }]}>
      <View pointerEvents="none" style={styles.clip} aria-hidden>
        <View ref={layer} style={styles.layer}>
          <Text numberOfLines={1} style={[text, { color, whiteSpace: 'pre' } as object]}>
            {segments(value, spans).map((s, i) => (
              <Text key={i} style={s.hl ? ({ color: highlight.color, backgroundColor: highlight.backgroundColor, borderRadius: 4, boxShadow: `0 0 0 2px ${highlight.backgroundColor}` } as object) : undefined}>
                {s.text}
              </Text>
            ))}
          </Text>
        </View>
      </View>
      <TextInput
        ref={input}
        value={value}
        {...props}
        style={[style, styles.input, { color: value ? 'transparent' : color, caretColor: color } as object]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', justifyContent: 'center' },
  clip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', justifyContent: 'center' },
  layer: { flexDirection: 'row' },
  input: { flex: undefined, width: '100%', height: '100%', backgroundColor: 'transparent' },
});
