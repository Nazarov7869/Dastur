import { useStore } from '../store.jsx';
import { money } from '../lib/format.js';
import Icon from './Icon.jsx';

// Savat bo'sh bo'lmasa, sahifa pastida suzib turadigan tugma
export default function CartBar() {
  const { totals, setCartOpen } = useStore();
  if (!totals.count) return null;

  return (
    <button className="cartbar" onClick={() => setCartOpen(true)}>
      <span className="cartbar-count">{totals.count}</span>
      <span className="cartbar-text">
        <b>Savatni ko'rish</b>
        <small>{totals.restaurant.name}</small>
      </span>
      <span className="cartbar-sum">{money(totals.total)}</span>
      <Icon name="right" size={18} />
    </button>
  );
}
