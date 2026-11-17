/** Plain-English rules shown to clients before they book. */
import { formatMoney } from '@/lib/dates';

import { hoursLabel } from './rules';

export function policyLines(deposit: number, cancelHours: number): string[] {
  const window = cancelHours === 0 ? 'any time before your appointment' : `up to ${hoursLabel(cancelHours)} before`;
  if (deposit > 0) {
    return [
      `You pay a ${formatMoney(deposit)} deposit now. It comes off the price on the day.`,
      `Cancel or move your booking ${window} and you get the deposit back in full.`,
      cancelHours === 0
        ? `If you don't turn up, the shop keeps the deposit.`
        : `Cancel later than that, or don't turn up, and the shop keeps the deposit.`,
    ];
  }
  return [
    'No deposit. You pay in the shop on the day.',
    cancelHours === 0
      ? 'You can cancel or move your booking any time before it, using the link in your text.'
      : `Please cancel or move your booking ${window} if you can't make it. Use the link in your text.`,
  ];
}
