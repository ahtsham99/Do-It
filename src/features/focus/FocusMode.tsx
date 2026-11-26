import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Press, Text, showDialog, type IconName } from '@/components/ui';
import { addMinutes, pauseTimer, remainingSec, resumeTimer, stopTimer } from '@/store/actions/timer';
import { getState, useStore } from '@/store/store';
import { SERIF, useTheme } from '@/theme';

import { setFocusExpanded, useFocusExpanded } from './focusMode';
import { playSound, stopSound, type SoundId } from './sounds';
import { TimerRing } from './TimerRing';
import { formatClock, useTick } from './useTick';

const BG = '#050605';
const INK = '#F2EFE8';
const DIM = 'rgba(242,239,232,0.55)';
const FAINT = 'rgba(242,239,232,0.28)';

/**
 * Full-screen focus: a calm dark page with the clock, the task and the ring.
 * Tap anywhere to show the controls. Hides itself when the session ends so the
 * "Session complete" message can show.
 */
export function FocusMode() {
  const expanded = useFocusExpanded();
  const status = useStore((s) => s.timer.status);
  if (!expanded || status === 'idle') return null;
  return <FocusModeView />;
}

function FocusModeView() {
  const { c } = useTheme();
  const timer = useStore((s) => s.timer);
  const now = useTick(timer.status === 'running');
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [controls, setControls] = useState(true);
  const [touchedAt, setTouchedAt] = useState(() => Date.now());

  // Controls fade away after a few quiet seconds while running.
  useEffect(() => {
    if (!controls || timer.status !== 'running') return;
    const id = setTimeout(() => setControls(false), 4000);
    return () => clearTimeout(id);
  }, [controls, touchedAt, timer.status]);

  const left = remainingSec(timer, now);
  const isBreak = timer.mode === 'break';
  const paused = timer.status === 'paused';
  const rounds = timer.rounds ?? 1;
  const ringColor = isBreak ? c.warning : c.accent;
  const size = Math.round(Math.min(320, width - 64, height * 0.42));
  const clock = formatClock(left);
  const clockSize = Math.round(Math.min(84, (size * 0.72) / (clock.length * 0.62)));
  const state = paused ? 'Paused' : isBreak ? 'Break · breathe' : 'Focusing';
  const roundText = rounds > 1 ? `Round ${timer.round ?? 1} of ${rounds}` : '';

  const poke = () => {
    setTouchedAt(Date.now());
    setControls(true);
  };
  const toggle = () => (controls && !paused ? setControls(false) : poke());
  const pause = () => {
    poke();
    if (paused) {
      if (!isBreak) playSound(getState().settings.focusSound as SoundId);
      resumeTimer();
    } else {
      stopSound();
      pauseTimer();
    }
  };
  const end = () =>
    showDialog({
      title: isBreak ? 'End the break?' : 'End this session?',
      message: isBreak ? 'You can start the next round from the Focus tab.' : 'The minutes you’ve already done still count.',
      actions: [{ label: isBreak ? 'End break' : 'End session', destructive: true, onPress: () => (stopSound(), stopTimer()) }],
    });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]}>
      <StatusBar style="light" />
      <Press haptic={false} onPress={toggle} accessibilityLabel={controls ? 'Hide controls' : 'Show controls'} style={[styles.fill, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.top, { opacity: controls ? 1 : 0 }]} pointerEvents={controls ? 'auto' : 'none'}>
          <Press onPress={() => setFocusExpanded(false)} accessibilityLabel="Minimise" hitSlop={12} style={styles.close}>
            <Icon name="chevron-down" size={26} color={DIM} />
          </Press>
        </View>

        <View style={styles.center}>
          <Text style={{ color: DIM, fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase' }}>{state}</Text>
          <TimerRing size={size} stroke={6} progress={timer.durationSec ? left / timer.durationSec : 0} color={ringColor} track="rgba(242,239,232,0.08)">
            <Text accessibilityRole="timer" numberOfLines={1} style={{ color: INK, fontFamily: SERIF, fontSize: clockSize, lineHeight: clockSize + 10, fontVariant: ['tabular-nums'] }}>
              {clock}
            </Text>
            {roundText ? <Text style={{ color: DIM, fontSize: 14, marginTop: 4 }}>{roundText}</Text> : null}
          </TimerRing>
          <Text numberOfLines={2} style={{ color: INK, fontFamily: SERIF, fontSize: 24, lineHeight: 30, textAlign: 'center', maxWidth: size + 20, opacity: timer.label ? 1 : 0.6 }}>
            {timer.label || (isBreak ? 'Stand up, stretch, drink water' : 'One thing at a time')}
          </Text>
        </View>

        <View style={[styles.controls, { opacity: controls ? 1 : 0 }]} pointerEvents={controls ? 'box-none' : 'none'}>
          {controls ? (
            <>
              <Round icon="add" label="+5 min" onPress={() => (poke(), addMinutes(5))} />
              <Round icon={paused ? 'play' : 'pause'} label={paused ? 'Resume' : 'Pause'} onPress={pause} big color={ringColor} />
              <Round icon="stop" label="End" onPress={end} />
            </>
          ) : null}
        </View>
        <Text style={{ color: FAINT, fontSize: 12, textAlign: 'center', opacity: controls ? 0 : 1 }}>Tap for controls</Text>
      </Press>
    </View>
  );
}

function Round({ icon, label, onPress, big, color }: { icon: IconName; label: string; onPress: () => void; big?: boolean; color?: string }) {
  const d = big ? 78 : 58;
  return (
    <View style={{ alignItems: 'center', gap: 8, width: 84 }}>
      <Press
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{ width: d, height: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: big ? color : 'rgba(242,239,232,0.1)' }}>
        <Icon name={icon} size={big ? 32 : 22} color={big ? BG : INK} />
      </Press>
      <Text style={{ color: DIM, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: 24 },
  top: { flexDirection: 'row', justifyContent: 'flex-start', height: 44 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 18, height: 112 },
});
