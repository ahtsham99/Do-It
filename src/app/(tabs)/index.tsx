import { useState } from 'react';

import { Screen } from '@/components/ui';
import { BrandRow, type MainMode } from '@/features/today/BrandRow';
import { HomeView } from '@/features/today/HomeView';
import { PlannerView } from '@/features/today/PlannerView';
import { space } from '@/theme';

// Remember the chosen view while the app is open; it opens on the planner.
let lastMode: MainMode = 'plan';

/** The main page: the daily planner, sharing the tab with the home page. */
export default function TodayScreen() {
  const [mode, setModeState] = useState<MainMode>(lastMode);
  const setMode = (m: MainMode) => {
    lastMode = m;
    setModeState(m);
  };
  return (
    <Screen contentStyle={{ gap: space.md + 2 }}>
      <BrandRow mode={mode} onMode={setMode} />
      {mode === 'plan' ? <PlannerView /> : <HomeView />}
    </Screen>
  );
}
