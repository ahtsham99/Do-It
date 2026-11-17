import type { DayKey, Minutes } from '@/lib/dates';

export interface TimeFieldProps {
  value: Minutes;
  onChange: (m: Minutes) => void;
  label?: string;
}

export interface DateFieldProps {
  value: DayKey;
  onChange: (d: DayKey) => void;
  min?: DayKey;
  label?: string;
}
