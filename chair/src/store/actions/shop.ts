import { uid } from '@/lib/id';

import { getState, setState } from '../store';
import type { DayHours, Policies, Service, Settings, Shop } from '../types';

export function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'my-shop'
  );
}

export function updateShop(patch: Partial<Shop>) {
  setState((s) => {
    const shop = { ...s.shop, ...patch };
    // The link follows the name until setup is done, then stays fixed so printed QR codes keep working.
    if (patch.name !== undefined && (!s.settings.setupComplete || !shop.slug)) shop.slug = slugify(shop.name);
    if (patch.slug !== undefined) shop.slug = slugify(patch.slug);
    return { shop };
  });
}

export function updatePolicies(patch: Partial<Policies>) {
  setState((s) => ({ policies: { ...s.policies, ...patch } }));
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ settings: { ...s.settings, ...patch } }));
}

export function setDayHours(weekday: number, patch: Partial<DayHours>) {
  setState((s) => ({ hours: s.hours.map((h, i) => (i === weekday ? { ...h, ...patch } : h)) }));
}

// ---- Services --------------------------------------------------------------

export function saveService(input: { id?: string; name: string; price: number; duration: number }) {
  const now = Date.now();
  setState((s) => {
    if (input.id) {
      return {
        services: s.services.map((x) =>
          x.id === input.id ? { ...x, name: input.name, price: input.price, duration: input.duration, updatedAt: now } : x,
        ),
      };
    }
    const svc: Service = {
      id: uid('svc_'),
      createdAt: now,
      updatedAt: now,
      name: input.name,
      price: input.price,
      duration: input.duration,
      order: s.services.length,
    };
    return { services: [...s.services, svc] };
  });
}

export function deleteService(id: string) {
  const now = Date.now();
  setState((s) => ({ services: s.services.map((x) => (x.id === id ? { ...x, deletedAt: now, updatedAt: now } : x)) }));
}

export function liveServices() {
  return getState()
    .services.filter((x) => !x.deletedAt)
    .sort((a, b) => a.order - b.order);
}
