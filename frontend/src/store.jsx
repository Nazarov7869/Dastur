import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createOrder } from './api.js';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, ONLINE, SERVICE_FEE, getDish, getRestaurant } from './data';
import { formatNumber, localizeWeight, translate } from './i18n';

const StoreContext = createContext(null);

// useState, lekin qiymat brauzer xotirasida (localStorage) saqlanadi
function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

const EMPTY_CART = { rid: null, items: {} };

export function StoreProvider({ children }) {
  const [cart, setCart] = usePersisted('dx_cart', EMPTY_CART);
  const [favs, setFavs] = usePersisted('dx_favs', []);
  const [address, setAddress] = usePersisted('dx_address', '');
  const [location, setLocation] = usePersisted('dx_location', null); // xaritadan tanlangan nuqta: {lat, lng}
  const [phone, setPhone] = usePersisted('dx_phone', '+998 ');
  const [order, setOrder] = usePersisted('dx_order', null);
  const [lang, setLang] = usePersisted('dx_lang', 'uz');
  const [theme, setTheme] = usePersisted('dx_theme', 'dark'); // 'dark' — tungi, 'light' — kunduzgi
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef();

  // Menyu o'zgargan bo'lsa (masalan, taom o'chirilgan), savatdagi eskirgan qatorlarni olib tashlaymiz
  useEffect(() => {
    setCart((c) => {
      const items = Object.fromEntries(Object.entries(c.items).filter(([id]) => getDish(id)?.rid === c.rid));
      if (Object.keys(items).length === Object.keys(c.items).length) return c;
      return Object.keys(items).length ? { rid: c.rid, items } : EMPTY_CART;
    });
  }, [setCart]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Tarjima va tilga bog'liq formatlash
  const t = useCallback((text, vars) => translate(lang, text, vars), [lang]);
  const money = useCallback((n) => `${formatNumber(n)} ${t("so'm")}`, [t]);
  const weight = useCallback((w) => localizeWeight(lang, w), [lang]);
  const distance = useCallback(
    (km) => (km < 1 ? `${Math.round(km * 1000)} ${t('m')}` : `${km.toFixed(1)} ${t('km')}`),
    [t]
  );
  const eta = useCallback((r) => `${r.time}–${r.time + 10} ${t('daq')}`, [t]);

  const notify = useCallback((text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  const openModal = useCallback((type, props = {}) => setModal({ type, ...props }), []);
  const closeModal = useCallback(() => setModal(null), []);

  // Savatda faqat bitta oshxonaning taomlari bo'ladi. Boshqasidan qo'shilsa — so'raymiz.
  const add = useCallback(
    (id, qty = 1) => {
      const dish = getDish(id);
      if (!dish) return false;
      if (cart.rid && cart.rid !== dish.rid) {
        setModal({ type: 'swap', dishId: id, qty });
        return false;
      }
      setCart((c) => ({ rid: dish.rid, items: { ...c.items, [id]: (c.items[id] || 0) + qty } }));
      return true;
    },
    [cart.rid, setCart]
  );

  const dec = useCallback(
    (id) =>
      setCart((c) => {
        const items = { ...c.items };
        const qty = (items[id] || 0) - 1;
        if (qty > 0) items[id] = qty;
        else delete items[id];
        return Object.keys(items).length ? { rid: c.rid, items } : EMPTY_CART;
      }),
    [setCart]
  );

  const replaceCartWith = useCallback(
    (id, qty = 1) => {
      const dish = getDish(id);
      if (dish) setCart({ rid: dish.rid, items: { [id]: qty } });
    },
    [setCart]
  );

  const clearCart = useCallback(() => setCart(EMPTY_CART), [setCart]);

  const toggleFav = useCallback(
    (rid) => setFavs((f) => (f.includes(rid) ? f.filter((x) => x !== rid) : [...f, rid])),
    [setFavs]
  );

  const totals = useMemo(() => {
    const lines = Object.entries(cart.items)
      .map(([id, qty]) => ({ dish: getDish(id), qty }))
      .filter((l) => l.dish);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.qty * l.dish.price, 0);
    const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    return {
      lines,
      count,
      subtotal,
      delivery,
      service: SERVICE_FEE,
      total: subtotal + delivery + SERVICE_FEE,
      restaurant: getRestaurant(cart.rid)
    };
  }, [cart]);

  // Buyurtmani backendga yuboradi; summalarni server hisoblaydi va javobda qaytaradi.
  // Backendsiz (namuna) rejimda buyurtma faqat brauzerda saqlanadi.
  const placeOrder = useCallback(
    async (details) => {
      const local = { rid: totals.restaurant.id, createdAt: Date.now(), ...details };
      if (ONLINE) {
        const saved = await createOrder({
          restaurant: totals.restaurant.id,
          items: totals.lines.map(({ dish, qty }) => ({ dish: Number(dish.id), quantity: qty })),
          address: details.address,
          latitude: details.location?.lat ?? null,
          longitude: details.location?.lng ?? null,
          phone: details.phone,
          name: details.name,
          note: details.note,
          payment: details.pay === 'Karta' ? 'card' : 'cash'
        });
        setOrder({
          ...local,
          publicId: saved.id,
          status: saved.status,
          no: saved.number,
          lines: saved.items.map((i) => ({ id: String(i.dish), qty: i.quantity, name: i.name, price: i.price })),
          subtotal: saved.subtotal,
          delivery: saved.delivery_fee,
          service: saved.service_fee,
          total: saved.total
        });
      } else {
        setOrder({
          ...local,
          no: Math.floor(100000 + Math.random() * 900000),
          lines: totals.lines.map(({ dish, qty }) => ({ id: dish.id, qty, name: dish.name, price: dish.price })),
          subtotal: totals.subtotal,
          delivery: totals.delivery,
          service: totals.service,
          total: totals.total
        });
      }
      setCart(EMPTY_CART);
    },
    [totals, setOrder, setCart]
  );

  const updateOrderStatus = useCallback(
    (status) => setOrder((o) => (o && o.status !== status ? { ...o, status } : o)),
    [setOrder]
  );

  const value = {
    cart, totals, add, dec, replaceCartWith, clearCart,
    favs, toggleFav,
    address, setAddress, location, setLocation, phone, setPhone,
    order, placeOrder, updateOrderStatus,
    lang, setLang, theme, setTheme,
    t, money, weight, distance, eta,
    query, setQuery,
    modal, openModal, closeModal,
    cartOpen, setCartOpen,
    toast, notify
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
