import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ONLINE } from '../data';
import { useStore } from '../store.jsx';
import Icon from '../components/Icon.jsx';
import MapPicker from '../components/MapPicker.jsx';
import Totals from '../components/Totals.jsx';

// id buyurtmada saqlanadi va ko'rsatishda tarjima qilinadi
const PAYMENTS = [
  { id: 'Naqd pul', text: 'Kuryerga naqd' },
  { id: 'Karta', text: 'Kuryerga terminal orqali' }
];

export default function Checkout() {
  const { totals, address, setAddress, location, setLocation, phone, setPhone, placeOrder, t, money, eta } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address, phone, name: '', note: '', pay: PAYMENTS[0].id });
  const [point, setPoint] = useState(location);
  const [pointError, setPointError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const { lines, restaurant } = totals;

  if (!lines.length) {
    return (
      <main className="sheet page-sheet">
        <div className="container page empty">
          <b>{t("Savat bo'sh")}</b>
          <p>{t('Rasmiylashtirish uchun avval taom tanlang.')}</p>
          <Link to="/" className="btn btn-primary btn-lg">{t("Oshxonalarga o'tish")}</Link>
        </div>
      </main>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    // Manzil xaritadan tanlanishi shart — kuryer aynan shu nuqtaga boradi
    if (!point) {
      setPointError(true);
      document.getElementById('map-step')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (!form.address.trim()) {
      setAddressError(true);
      document.getElementById('address')?.focus();
      return;
    }
    setAddressError(false);
    if (form.phone.replace(/\D/g, '').length < 12) {
      setPhoneError(true);
      document.getElementById('phone')?.focus();
      return;
    }
    setPhoneError(false);
    setSendError('');
    setSending(true);
    setAddress(form.address.trim());
    setLocation(point);
    setPhone(form.phone.trim());
    try {
      await placeOrder({ address: form.address.trim(), location: point, phone: form.phone.trim(), name: form.name.trim(), note: form.note.trim(), pay: form.pay });
      navigate('/order');
    } catch (error) {
      // 400 — menyu o'zgargan (taom tugagan), 429 — juda ko'p urinish, qolgani — aloqa yo'q
      if (error.status === 400) setSendError("Ba'zi taomlar hozir sotuvda yo'q. Sahifani yangilab, qayta urinib ko'ring.");
      else if (error.status === 429) setSendError("Juda ko'p urinish bo'ldi. Birozdan keyin qayta urinib ko'ring.");
      else setSendError("Buyurtmani yuborib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
      setSending(false);
    }
  };

  return (
    <main className="sheet page-sheet">
      <div className="container page">
        <Link to={`/r/${restaurant.id}`} className="back">
          <Icon name="back" size={16} /> {t('{name} menyusiga qaytish', { name: restaurant.name })}
        </Link>
        <h1>{t('Buyurtmani rasmiylashtirish')}</h1>

        <form className="checkout" onSubmit={submit}>
          <div className="checkout-form">
            <fieldset className="card" id="map-step">
              <legend><span>1</span> {t('Qayerga yetkazamiz?')}</legend>
              <MapPicker
                value={point}
                onChange={(p) => { setPoint(p); setPointError(false); }}
                onAddress={(text) => setForm((f) => ({ ...f, address: text }))}
              />
              {pointError && <p className="field-error" role="alert">{t('Avval xaritadan yetkazish joyini belgilang.')}</p>}
              <label className="field">
                {t("Manzil (xaritadan aniqlanadi, kerak bo'lsa tuzating)")}
                <input id="address" value={form.address} onChange={set('address')} placeholder={t('Xaritadan joyni tanlang')} aria-invalid={addressError} />
              </label>
              {addressError && <p className="field-error under-field" role="alert">{t('Manzilni yozing yoki xaritadan qayta tanlang.')}</p>}
              <label className="field">
                {t('Kuryerga izoh (ixtiyoriy)')}
                <textarea rows="2" value={form.note} onChange={set('note')} placeholder={t("Uy, xonadon, mo'ljal")} />
              </label>
            </fieldset>

            <fieldset className="card">
              <legend><span>2</span> {t('Kim qabul qiladi?')}</legend>
              <div className="field-row">
                <label className="field">
                  {t('Ism (ixtiyoriy)')}
                  <input value={form.name} onChange={set('name')} placeholder={t('Ismingiz')} autoComplete="given-name" />
                </label>
                <label className="field">
                  {t('Telefon raqam')}
                  <input id="phone" required type="tel" value={form.phone} onChange={set('phone')} placeholder="+998 90 123 45 67" aria-invalid={phoneError} autoComplete="tel" />
                </label>
              </div>
              {phoneError && <p className="field-error" role="alert">{t("Telefon raqamni to'liq kiriting: +998 XX XXX XX XX")}</p>}
            </fieldset>

            <fieldset className="card">
              <legend><span>3</span> {t("To'lov usuli")}</legend>
              <div className="options">
                {PAYMENTS.map((p) => (
                  <label key={p.id} className="option">
                    <input type="radio" name="pay" value={p.id} checked={form.pay === p.id} onChange={set('pay')} />
                    <span><b>{t(p.id)}</b>{t(p.text)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className="card summary">
            <h2>{t('Buyurtmangiz')}</h2>
            <p className="summary-from">{restaurant.name} · {eta(restaurant)}</p>
            <ul className="summary-lines">
              {lines.map(({ dish, qty }) => (
                <li key={dish.id}>
                  <span>{qty} ×</span>
                  <b>{t(dish.name)}</b>
                  <span>{money(dish.price * qty)}</span>
                </li>
              ))}
            </ul>
            <Totals {...totals} />
            {sendError && <p className="field-error send-error" role="alert">{t(sendError)}</p>}
            <button className="btn btn-primary btn-lg btn-block" disabled={sending}>
              {sending ? t('Yuborilmoqda…') : t('Buyurtmani tasdiqlash')}
            </button>
            {!ONLINE && <p className="note">{t('Namuna rejimi: buyurtma hech qayerga yuborilmaydi.')}</p>}
          </aside>
        </form>
      </div>
    </main>
  );
}
