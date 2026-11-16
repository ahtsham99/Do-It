import type { ReactNode } from 'react';

import { useEntitlements, type Feature } from '@/lib/premium';

/** Renders children only if the current plan includes `feature`. */
export function PremiumGate({ feature, children, fallback = null }: { feature: Feature; children: ReactNode; fallback?: ReactNode }) {
  const { has } = useEntitlements();
  return <>{has(feature) ? children : fallback}</>;
}
