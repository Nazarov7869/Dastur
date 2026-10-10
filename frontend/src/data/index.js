import { MENUS, RESTAURANTS as RAW } from './catalog.js';

// Ma'lumotlar ikki manbadan kelishi mumkin:
//  1) Django backend (asosiy) — loadCatalog() sayt ochilganda yuklaydi;
//  2) catalog.js dagi namuna (zaxira) — backend ishlamayotgan bo'lsa.
// Quyidagi o'zgaruvchilar "export let": yuklangach, ularni import qilgan hamma joyda yangilanadi.

export let ONLINE = false; // true — ma'lumotlar backenddan olingan, buyurtmalar ham unga yuboriladi
export let FREE_DELIVERY_FROM = 80000;
export let DELIVERY_FEE = 9000;
export let SERVICE_FEE = 2000;
export let CATEGORIES = [];
export let RESTAURANTS = [];
export let ALL_DISHES = [];
export let AVERAGE_TIME = 0;

let restaurantById = new Map();
let dishById = new Map();
export const getRestaurant = (id) => restaurantById.get(id);
export const getDish = (id) => dishById.get(String(id));

function setCatalog(categories, restaurants) {
  const label = Object.fromEntries(categories.map((c) => [c.id, c.label]));
  CATEGORIES = categories;
  RESTAURANTS = restaurants.map((r) => ({
    ...r,
    cuisines: r.cats.map((c) => label[c]).filter(Boolean),
    // Butun menyuga chegirma bo'lmasa ham, alohida aksiya taomlari bo'lishi mumkin
    hasPromo: r.sections.some((s) => s.dishes.some((d) => d.price < d.base))
  }));
  ALL_DISHES = RESTAURANTS.flatMap((r) => r.sections.flatMap((s) => s.dishes));
  restaurantById = new Map(RESTAURANTS.map((r) => [r.id, r]));
  dishById = new Map(ALL_DISHES.map((d) => [d.id, d]));
  AVERAGE_TIME = RESTAURANTS.length
    ? Math.round(RESTAURANTS.reduce((sum, r) => sum + r.time, 0) / RESTAURANTS.length)
    : 0;
}

/* ---------- Zaxira: catalog.js dagi namuna ---------- */

const BUNDLED_CATEGORIES = [
  { id: 'choyxona', label: 'Choyxona', photo: '/img/kabob.jpg' },
  { id: 'milliy', label: 'Milliy', photo: '/img/plov.jpg' },
  { id: 'pizza', label: 'Pitsa', photo: '/img/pizza4.jpg' },
  { id: 'burger', label: 'Burger', photo: '/img/burger1.jpg' },
  { id: 'sushi', label: 'Sushi', photo: '/img/sushi1.jpg' },
  { id: 'gosht', label: "Go'sht", photo: '/img/steak3.jpg' },
  { id: 'pasta', label: 'Pasta', photo: '/img/pasta3.jpg' },
  { id: 'nonushta', label: 'Nonushta', photo: '/img/pancakes2.jpg' },
  { id: 'shirinlik', label: 'Shirinlik', photo: '/img/cake1.jpg' }
];

const withDiscount = (base, percent) =>
  percent ? Math.round((base * (100 - percent)) / 10000) * 100 : base;

function useBundledCatalog() {
  setCatalog(
    BUNDLED_CATEGORIES,
    RAW.map((r) => ({
      ...r,
      cover: `/img/covers/${r.id}.jpg`,
      sections: MENUS[r.menu].map(([title, items], si) => ({
        id: `bolim-${si}`,
        title,
        // oldPrice berilgan bo'lsa — bu aksiya taomi: price aksiya narxi, oldPrice chizib ko'rsatiladi
        dishes: items.map(([name, desc, price, weight, photo, oldPrice], ii) => ({
          id: `${r.id}|${si}|${ii}`,
          rid: r.id,
          name,
          desc,
          base: oldPrice ?? price,
          price: withDiscount(price, r.discount),
          weight,
          photo: `/img/${photo}.jpg`
        }))
      }))
    }))
  );
}

useBundledCatalog();

/* ---------- Asosiy: backend ---------- */

// Backend javobini sayt ishlatadigan ko'rinishga o'tkazadi. Matnlar o'zbekcha saqlanadi,
// ruscha va inglizchasi `translations` ga yig'iladi (i18n lug'atiga qo'shish uchun).
function fromApi(data) {
  const translations = { ru: {}, en: {} };
  const text = (value) => {
    if (value.ru) translations.ru[value.uz] = value.ru;
    if (value.en) translations.en[value.uz] = value.en;
    return value.uz;
  };

  const categories = data.categories.map((c) => ({ id: c.id, label: text(c.name), photo: c.photo }));
  const restaurants = data.restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    cats: r.categories,
    rating: r.rating,
    reviews: r.reviews,
    time: r.time,
    dist: r.distance,
    discount: r.discount,
    address: r.address,
    hours: r.hours,
    cover: r.cover,
    sections: r.sections
      .map((s) => ({
        id: `bolim-${s.id}`,
        title: text(s.title),
        dishes: s.dishes.map((d) => ({
          id: String(d.id),
          rid: r.id,
          name: text(d.name),
          desc: d.description.uz ? text(d.description) : '',
          base: d.base_price,
          price: d.price,
          weight: d.weight,
          photo: d.photo
        }))
      }))
      .filter((s) => s.dishes.length)
  }));
  return { categories, restaurants, translations };
}

// Sayt ochilganda bir marta chaqiriladi. Backend javob bermasa, namuna ma'lumotlar qoladi.
export async function loadCatalog(fetchCatalog, extendDictionary) {
  try {
    const data = await fetchCatalog();
    const { categories, restaurants, translations } = fromApi(data);
    FREE_DELIVERY_FROM = data.fees.free_delivery_from;
    DELIVERY_FEE = data.fees.delivery;
    SERVICE_FEE = data.fees.service;
    setCatalog(categories, restaurants);
    extendDictionary('ru', translations.ru);
    extendDictionary('en', translations.en);
    ONLINE = true;
  } catch (error) {
    console.warn("Backend bilan aloqa yo'q — namuna ma'lumotlar ishlatilmoqda.", error);
  }
  return ONLINE;
}

/* ---------- Buyurtma holatlari ---------- */

// `status` — backenddagi Order.Status qiymati
export const ORDER_STEPS = [
  { status: 'new', title: 'Buyurtma yuborildi', text: 'Oshxona tasdiqlashini kutyapmiz.' },
  { status: 'accepted', title: 'Buyurtma qabul qilindi', text: 'Oshxona buyurtmangizni tasdiqladi.' },
  { status: 'cooking', title: 'Tayyorlanmoqda', text: 'Oshpazlar ishga kirishdi.' },
  { status: 'delivering', title: "Kuryer yo'lda", text: 'Taomingiz issiq holda olib kelinmoqda.' },
  { status: 'delivered', title: 'Yetkazildi', text: 'Yoqimli ishtaha!' }
];
// Backendsiz (namuna) rejimda holatlar shu oraliqda o'zi almashadi
export const ORDER_STEP_MS = 5000;
export const ORDER_POLL_MS = 5000;
