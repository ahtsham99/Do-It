const pad = (n: number) => String(n).padStart(2, '0');

function to24(h: number, mer: string) {
  return (h % 12) + (mer.toLowerCase() === 'pm' ? 12 : 0);
}

/**
 * Rewrites times typed with am/pm into 24-hour form, for people who use the
 * 24-hour clock: "eat at 6:00pm" → "eat at 18:00", "gym 7-8:30am" →
 * "gym 07:00-08:30", "610am" → "06:10". Anything else is left as typed.
 */
export function to24hText(text: string): string {
  return (
    text
      // Ranges: "7-8am", "7am-8:30pm", "11–1pm"
      .replace(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*(-|–)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/gi, (all, h1, m1, mer1, sep, h2, m2, mer2) => {
        if (+h1 < 1 || +h1 > 12 || +h2 < 1 || +h2 > 12) return all;
        let sh = to24(+h1, mer1 ?? mer2);
        const eh = to24(+h2, mer2);
        if (!mer1 && sh > eh) sh -= 12;
        if (sh < 0) return all;
        return `${pad(sh)}:${m1 ?? '00'}${sep}${pad(eh)}:${m2 ?? '00'}`;
      })
      // Compact: "610am", "1130pm"
      .replace(/\b(\d{1,2})([0-5]\d)\s*(am|pm)\b/gi, (all, h, m, mer) => (+h < 1 || +h > 12 ? all : `${pad(to24(+h, mer))}:${m}`))
      // Single: "6pm", "6:00pm", "5.20 am"
      .replace(/\b(\d{1,2})(?:[:.]([0-5]\d))?\s*(am|pm)\b/gi, (all, h, m, mer) => (+h < 1 || +h > 12 ? all : `${pad(to24(+h, mer))}:${m ?? '00'}`))
  );
}
