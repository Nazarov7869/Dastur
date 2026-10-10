import ru from './ru.js';
import en from './en.js';

// Asosiy til — o'zbek tili: matnlar kodda o'zbekcha yoziladi va o'zi kalit bo'lib xizmat qiladi.
// Rus va ingliz tarjimalari ru.js / en.js lug'atlarida, kaliti — o'zbekcha matn.
export const LANGS = [
  { id: 'uz', label: 'UZ', name: "O'zbekcha" },
  { id: 'ru', label: 'RU', name: 'Русский' },
  { id: 'en', label: 'EN', name: 'English' }
];

const DICTS = { ru: { ...ru }, en: { ...en } };

// Backenddan kelgan tarjimalarni (masalan, admin panelda qo'shilgan yangi taom) lug'atga qo'shadi
export function extendDictionary(lang, entries) {
  Object.assign(DICTS[lang], entries);
}

export function translate(lang, text, vars) {
  let out = (DICTS[lang] && DICTS[lang][text]) || text;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) out = out.replaceAll(`{${key}}`, value);
  }
  return out;
}

const UNITS = {
  ru: { g: 'г', kg: 'кг', ml: 'мл', l: 'л', dona: 'шт' },
  en: { dona: 'pc' }
};

// "400 g", "0.5 l", "1 dona" kabi o'lchovlarni tilga moslaydi
export function localizeWeight(lang, weight) {
  const units = UNITS[lang];
  if (!units) return weight;
  return weight.replace(/[a-z]+$/, (unit) => units[unit] || unit);
}

export const formatNumber = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
