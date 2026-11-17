/** UK mobile numbers. Stored as E.164 (+447…), shown as "07700 900123". */
export function normalisePhone(input: string): string | null {
  let d = input.replace(/[^\d+]/g, '');
  if (d.startsWith('+44')) d = '0' + d.slice(3);
  else if (d.startsWith('0044')) d = '0' + d.slice(4);
  else if (d.startsWith('44') && d.length === 12) d = '0' + d.slice(2);
  if (!/^0\d{10}$/.test(d)) return null;
  return '+44' + d.slice(1);
}

export function isUkMobile(e164: string) {
  return /^\+447\d{9}$/.test(e164);
}

export function formatPhone(e164: string) {
  if (!e164.startsWith('+44')) return e164;
  const local = '0' + e164.slice(3);
  return `${local.slice(0, 5)} ${local.slice(5)}`;
}
