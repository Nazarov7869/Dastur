import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { fetchOrder } from '../api.js';
import { ORDER_POLL_MS, ORDER_STEPS, ORDER_STEP_MS, getRestaurant } from '../data';
import { useStore } from '../store.jsx';
import Icon from '../components/Icon.jsx';
import Totals from '../components/Totals.jsx';

const LAST = ORDER_STEPS.length - 1;
const demoStep = (order) => Math.min(LAST, Math.floor((Date.now() - order.createdAt) / ORDER_STEP_MS));

export default function Order() {
  const { order, updateOrderStatus, t, money, eta } = useStore();
  const tracked = Boolean(order?.publicId); // backendga yuborilgan buyurtma
  const [demo, setDemo] = useState(() => (order && !tracked ? demoStep(order) : 0));

  // Haqiqiy buyurtma: holatni backenddan so'rab turamiz (oshxona uni admin panelda o'zgartiradi)
  useEffect(() => {
    if (!tracked || order.status === 'delivered' || order.status === 'cancelled') return;
    const check = () => fetchOrder(order.publicId).then((o) => updateOrderStatus(o.status)).catch(() => {});
    check();
    const timer = setInterval(check, ORDER_POLL_MS);
    return () => clearInterval(timer);
  }, [tracked, order?.publicId, order?.status, updateOrderStatus]);

  // Namuna rejimi: holat buyurtma vaqtidan boshlab o'zi oldinga siljiydi
  useEffect(() => {
    if (!order || tracked || demo >= LAST) return;
    const timer = setInterval(() => setDemo(demoStep(order)), 500);
    return () => clearInterval(timer);
  }, [order, tracked, demo]);

  if (!order) return <Navigate to="/" replace />;
  const restaurant = getRestaurant(order.rid);
  const cancelled = order.status === 'cancelled';
  const step = tracked ? Math.max(0, ORDER_STEPS.findIndex((s) => s.status === order.status)) : demo;
  const done = step === LAST;

  return (
    <main className="sheet page-sheet">
      <div className="container page order">
        <div className="card order-status">
          <span className="eyebrow">{t('Buyurtma № {no}', { no: order.no })}</span>
          <h1 aria-live="polite">{cancelled ? t('Buyurtma bekor qilindi') : t(ORDER_STEPS[step].title)}</h1>
          <p>
            {cancelled
              ? t('Afsuski, oshxona bu buyurtmani bajara olmadi.')
              : done
                ? t('Buyurtma topshirildi.')
                : restaurant && `«${restaurant.name}» · ${eta(restaurant)}`}
          </p>

          {!cancelled && (
            <ol className="timeline">
              {ORDER_STEPS.map((s, i) => (
                <li key={s.status} className={i < step || done ? 'done' : i === step ? 'now' : ''}>
                  <span className="dot">{(i < step || done) && <Icon name="check" size={14} />}</span>
                  <b>{t(s.title)}</b>
                  <p>{t(s.text)}</p>
                </li>
              ))}
            </ol>
          )}
          {!tracked && <p className="note">{t("Namuna rejimi: holatlar o'zi almashadi, buyurtma hech qayerga yuborilmagan.")}</p>}
        </div>

        <aside className="card summary">
          <h2>{t('Tafsilotlar')}</h2>
          <dl className="details">
            <div><dt>{t('Manzil')}</dt><dd>{order.address}</dd></div>
            <div><dt>{t('Telefon')}</dt><dd>{order.phone}</dd></div>
            <div><dt>{t("To'lov")}</dt><dd>{t(order.pay)}</dd></div>
            {order.note && <div><dt>{t('Izoh')}</dt><dd>{order.note}</dd></div>}
          </dl>
          <ul className="summary-lines">
            {order.lines.map((line) => (
              <li key={line.id}>
                <span>{line.qty} ×</span>
                <b>{t(line.name)}</b>
                <span>{money(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <Totals {...order} />
          <Link to="/" className="btn btn-soft btn-lg btn-block">{t('Bosh sahifaga qaytish')}</Link>
        </aside>
      </div>
    </main>
  );
}
