import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/**
 * Public URLs. Set `expo.extra.publicUrl` in app.json (e.g. https://book.yourdomain.co.uk)
 * once the app has a real domain; until then links point at wherever the app is running.
 */
function base(): string | null {
  const url = (Constants.expoConfig?.extra as { publicUrl?: string } | undefined)?.publicUrl;
  return url ? url.replace(/\/$/, '') : null;
}

function make(path: string) {
  const b = base();
  return b ? `${b}${path}` : Linking.createURL(path);
}

export const bookingUrl = (slug: string) => make(`/b/${slug}`);
export const manageUrl = (token: string) => make(`/a/${token}`);

/** Short form for display: drop the scheme. */
export const prettyUrl = (url: string) => url.replace(/^https?:\/\//, '');
