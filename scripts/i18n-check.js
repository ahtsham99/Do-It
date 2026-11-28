#!/usr/bin/env node
/**
 * Lists every translatable string and what each language is missing.
 *   node scripts/i18n-check.js            → summary per language
 *   node scripts/i18n-check.js --keys     → all English keys (JSON)
 *   node scripts/i18n-check.js --missing es → missing keys for one language
 *
 * Keys come from t()/tn()/tk() calls, plus the text fields of the data files
 * that are translated where they're shown (suggestions, nudge lines, etc.).
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const LOCALES = path.join(SRC, 'lib', 'i18n', 'locales');

// Files whose text fields are shown through t() at display time.
const DATA_FILES = [
  'features/nudges/messages.ts',
  'features/onboarding/suggestions.ts',
  'features/onboarding/intents.ts',
  'features/profile/milestones.ts',
  'features/focus/sounds.ts',
  'features/countdowns/iconCatalog.ts',
  'features/countdowns/logic.ts',
  'features/goals/logic.ts',
  'features/tasks/logic.ts',
  'features/habits/historyRanges.ts',
  'features/today/BrandRow.tsx',
  'components/TabBar.tsx',
  'theme/colors.ts',
  'theme/fonts.ts',
  'store/types.ts',
  'app/privacy-policy.tsx',
];

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes(path.join('lib', 'i18n'))) walk(p, out);
    } else if (/\.(ts|tsx)$/.test(f)) out.push(p);
  }
  return out;
}

const unq = (s) => s.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
const STR = `'(?:[^'\\\\]|\\\\.)*'`;
const keys = new Set();

for (const p of walk(SRC)) {
  const s = fs.readFileSync(p, 'utf8');
  for (const m of s.matchAll(new RegExp(`\\b(?:t|tk)\\(\\s*(${STR})`, 'g'))) keys.add(unq(m[1]));
  for (const m of s.matchAll(new RegExp(`\\btn\\(\\s*[^,]+,\\s*(${STR})\\s*,\\s*(${STR})`, 'g'))) {
    keys.add(unq(m[2])); // plural keys are the English plural form
  }
}

// Data files: text-like string values (skipping ids, colours, icons, regex keywords).
const textField = /\b(label|blurb|title|name|why|unit|body)\s*:\s*('(?:[^'\\]|\\.)*')/g;
for (const rel of DATA_FILES) {
  const p = path.join(SRC, rel);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  for (const m of s.matchAll(textField)) {
    const v = unq(m[2]);
    if (/[A-Za-z]{2,}/.test(v) && !/^[a-z][\w-]*$/.test(v) && !/^[A-Z][a-z]+_\d/.test(v) && !/^#/.test(v)) keys.add(v);
  }
  // String arrays: nudge lines, goal steps, ideas, default categories.
  for (const block of s.matchAll(/(gentle|balanced|savage|steps|INTENT_IDEAS|DEFAULT_CATEGORIES)\s*[:=]\s*\[([^\]]*)\]/g)) {
    for (const m of block[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)) keys.add(unq(`'${m[1]}'`));
  }
}

const all = [...keys].filter((k) => /[A-Za-z]/.test(k)).sort();
const arg = process.argv[2];
if (arg === '--keys') {
  console.log(JSON.stringify(all, null, 2));
  process.exit(0);
}

const loadDict = (code) => {
  const p = path.join(LOCALES, `${code}.ts`);
  const src = fs.readFileSync(p, 'utf8');
  const body = src.slice(src.indexOf('{', src.indexOf('Dictionary =')), src.lastIndexOf('};') + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return (${body});`)();
};
const codes = fs.readdirSync(LOCALES).map((f) => f.replace(/\.ts$/, '')).sort();
if (arg === '--missing') {
  const d = loadDict(process.argv[3]);
  console.log(JSON.stringify(all.filter((k) => !(k in d)), null, 2));
  process.exit(0);
}
console.log(`${all.length} keys`);
for (const c of codes) {
  const d = loadDict(c);
  const missing = all.filter((k) => !(k in d));
  const extra = Object.keys(d).filter((k) => !keys.has(k));
  console.log(`${c}: ${all.length - missing.length}/${all.length} translated${missing.length ? `, ${missing.length} missing` : ''}${extra.length ? `, ${extra.length} unused` : ''}`);
}
