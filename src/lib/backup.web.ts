import { exportAll } from '@/store/store';

const fileName = () => `do-it-backup-${new Date().toISOString().slice(0, 10)}.json`;

/** Web: download the backup file (iPhone offers "Save to Files"). */
export async function saveBackup() {
  const blob = new Blob([exportAll()], { type: 'application/json' });
  const file = new File([blob], fileName(), { type: 'application/json' });
  // iPhone home-screen apps can't download; the share sheet can save to Files.
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    try {
      await navigator.share({ files: [file], title: 'Do It backup' });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Web: choose a backup file and return its text (null if cancelled). */
export function pickBackup(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return resolve(null);
      f.text().then(resolve, () => resolve(null));
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
