import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Icon, Press, Text, showDialog, type IconName } from '@/components/ui';
import { addMinutes, pauseTimer, remainingSec, resumeTimer, stopTimer } from '@/store/actions/timer';
import { getState, useStore } from '@/store/store';
import { SERIF, hexAlpha } from '@/theme';
import { darkFor, type NightBackground } from '@/theme/colors';

import { setFocusExpanded, useFocusExpanded } from './focusMode';
import { playSound, stopSound, type SoundId } from './sounds';
import { formatClock, useTick } from './useTick';
import { t } from '@/lib/i18n';

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
  // Always dark, in the bright night shade of whatever colour the app is using.
  const nightColor = useStore((s) => s.settings.nightColor);
  const custom = useStore((s) => s.settings.customColor);
  const nightBg = useStore((s) => s.settings.nightBackground);
  const night = useMemo(() => darkFor(nightColor, custom, nightBg as NightBackground), [nightColor, custom, nightBg]);
  const BG = night.bg;
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
  const ringColor = isBreak ? night.warning : night.accent;
  const round = timer.round ?? 1;
  const size = Math.round(Math.min(320, width - 64, height * 0.42));
  const clock = formatClock(left);
  const clockSize = Math.round(Math.min(84, (size * 0.72) / (clock.length * 0.62)));
  const state = paused ? t('Paused') : isBreak ? t('Break · breathe') : t('Focusing');
  const roundText = rounds > 1 ? t('Round {round} of {rounds}', { round: timer.round ?? 1, rounds }) : '';

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
      title: isBreak ? t('End the break?') : t('End this session?'),
      message: isBreak ? t('You can start the next round from the Focus tab.') : t('The minutes you’ve already done still count.'),
      actions: [{ label: isBreak ? t('End break') : t('End session'), destructive: true, onPress: () => (stopSound(), stopTimer()) }],
    });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]}>
      <StatusBar style="light" />
      <Press haptic={false} onPress={toggle} accessibilityLabel={controls ? t('Hide controls') : t('Show controls')} style={[styles.fill, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.top, { opacity: controls ? 1 : 0 }]} pointerEvents={controls ? 'auto' : 'none'}>
          <Press onPress={() => setFocusExpanded(false)} accessibilityLabel={t('Minimise')} hitSlop={12} style={styles.close}>
            <Icon name="chevron-down" size={26} color={DIM} />
          </Press>
        </View>

        <View style={styles.center}>
          <Text style={{ color: DIM, fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase' }}>{state}</Text>
          <GlowRing size={size} color={ringColor} progress={timer.durationSec ? left / timer.durationSec : 0}>
            <Text accessibilityRole="timer" numberOfLines={1} style={{ color: INK, fontFamily: SERIF, fontSize: clockSize, lineHeight: clockSize + 10, fontVariant: ['tabular-nums'] }}>
              {clock}
            </Text>
            {roundText ? <Text style={{ color: DIM, fontSize: 15, marginTop: 4 }}>{roundText}</Text> : null}
          </GlowRing>
          <Text numberOfLines={2} style={{ color: INK, fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, lineHeight: 32, textAlign: 'center', maxWidth: size + 20, paddingHorizontal: 8, opacity: timer.label ? 0.95 : 0.8 }}>
            {timer.label || (isBreak ? t('Stand up, stretch, drink water') : t('One thing at a time'))}
          </Text>
          {rounds > 1 ? (
            <View style={styles.pips} accessibilityLabel={roundText}>
              {Array.from({ length: rounds }, (_, i) => (
                <View key={i} style={[styles.pip, { backgroundColor: i < round ? hexAlpha(ringColor, i === round - 1 ? 0.75 : 0.45) : 'rgba(242,239,232,0.12)' }]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={[styles.controls, { opacity: controls ? 1 : 0 }]} pointerEvents={controls ? 'box-none' : 'none'}>
          {controls ? (
            <>
              <Round icon="add" label={t('+5 min')} onPress={() => (poke(), addMinutes(5))} />
              <Round icon={paused ? 'play' : 'pause'} label={paused ? t('Resume') : t('Pause')} onPress={pause} big color={ringColor} />
              <Round icon="stop" label={t('End')} onPress={end} />
            </>
          ) : null}
        </View>
        <Text style={{ color: FAINT, fontSize: 12, textAlign: 'center', opacity: controls ? 0 : 1 }}>{t('Tap for controls')}</Text>
      </Press>
    </View>
  );
}

/** The ring, with a soft halo of the theme colour around it and behind it. */
function GlowRing({ size, color, progress, children }: { size: number; color: string; progress: number; children: ReactNode }) {
  const pad = 40;
  const full = size + pad * 2;
  const mid = full / 2;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  const arc = { cx: mid, cy: mid, r, fill: 'none', strokeLinecap: 'round' as const, strokeDasharray: `${circ} ${circ}`, strokeDashoffset: circ * (1 - p), transform: `rotate(-90 ${mid} ${mid})` };
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={full} height={full} style={{ position: 'absolute', left: -pad, top: -pad }}>
        <Defs>
          <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
            <Stop offset="0.55" stopColor={color} stopOpacity={0} />
            <Stop offset="0.8" stopColor={color} stopOpacity={0.1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={mid} cy={mid} r={mid} fill="url(#halo)" />
        {/* track and a faint inner ring */}
        <Circle cx={mid} cy={mid} r={r} stroke="rgba(242,239,232,0.06)" strokeWidth={stroke} fill="none" />
        <Circle cx={mid} cy={mid} r={r - 14} stroke={color} strokeOpacity={0.07} strokeWidth={1.5} fill="none" />
        {/* the glow: wider, fainter copies of the arc underneath */}
        <Circle {...arc} stroke={color} strokeOpacity={0.05} strokeWidth={30} />
        <Circle {...arc} stroke={color} strokeOpacity={0.08} strokeWidth={18} />
        <Circle {...arc} stroke={color} strokeOpacity={0.16} strokeWidth={11} />
        <Circle {...arc} stroke={color} strokeOpacity={0.9} strokeWidth={stroke} />
      </Svg>
      {children}
    </View>
  );
}

function Round({ icon, label, onPress, big, color }: { icon: IconName; label: string; onPress: () => void; big?: boolean; color?: string }) {
  const d = big ? 84 : 62;
  return (
    <View style={{ alignItems: 'center', gap: 8, width: 84 }}>
      <Press
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          width: d,
          height: d,
          borderRadius: d / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: big && color ? hexAlpha(color, 0.55) : 'rgba(242,239,232,0.09)',
          boxShadow: big && color ? `0px 0px 28px ${hexAlpha(color, 0.45)}` : undefined,
        }}>
        <Icon name={icon} size={big ? 32 : 22} color={big ? '#FFFFFF' : INK} />
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
  pips: { flexDirection: 'row', gap: 8, marginTop: -4 },
  pip: { width: 28, height: 6, borderRadius: 3 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 18, height: 112 },
});
