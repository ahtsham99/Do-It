/**
 * iPhone web app + keyboard. iOS leaves the page at full height and slides it
 * up behind the keyboard, which leaves a strip of bare background. Instead,
 * size the app to the space above the keyboard, keep it pinned to the top, and
 * scroll the field you're typing in into view inside the app.
 *
 * Also tells the tab bar when the keyboard is up, from the real visible height
 * rather than focus (closing the keyboard doesn't always blur the field).
 */
let open = false;
const subs = new Set<() => void>();
let started = false;

export function keyboardOpen() {
  return open;
}

export function subscribeKeyboard(f: () => void) {
  subs.add(f);
  start();
  return () => subs.delete(f);
}

function setOpen(v: boolean) {
  if (open === v) return;
  open = v;
  subs.forEach((f) => f());
}

export function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const vv = window.visualViewport;
  if (!vv) return;
  const html = document.documentElement;
  // Tallest visible height seen at this orientation = no keyboard.
  let full = Math.max(vv.height, window.innerHeight);
  let frame = 0;

  const apply = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      // Nothing being typed into: whatever's visible now is the full height.
      full = typing ? Math.max(full, vv.height) : vv.height;
      const kb = full - vv.height > 120;
      if (kb) {
        html.style.setProperty('--app-h', `${Math.round(vv.height)}px`);
        if (window.scrollY || vv.offsetTop) window.scrollTo(0, 0);
        if (typing) el.scrollIntoView({ block: 'nearest' });
      } else {
        html.style.removeProperty('--app-h');
        if (window.scrollY) window.scrollTo(0, 0);
      }
      setOpen(kb);
    });
  };
  const rotate = () => {
    full = 0;
    setTimeout(() => {
      full = Math.max(vv.height, window.innerHeight);
      apply();
    }, 300);
  };
  vv.addEventListener('resize', apply);
  vv.addEventListener('scroll', apply);
  document.addEventListener('focusout', () => setTimeout(apply, 60));
  window.addEventListener('orientationchange', rotate);
  apply();
}
