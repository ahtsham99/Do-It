/**
 * Text messages.
 *
 * The app writes every text to the `messages` slice with the time it should go
 * out (`sendAt`). Right now that is the whole story: the Texts screen shows the
 * outbox so you can see exactly what clients receive. To send for real, a
 * small server job reads due messages and passes them to an SMS provider
 * (Twilio, MessageBird, Vonage…). Phones can't send texts in the background,
 * so this has to live on a server; nothing in the screens needs to change.
 */
export { MESSAGE_LABEL, smsBody } from './templates';

export const isSent = (m: { sendAt: number; cancelled?: boolean }, now = Date.now()) => !m.cancelled && m.sendAt <= now;
