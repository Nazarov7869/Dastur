import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, SERVICE_FEE, getDish, getRestaurant } from './data';

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
  const [phone, setPhone] = usePersisted('dx_phone', '+998 ');
  const [order, setOrder] = usePersisted('dx_order', null);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef();

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

  // Namuna: buyurtma hech qayerga yuborilmaydi. Bu yerda serverga so'rov bo'ladi.
  const placeOrder = useCallback(
    (details) => {
      setOrder({
        no: Math.floor(100000 + Math.random() * 900000),
        createdAt: Date.now(),
        rid: totals.restaurant.id,
        lines: totals.lines.map(({ dish, qty }) => ({ id: dish.id, qty })),
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        service: totals.service,
        total: totals.total,
        ...details
      });
      setCart(EMPTY_CART);
    },
    [totals, setOrder, setCart]
  );

  const value = {
    cart, totals, add, dec, replaceCartWith, clearCart,
    favs, toggleFav,
    address, setAddress, phone, setPhone,
    order, placeOrder,
    query, setQuery,
    modal, openModal, closeModal,
    cartOpen, setCartOpen,
    toast, notify
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
