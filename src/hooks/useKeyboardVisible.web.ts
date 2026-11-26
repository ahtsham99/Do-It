import { useEffect, useState } from 'react';

const isTyping = (el: Element | null) => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') return !['checkbox', 'radio', 'button', 'submit', 'range', 'color', 'file'].includes((el as HTMLInputElement).type);
  return (el as HTMLElement).isContentEditable;
};

/**
 * Web: on phones and tablets, the keyboard is up while a text field has focus.
 * (Desktop keyboards don't cover anything, so this stays false there.)
 */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;
    const update = () => setVisible(isTyping(document.activeElement));
    // Focus moves between fields without a gap; check after it settles.
    const later = () => setTimeout(update, 50);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', later);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', later);
    };
  }, []);
  return visible;
}
