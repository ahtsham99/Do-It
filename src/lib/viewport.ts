/** Native apps handle the keyboard themselves; see viewport.web.ts. */
export function start() {}
export function keyboardOpen() {
  return false;
}
export function subscribeKeyboard(_f: () => void) {
  return () => {};
}
