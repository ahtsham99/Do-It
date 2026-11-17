import makeQr from 'qrcode-generator';
import { memo, useMemo } from 'react';
import { View } from 'react-native';

function matrix(value: string) {
  const qr = makeQr(0, 'M');
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount();
  // Merge each row's dark modules into runs so we draw a few hundred views, not thousands.
  const runs: { r: number; c: number; len: number }[] = [];
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!qr.isDark(r, c)) {
        c++;
        continue;
      }
      const start = c;
      while (c < n && qr.isDark(r, c)) c++;
      runs.push({ r, c: start, len: c - start });
    }
  }
  return { n, runs };
}

/** SVG markup for printing. */
export function qrSvg(value: string) {
  const qr = makeQr(0, 'M');
  qr.addData(value);
  qr.make();
  return qr.createSvgTag({ cellSize: 8, margin: 0, scalable: true });
}

/** Always black on white, whatever the theme: phones scan that best. */
export const QrCode = memo(function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  const { n, runs } = useMemo(() => matrix(value), [value]);
  const quiet = 2;
  const cell = size / (n + quiet * 2);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`QR code for ${value}`}
      style={{ width: size, height: size, backgroundColor: '#fff', borderRadius: 12 }}>
      {runs.map(({ r, c, len }) => (
        <View
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            top: (r + quiet) * cell,
            left: (c + quiet) * cell,
            width: len * cell + 0.5,
            height: cell + 0.5,
            backgroundColor: '#000',
          }}
        />
      ))}
    </View>
  );
});
