/**
 * Focus sounds made in the browser (no audio files): noise shaped into rain,
 * waves, deep (brown) noise, white noise, or a soft clock tick.
 */
export type SoundId = 'off' | 'rain' | 'ocean' | 'brown' | 'white' | 'tick';

export const SOUNDS: { id: SoundId; label: string; icon: string }[] = [
  { id: 'off', label: 'Silent', icon: '🔇' },
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'brown', label: 'Deep', icon: '🟤' },
  { id: 'white', label: 'White', icon: '⚪' },
  { id: 'tick', label: 'Tick', icon: '⏱️' },
];

export const soundsSupported = typeof window !== 'undefined' && !!(window.AudioContext ?? (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);

let ctx: AudioContext | null = null;
let nodes: AudioNode[] = [];
let timers: ReturnType<typeof setInterval>[] = [];
let current: SoundId = 'off';

function context() {
  if (!ctx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** A looping noise buffer. Brown noise is integrated white noise (deeper). */
function noise(a: AudioContext, kind: 'white' | 'brown') {
  const len = a.sampleRate * 4;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'white') data[i] = w * 0.5;
    else {
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

export function stopSound() {
  timers.forEach(clearInterval);
  timers = [];
  for (const n of nodes) {
    try {
      (n as AudioScheduledSourceNode).stop?.();
    } catch {}
    n.disconnect();
  }
  nodes = [];
  current = 'off';
}

/** Start a sound (must be called from a tap, so iOS allows audio). */
export function playSound(id: SoundId) {
  if (id === current) return;
  stopSound();
  if (id === 'off' || !soundsSupported) return;
  const a = context();
  const out = a.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(0.5, a.currentTime + 1.5);
  out.connect(a.destination);
  nodes.push(out);

  if (id === 'white' || id === 'brown') {
    const src = noise(a, id);
    const lp = a.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = id === 'white' ? 9000 : 1200;
    src.connect(lp).connect(out);
    src.start();
    nodes.push(src, lp);
  } else if (id === 'rain') {
    const src = noise(a, 'white');
    const bp = a.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2500;
    bp.Q.value = 0.6;
    const hp = a.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 400;
    const g = a.createGain();
    g.gain.value = 0.55;
    src.connect(bp).connect(hp).connect(g).connect(out);
    src.start();
    nodes.push(src, bp, hp, g);
  } else if (id === 'ocean') {
    const src = noise(a, 'brown');
    const lp = a.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    const swell = a.createGain();
    swell.gain.value = 0.5;
    // Waves: slowly rise and fall the volume.
    const lfo = a.createOscillator();
    lfo.frequency.value = 0.09;
    const depth = a.createGain();
    depth.gain.value = 0.45;
    lfo.connect(depth).connect(swell.gain);
    src.connect(lp).connect(swell).connect(out);
    src.start();
    lfo.start();
    nodes.push(src, lp, swell, lfo, depth);
  } else if (id === 'tick') {
    const tick = () => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = 'square';
      o.frequency.value = 1800;
      g.gain.setValueAtTime(0.12, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.03);
      o.connect(g).connect(out);
      o.start();
      o.stop(a.currentTime + 0.04);
    };
    tick();
    timers.push(setInterval(tick, 1000));
  }
  current = id;
}
