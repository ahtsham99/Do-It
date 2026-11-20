import { Redirect } from 'expo-router';

/** Any unknown address (e.g. /index.html from a preview or an old link) goes to the start screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}
