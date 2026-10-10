import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FREE_DELIVERY_FROM } from '../data';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';
import Qty from './Qty.jsx';
import Totals from './Totals.jsx';

export default function CartPanel() {
  const { cartOpen, setCartOpen, totals, add, dec, clearCart, t, money } = useStore();
  const navigate = useNavigate();
  const { lines, subtotal, restaurant } = totals;

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;
  const close = () => setCartOpen(false);
  const left = FREE_DELIVERY_FROM - subtotal;

  return (
    <div className="overlay" onClick={close}>
      <aside className="panel" role="dialog" aria-label={t('Savat')} onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <div>
            <h2>{t('Savat')}</h2>
            {restaurant && <Link to={`/r/${restaurant.id}`} onClick={close}>{restaurant.name}</Link>}
          </div>
          <button className="icon-btn" onClick={close} aria-label={t('Yopish')}><Icon name="close" /></button>
        </div>

        {lines.length === 0 ? (
          <div className="panel-empty">
            <Icon name="bag" size={44} />
            <b>{t("Savat hozircha bo'sh")}</b>
            <p>{t("Yoqqan taomingizni qo'shing — u shu yerda paydo bo'ladi.")}</p>
          </div>
        ) : (
          <>
            <div className="panel-body">
              <div className="progress">
                <p>
                  <b>{left > 0 ? t('Bepul yetkazishgacha yana {sum}', { sum: money(left) }) : t('Yetkazib berish bepul')}</b>
                </p>
                <div className="progress-bar"><i style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)}%` }} /></div>
              </div>

              <ul className="lines">
                {lines.map(({ dish, qty }) => (
                  <li key={dish.id}>
                    <img src={dish.photo} alt="" />
                    <div className="line-text">
                      <b>{t(dish.name)}</b>
                      <span>{money(dish.price * qty)}</span>
                    </div>
                    <Qty value={qty} onDec={() => dec(dish.id)} onInc={() => add(dish.id)} name={t(dish.name)} size="sm" />
                  </li>
                ))}
              </ul>
              <button className="link-btn" onClick={clearCart}>{t('Savatni tozalash')}</button>
            </div>

            <div className="panel-foot">
              <Totals {...totals} />
              <button className="btn btn-primary btn-lg btn-block" onClick={() => { close(); navigate('/checkout'); }}>
                {t('Rasmiylashtirish')}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
