import { useState } from 'react';

import { Screen } from '@/components/ui';
import { SettingsBody } from '@/features/settings/SettingsBody';
import { BrandRow, type MainMode } from '@/features/today/BrandRow';
import { HomeView } from '@/features/today/HomeView';
import { PlannerView } from '@/features/today/PlannerView';
import { StatsView } from '@/features/today/StatsView';
import { recall, remember } from '@/lib/uiMemory';
import { space } from '@/theme';

// Which view shares the main page with Plan. Home for now; Stats and Settings
// are ready to switch on (EXPO_PUBLIC_SECOND=stats|settings for a preview build).
const SECOND: MainMode = (process.env.EXPO_PUBLIC_SECOND as MainMode) || 'home';
const MODES: MainMode[] = ['plan', SECOND];

/** The main page: the daily planner, sharing the tab with a second view. */
export default function TodayScreen() {
  const [mode, setModeState] = useState<MainMode>(() => {
    const saved = recall<MainMode>('main.mode', 'plan');
    return MODES.includes(saved) ? saved : 'plan';
  });
  const setMode = (m: MainMode) => {
    remember('main.mode', m);
    setModeState(m);
  };
  return (
    <Screen contentStyle={{ gap: space.md + 2 }}>
      <BrandRow mode={mode} onMode={setMode} modes={MODES} />
      {mode === 'stats' ? <StatsView /> : mode === 'settings' ? <SettingsBody /> : mode === 'home' ? <HomeView /> : <PlannerView />}
    </Screen>
  );
}
