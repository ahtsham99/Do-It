import { useStore } from '@/store/store';
import type { Plan } from '@/store/types';

/**
 * Premium tier scaffolding. Everything is free today; when a paid tier ships,
 * gate features by checking `useEntitlements()` / `<PremiumGate>` and wire
 * `setPlan` to the purchase provider (e.g. RevenueCat / StoreKit / Stripe).
 */
export type Feature =
  | 'unlimitedHabits'
  | 'unlimitedCountdowns'
  | 'cloudSync'
  | 'themes'
  | 'advancedStats'
  | 'customNudges'
  | 'premiumIcons';

export interface Limits {
  habits: number;
  countdowns: number;
}

const PLANS: Record<Plan, { features: Feature[]; limits: Limits }> = {
  free: {
    // Generous for now — tighten these when Pro launches.
    features: ['unlimitedHabits', 'unlimitedCountdowns'],
    limits: { habits: Infinity, countdowns: Infinity },
  },
  premium: {
    features: ['unlimitedHabits', 'unlimitedCountdowns', 'cloudSync', 'themes', 'advancedStats', 'customNudges', 'premiumIcons'],
    limits: { habits: Infinity, countdowns: Infinity },
  },
};

export function entitlementsFor(plan: Plan) {
  const p = PLANS[plan];
  return {
    plan,
    isPremium: plan === 'premium',
    limits: p.limits,
    has: (f: Feature) => p.features.includes(f),
  };
}

export function useEntitlements() {
  const plan = useStore((s) => s.settings.plan);
  return entitlementsFor(plan);
}
