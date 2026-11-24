import { useState } from 'react';

import { Screen } from '@/components/ui';
import { BrandRow, type MainMode } from '@/features/today/BrandRow';
import { PlannerView } from '@/features/today/PlannerView';
import { StatsView } from '@/features/today/StatsView';
import { recall, remember } from '@/lib/uiMemory';
import { space } from '@/theme';

const MODES: MainMode[] = ['plan', 'stats'];

/** The main page: the daily planner, sharing the tab with your stats. */
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
      {mode === 'stats' ? <StatsView /> : <PlannerView />}
    </Screen>
  );
}
