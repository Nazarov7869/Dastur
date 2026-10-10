import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';

export default function Header() {
  const { query, setQuery, address, openModal, totals, setCartOpen } = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onRestaurant = pathname.startsWith('/r/');
  const canSearch = pathname === '/' || onRestaurant;

  // Sahifa almashganda qidiruvni tozalaymiz va tepaga qaytamiz
  useEffect(() => {
    setQuery('');
    window.scrollTo(0, 0);
  }, [pathname, setQuery]);

  return (
    <header className="header">
      <div className="container header-in">
        <Link to="/" className="logo" aria-label="Dasturxon — bosh sahifa">
          <span className="logo-mark" aria-hidden="true" />
          Dasturxon
        </Link>

        <button className="addr" onClick={() => openModal('address')}>
          <Icon name="pin" />
          <span className="addr-text">
            <small>Yetkazish manzili</small>
            <b>{address || 'Manzilni kiriting'}</b>
          </span>
        </button>

        <label className="search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => !canSearch && navigate('/')}
            placeholder={onRestaurant ? 'Shu oshxona menyusidan izlash' : 'Oshxona yoki taom izlash'}
            aria-label="Qidirish"
          />
        </label>

        <button className="btn btn-primary cart-btn" onClick={() => setCartOpen(true)}>
          <Icon name="bag" />
          <span className="cart-label">Savat</span>
          {totals.count > 0 && <b className="cart-count">{totals.count}</b>}
        </button>
      </div>
    </header>
  );
}
