import * as Print from 'expo-print';
import { Platform, StyleSheet, View } from 'react-native';

import { Button, ModalScreen, Text } from '@/components/ui';
import { bookingUrl, prettyUrl } from '@/lib/links';
import { QrCode, qrSvg } from '@/features/shop/QrCode';
import { useStore } from '@/store/store';
import { SERIF, space } from '@/theme';

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

function posterHtml(name: string, url: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 0; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #111; }
  .p { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; text-align: center; padding: 48px; box-sizing: border-box; }
  h1 { font-size: 56px; font-weight: 400; margin: 0; letter-spacing: -1px; }
  .k { font: 600 16px -apple-system, Helvetica, Arial, sans-serif; letter-spacing: 4px; text-transform: uppercase; color: #8C6A3A; }
  .qr { width: 340px; height: 340px; }
  .qr svg { width: 100%; height: 100%; }
  .u { font: 500 20px -apple-system, Helvetica, Arial, sans-serif; color: #444; }
  .s { font: 400 18px -apple-system, Helvetica, Arial, sans-serif; color: #666; max-width: 420px; line-height: 1.5; }
  </style></head><body><div class="p">
  <div class="k">Book your next cut</div>
  <h1>${esc(name)}</h1>
  <div class="qr">${qrSvg(url)}</div>
  <div class="s">Point your phone camera at the code. Pick a time, add your name and number. Done in 30 seconds.</div>
  <div class="u">${esc(prettyUrl(url))}</div>
  </div></body></html>`;
}

/** Print just the poster (not the app around it) via a hidden frame. */
function printOnWeb(html: string) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  }, 250);
}

/** Printable poster for the window or mirror. */
export default function Poster() {
  const shop = useStore((s) => s.shop);
  const url = bookingUrl(shop.slug);

  const print = () => {
    if (Platform.OS === 'web') return printOnWeb(posterHtml(shop.name, url));
    Print.printAsync({ html: posterHtml(shop.name, url) }).catch(() => {});
  };

  return (
    <ModalScreen title="QR poster" footer={<Button icon="print-outline" label="Print poster" onPress={print} />}>
      <View style={styles.poster}>
        <Text style={styles.kicker}>Book your next cut</Text>
        <Text style={styles.name}>{shop.name}</Text>
        <QrCode value={url} size={250} />
        <Text style={styles.small}>Point your phone camera at the code. Pick a time, add your name and number. Done in 30 seconds.</Text>
        <Text style={styles.url}>{prettyUrl(url)}</Text>
      </View>
      <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
        Prints on A4. Stick it in the window, on the mirror or by the till.
      </Text>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  poster: { backgroundColor: '#fff', borderRadius: 24, padding: space.xxl, alignItems: 'center', gap: space.lg, borderWidth: 1, borderColor: '#E2DED5' },
  kicker: { fontSize: 12, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase', color: '#8C6A3A' },
  name: { fontFamily: SERIF, fontSize: 40, lineHeight: 44, color: '#111', textAlign: 'center' },
  small: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  url: { fontSize: 15, fontWeight: '500', color: '#333' },
});
