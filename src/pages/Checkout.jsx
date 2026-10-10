import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { money } from '../lib/format.js';
import Icon from '../components/Icon.jsx';
import Totals from '../components/Totals.jsx';

const PAYMENTS = [
  { id: 'Naqd pul', text: 'Kuryerga naqd' },
  { id: 'Karta', text: 'Kuryerga terminal orqali' }
];

export default function Checkout() {
  const { totals, address, setAddress, phone, setPhone, placeOrder } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address, flat: '', phone, name: '', note: '', pay: PAYMENTS[0].id });
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const { lines, restaurant } = totals;

  if (!lines.length) {
    return (
      <main className="container page">
        <div className="empty">
          <b>Savat bo'sh</b>
          <p>Rasmiylashtirish uchun avval taom tanlang.</p>
          <Link to="/" className="btn btn-primary btn-lg">Oshxonalarga o'tish</Link>
        </div>
      </main>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    if (form.phone.replace(/\D/g, '').length < 12) {
      setError("Telefon raqamni to'liq kiriting: +998 XX XXX XX XX");
      document.getElementById('phone')?.focus();
      return;
    }
    const fullAddress = [form.address.trim(), form.flat.trim()].filter(Boolean).join(', ');
    setAddress(form.address.trim());
    setPhone(form.phone.trim());
    placeOrder({ address: fullAddress, phone: form.phone.trim(), name: form.name.trim(), note: form.note.trim(), pay: form.pay });
    navigate('/order');
  };

  return (
    <main className="container page">
      <Link to={`/r/${restaurant.id}`} className="back"><Icon name="back" size={16} /> {restaurant.name} menyusiga qaytish</Link>
      <h1>Buyurtmani rasmiylashtirish</h1>

      <form className="checkout" onSubmit={submit}>
        <div className="checkout-form">
          <fieldset className="card">
            <legend><span>1</span> Qayerga yetkazamiz?</legend>
            <label className="field">
              Ko'cha va uy
              <input required value={form.address} onChange={set('address')} placeholder="Amir Temur ko'chasi, 15-uy" />
            </label>
            <label className="field">
              Xonadon, podyezd, qavat (ixtiyoriy)
              <input value={form.flat} onChange={set('flat')} placeholder="42-xonadon, 2-podyezd, 5-qavat" />
            </label>
            <label className="field">
              Kuryerga izoh (ixtiyoriy)
              <textarea rows="2" value={form.note} onChange={set('note')} placeholder="Domofon kodi, mo'ljal" />
            </label>
          </fieldset>

          <fieldset className="card">
            <legend><span>2</span> Kim qabul qiladi?</legend>
            <div className="field-row">
              <label className="field">
                Ism (ixtiyoriy)
                <input value={form.name} onChange={set('name')} placeholder="Ismingiz" autoComplete="given-name" />
              </label>
              <label className="field">
                Telefon raqam
                <input id="phone" required type="tel" value={form.phone} onChange={set('phone')} placeholder="+998 90 123 45 67" aria-invalid={!!error} autoComplete="tel" />
              </label>
            </div>
            {error && <p className="field-error" role="alert">{error}</p>}
          </fieldset>

          <fieldset className="card">
            <legend><span>3</span> To'lov usuli</legend>
            <div className="options">
              {PAYMENTS.map((p) => (
                <label key={p.id} className="option">
                  <input type="radio" name="pay" value={p.id} checked={form.pay === p.id} onChange={set('pay')} />
                  <span><b>{p.id}</b>{p.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="card summary">
          <h2>Buyurtmangiz</h2>
          <p className="summary-from">{restaurant.name} · {restaurant.time}–{restaurant.time + 10} daqiqa</p>
          <ul className="summary-lines">
            {lines.map(({ dish, qty }) => (
              <li key={dish.id}>
                <span>{qty} ×</span>
                <b>{dish.name}</b>
                <span>{money(dish.price * qty)}</span>
              </li>
            ))}
          </ul>
          <Totals {...totals} />
          <button className="btn btn-primary btn-lg btn-block">Buyurtmani tasdiqlash</button>
          <p className="note">Namuna rejimi: buyurtma hech qayerga yuborilmaydi.</p>
        </aside>
      </form>
    </main>
  );
}
