import { MENUS, RESTAURANTS as RAW } from './catalog.js';

export const FREE_DELIVERY_FROM = 80000;
export const DELIVERY_FEE = 9000;
export const SERVICE_FEE = 2000;

export const CATEGORIES = [
  { id: 'milliy', label: 'Milliy', photo: '/img/plov.jpg' },
  { id: 'pizza', label: 'Pitsa', photo: '/img/pizza4.jpg' },
  { id: 'burger', label: 'Burger', photo: '/img/burger1.jpg' },
  { id: 'sushi', label: 'Sushi', photo: '/img/sushi1.jpg' },
  { id: 'gosht', label: "Go'sht", photo: '/img/steak3.jpg' },
  { id: 'pasta', label: 'Pasta', photo: '/img/pasta3.jpg' },
  { id: 'nonushta', label: 'Nonushta', photo: '/img/pancakes2.jpg' },
  { id: 'shirinlik', label: 'Shirinlik', photo: '/img/cake1.jpg' }
];

const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const withDiscount = (base, percent) =>
  percent ? Math.round((base * (100 - percent)) / 10000) * 100 : base;

export const RESTAURANTS = RAW.map((r) => ({
  ...r,
  cover: `/img/covers/${r.id}.jpg`,
  cuisine: r.cats.map((c) => categoryLabel[c]).join(' · '),
  sections: MENUS[r.menu].map(([title, items], si) => ({
    id: `bolim-${si}`,
    title,
    dishes: items.map(([name, desc, base, weight, photo], ii) => ({
      id: `${r.id}|${si}|${ii}`,
      rid: r.id,
      name,
      desc,
      base,
      price: withDiscount(base, r.discount),
      weight,
      photo: `/img/${photo}.jpg`
    }))
  }))
}));

export const ALL_DISHES = RESTAURANTS.flatMap((r) => r.sections.flatMap((s) => s.dishes));

const restaurantById = new Map(RESTAURANTS.map((r) => [r.id, r]));
const dishById = new Map(ALL_DISHES.map((d) => [d.id, d]));

export const getRestaurant = (id) => restaurantById.get(id);
export const getDish = (id) => dishById.get(id);

export const AVERAGE_TIME = Math.round(
  RESTAURANTS.reduce((sum, r) => sum + r.time, 0) / RESTAURANTS.length
);

// Buyurtma holatlari (namunada vaqt bo'yicha o'zi almashadi)
export const ORDER_STEPS = [
  { title: 'Buyurtma qabul qilindi', text: 'Oshxona buyurtmangizni tasdiqladi.' },
  { title: 'Tayyorlanmoqda', text: 'Oshpazlar ishga kirishdi.' },
  { title: "Kuryer yo'lda", text: 'Taomingiz issiq holda olib kelinmoqda.' },
  { title: 'Yetkazildi', text: 'Yoqimli ishtaha!' }
];
export const ORDER_STEP_MS = 5000;
