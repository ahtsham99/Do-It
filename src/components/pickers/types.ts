export interface DateTimeFieldProps {
  mode: 'date' | 'time';
  /** DayKey for date mode, HH:mm for time mode. */
  value: string;
  onChange: (v: string) => void;
  use24h?: boolean;
}
