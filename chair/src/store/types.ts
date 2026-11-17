import type { DayKey, Minutes } from '@/lib/dates';
import type { SyncMeta } from '@/lib/storage';

export interface Shop {
  /** Used in the public booking link: /b/<slug> */
  slug: string;
  name: string;
  address: string;
  phone: string;
  bio: string;
  /** data: URI so it survives app restarts and can be synced later. */
  photo: string | null;
}

export interface Service extends SyncMeta {
  name: string;
  /** Pence */
  price: number;
  duration: number;
  order: number;
}

export interface DayHours {
  open: boolean;
  start: Minutes;
  end: Minutes;
}
/** Index 0 = Sunday … 6 = Saturday */
export type WeeklyHours = DayHours[];

/** Days off and holidays (inclusive range). */
export interface TimeOff extends SyncMeta {
  start: DayKey;
  end: DayKey;
  label: string;
}

export interface Block extends SyncMeta {
  date: DayKey;
  start: Minutes;
  end: Minutes;
  label: string;
}

export interface Client extends SyncMeta {
  name: string;
  /** E.164, e.g. +447700900123 */
  phone: string;
  notes?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled';
export type CancelledBy = 'client' | 'barber' | 'closure';
export type DepositStatus = 'none' | 'paid' | 'refunded' | 'kept';

export interface Booking extends SyncMeta {
  date: DayKey;
  start: Minutes;
  end: Minutes;
  serviceId: string;
  serviceName: string;
  price: number;
  clientId: string;
  source: 'online' | 'walk-in';
  status: BookingStatus;
  cancelledBy?: CancelledBy;
  noShow?: boolean;
  deposit: { amount: number; status: DepositStatus };
  /** Cancellation window agreed at the time of booking (hours). */
  cancelHours: number;
  /** Secret part of the client's manage link: /a/<token> */
  token: string;
}

export type MessageKind = 'confirmation' | 'reminder-day' | 'reminder-hour' | 'cancellation' | 'rescheduled';

/** A text message. Today they sit in an outbox; a server-side SMS provider sends them later. */
export interface Message extends SyncMeta {
  bookingId: string;
  phone: string;
  kind: MessageKind;
  body: string;
  /** When it goes out (epoch ms). Sent once this is in the past. */
  sendAt: number;
  cancelled?: boolean;
}

export interface Policies {
  depositEnabled: boolean;
  /** Pence */
  depositAmount: number;
  /** Free cancellation up to this many hours before. */
  cancelHours: number;
  /** How far ahead clients can book. */
  bookingWindowDays: number;
  /** Shortest notice for an online booking. */
  minNoticeMins: number;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  setupComplete: boolean;
  theme: ThemePreference;
}

export interface AppState {
  hydrated: boolean;
  shop: Shop;
  services: Service[];
  hours: WeeklyHours;
  timeOff: TimeOff[];
  blocks: Block[];
  clients: Client[];
  bookings: Booking[];
  messages: Message[];
  policies: Policies;
  settings: Settings;
}

export const DEFAULT_SHOP: Shop = { slug: '', name: '', address: '', phone: '', bio: '', photo: null };

const day = (open: boolean, start = 9 * 60, end = 18 * 60): DayHours => ({ open, start, end });
export const DEFAULT_HOURS: WeeklyHours = [day(false), day(false), day(true), day(true), day(true), day(true), day(true)];

export const DEFAULT_POLICIES: Policies = {
  depositEnabled: false,
  depositAmount: 500,
  cancelHours: 24,
  bookingWindowDays: 28,
  minNoticeMins: 30,
};

export const DEFAULT_SETTINGS: Settings = { setupComplete: false, theme: 'system' };
