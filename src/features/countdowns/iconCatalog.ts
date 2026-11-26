import type { IconName } from '@/components/ui';

export interface IconGroup {
  id: string;
  label: string;
  icon: IconName;
  free: string[];
  premium: string[];
}

/** Countdown icons by theme. Free ones first in each group, then Premium. */
export const ICON_GROUPS: IconGroup[] = [
  { id: 'celebration', label: 'Celebration', icon: 'sparkles-outline', free: ['🎉', '🎂', '🎁', '🎈', '🥳', '✨'], premium: ['🎊', '🍾', '🥂', '🪅', '🎆', '🎇', '🪩', '🎀'] },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline', free: ['✈️', '🚗', '🏖️', '🏔️', '🗺️'], premium: ['🧳', '🏝️', '🗼', '🎡', '🗽', '🚆', '🛳️', '🏕️', '🏰', '🌋'] },
  { id: 'food', label: 'Food and Drink', icon: 'restaurant-outline', free: ['🍽️', '☕', '🍕', '🍰'], premium: ['🍣', '🍷', '🍔', '🥐', '🍜', '🧁', '🍩', '🍹'] },
  { id: 'love', label: 'Love', icon: 'heart-outline', free: ['❤️', '💍', '💐'], premium: ['💒', '💕', '💌', '🌹', '💎', '👰', '🤵', '🫶'] },
  { id: 'study', label: 'Study and Work', icon: 'school-outline', free: ['🎓', '📚', '🧪', '📝', '💼', '🚩'], premium: ['📖', '🖊️', '💻', '📊', '🏛️', '🎤', '🗂️', '🎨'] },
  { id: 'health', label: 'Health', icon: 'medkit-outline', free: ['🩺', '🦷', '💊', '🏥'], premium: ['🧘', '💉', '🩻', '👶', '🤰', '🫀'] },
  { id: 'sport', label: 'Sport', icon: 'football-outline', free: ['🏆', '⚽', '🏀', '🚴', '🏃'], premium: ['🎾', '🏊', '🥊', '⛳', '🏁', '🏋️', '🎿', '🏈'] },
  { id: 'holidays', label: 'Holidays and Faith', icon: 'moon-outline', free: ['☀️', '❄️'], premium: ['🕌', '🌙', '🕯️', '🪔', '🎄', '🎅', '🎃', '🐣', '🕎', '🧧'] },
  { id: 'life', label: 'Home and Life', icon: 'home-outline', free: ['🏠', '🐾', '🚀', '⭐', '🎵', '🎟️', '🎬'], premium: ['🐶', '🐱', '🌸', '🦋', '🌍', '🔥', '⚡', '👑', '🎮', '🪴'] },
];

export const PREMIUM_COUNTDOWN_ICONS = new Set(ICON_GROUPS.flatMap((g) => g.premium));
