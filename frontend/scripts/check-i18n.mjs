// Tarjima lug'atlarini tekshiradi: koddagi va ma'lumotlardagi har bir o'zbekcha matn
// ru.js va en.js da borligini ko'rsatadi. Ishga tushirish: node scripts/check-i18n.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CATEGORIES, ORDER_STEPS, RESTAURANTS } from '../src/data/index.js';
import ru from '../src/i18n/ru.js';
import en from '../src/i18n/en.js';

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : /\.jsx?$/.test(e.name) ? [join(dir, e.name)] : []
  );

const keys = new Set(["so'm", 'm', 'km', 'daq']);

// t('...') va t("...") chaqiruvlaridagi matnlar
for (const file of files('src')) {
  const code = readFileSync(file, 'utf8');
  for (const m of code.matchAll(/\bt\(\s*'([^']*)'/g)) keys.add(m[1]);
  for (const m of code.matchAll(/\bt\(\s*"([^"]*)"/g)) keys.add(m[1]);
  // Xato matnlari o'zgaruvchi orqali tarjima qilinadi: setSendError("...")
  for (const m of code.matchAll(/setSendError\("([^"]+)"\)/g)) keys.add(m[1]);
  // { id: '...', text: '...' } ko'rinishidagi to'lov usullari
  for (const m of code.matchAll(/id: '([^']+)', text: '([^']+)'/g)) {
    keys.add(m[1]);
    keys.add(m[2]);
  }
}

// Ma'lumotlardagi matnlar
for (const c of CATEGORIES) keys.add(c.label);
for (const s of ORDER_STEPS) {
  keys.add(s.title);
  keys.add(s.text);
}
for (const r of RESTAURANTS) {
  for (const s of r.sections) {
    keys.add(s.title);
    for (const d of s.dishes) {
      keys.add(d.name);
      if (d.desc) keys.add(d.desc);
    }
  }
}

let missing = 0;
for (const [name, dict] of [['ru', ru], ['en', en]]) {
  const absent = [...keys].filter((k) => !(k in dict));
  const unused = Object.keys(dict).filter((k) => !keys.has(k));
  missing += absent.length;
  console.log(`${name}: ${keys.size - absent.length}/${keys.size} tarjima qilingan`);
  for (const k of absent) console.log(`  YO'Q: ${JSON.stringify(k)}`);
  for (const k of unused) console.log(`  ortiqcha: ${JSON.stringify(k)}`);
}
process.exit(missing ? 1 : 0);
