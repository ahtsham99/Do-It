import { Switch, type SwitchProps } from 'react-native';

import { useTheme } from '@/theme';

export function Toggle(props: SwitchProps) {
  const { c } = useTheme();
  return (
    <Switch
      trackColor={{ true: c.accent, false: c.surfaceAlt }}
      thumbColor="#fff"
      ios_backgroundColor={c.surfaceAlt}
      {...({ activeThumbColor: '#fff' } as object)}
      {...props}
    />
  );
}
