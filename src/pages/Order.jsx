import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ORDER_STEPS, ORDER_STEP_MS, getDish, getRestaurant } from '../data';
import { useStore } from '../store.jsx';
import { money } from '../lib/format.js';
import Icon from '../components/Icon.jsx';
import Totals from '../components/Totals.jsx';

const LAST = ORDER_STEPS.length - 1;
const stepAt = (order) => Math.min(LAST, Math.floor((Date.now() - order.createdAt) / ORDER_STEP_MS));

export default function Order() {
  const { order } = useStore();
  const [step, setStep] = useState(() => (order ? stepAt(order) : 0));

  // Namunada holat buyurtma vaqtidan boshlab o'zi oldinga siljiydi
  useEffect(() => {
    if (!order || step >= LAST) return;
    const timer = setInterval(() => setStep(stepAt(order)), 500);
    return () => clearInterval(timer);
  }, [order, step]);

  if (!order) return <Navigate to="/" replace />;
  const restaurant = getRestaurant(order.rid);
  const done = step === LAST;

  return (
    <main className="container page order">
      <div className="card order-status">
        <span className="eyebrow">Buyurtma № {order.no}</span>
        <h1 aria-live="polite">{ORDER_STEPS[step].title}</h1>
        <p>
          {done ? 'Buyurtma topshirildi.' : `«${restaurant.name}» · taxminan ${restaurant.time}–${restaurant.time + 10} daqiqa`}
        </p>

        <ol className="timeline">
          {ORDER_STEPS.map((s, i) => (
            <li key={s.title} className={i < step || done ? 'done' : i === step ? 'now' : ''}>
              <span className="dot">{(i < step || done) && <Icon name="check" size={14} />}</span>
              <b>{s.title}</b>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="note">Namuna rejimi: holatlar o'zi almashadi, buyurtma hech qayerga yuborilmagan.</p>
      </div>

      <aside className="card summary">
        <h2>Tafsilotlar</h2>
        <dl className="details">
          <div><dt>Manzil</dt><dd>{order.address}</dd></div>
          <div><dt>Telefon</dt><dd>{order.phone}</dd></div>
          <div><dt>To'lov</dt><dd>{order.pay}</dd></div>
          {order.note && <div><dt>Izoh</dt><dd>{order.note}</dd></div>}
        </dl>
        <ul className="summary-lines">
          {order.lines.map(({ id, qty }) => {
            const dish = getDish(id);
            return dish && (
              <li key={id}>
                <span>{qty} ×</span>
                <b>{dish.name}</b>
                <span>{money(dish.price * qty)}</span>
              </li>
            );
          })}
        </ul>
        <Totals {...order} />
        <Link to="/" className="btn btn-soft btn-lg btn-block">Bosh sahifaga qaytish</Link>
      </aside>
    </main>
  );
}
