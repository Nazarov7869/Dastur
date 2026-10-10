import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_DISHES, getDish, getRestaurant } from '../data';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';
import MapPicker from './MapPicker.jsx';
import Qty from './Qty.jsx';

const BODIES = { address: AddressForm, swap: SwapCart, lucky: LuckyDish, dish: DishDetails };

export default function Modals() {
  const { modal, closeModal, t } = useStore();

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);

  const Body = modal && BODIES[modal.type];
  if (!Body) return null;
  const wide = modal.type === 'dish' || modal.type === 'lucky';
  const kind = wide ? 'modal-photo' : modal.type === 'address' ? 'modal-map' : '';

  return (
    <div className="overlay center" onClick={closeModal}>
      <div className={`modal ${kind}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal-close" onClick={closeModal} aria-label={t('Yopish')}><Icon name="close" /></button>
        <Body {...modal} />
      </div>
    </div>
  );
}

function AddressForm() {
  const { address, setAddress, location, setLocation, closeModal, t } = useStore();
  const [value, setValue] = useState(address);
  const [point, setPoint] = useState(location);
  const [pointError, setPointError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!point) return setPointError(true);
    setAddress(value.trim());
    setLocation(point);
    closeModal();
  };

  return (
    <form onSubmit={submit}>
      <h2>{t('Yetkazish manzili')}</h2>
      <p className="modal-text">{t('Kuryer buyurtmani shu manzilga olib boradi.')}</p>
      <MapPicker value={point} onChange={(p) => { setPoint(p); setPointError(false); }} onAddress={setValue} />
      {pointError && <p className="field-error" role="alert">{t('Avval xaritadan yetkazish joyini belgilang.')}</p>}
      <label className="field">
        {t("Manzil (xaritadan aniqlanadi, kerak bo'lsa tuzating)")}
        <input required value={value} onChange={(e) => setValue(e.target.value)} placeholder={t('Xaritadan joyni tanlang')} />
      </label>
      <button className="btn btn-primary btn-lg btn-block">{t('Saqlash')}</button>
    </form>
  );
}

function SwapCart({ dishId, qty }) {
  const { totals, replaceCartWith, closeModal, t } = useStore();
  const next = getRestaurant(getDish(dishId).rid);

  return (
    <>
      <h2>{t('Savat yangilansinmi?')}</h2>
      <p className="modal-text">
        {t("Savatda «{a}» taomlari bor. Bitta buyurtmada faqat bitta oshxona bo'lishi mumkin. Savatni tozalab, «{b}»dan boshlaysizmi?", {
          a: totals.restaurant?.name,
          b: next.name
        })}
      </p>
      <div className="modal-actions">
        <button className="btn btn-soft btn-lg" onClick={closeModal}>{t('Bekor qilish')}</button>
        <button className="btn btn-primary btn-lg" onClick={() => { replaceCartWith(dishId, qty); closeModal(); }}>
          {t('Yangilash')}
        </button>
      </div>
    </>
  );
}

function DishDetails({ dishId }) {
  const { add, closeModal, notify, t, money, weight } = useStore();
  const [qty, setQty] = useState(1);
  const dish = getDish(dishId);
  const discounted = dish.price !== dish.base;
  const name = t(dish.name);

  const submit = () => {
    if (add(dish.id, qty)) {
      notify(t("{name} savatga qo'shildi", { name }));
      closeModal();
    }
  };

  return (
    <>
      <img className="modal-img" src={dish.photo} alt="" />
      <div className="modal-pad">
        <h2>{name}</h2>
        <p className="modal-text">{t(dish.desc)}</p>
        <div className="dish-price">
          <b>{money(dish.price)}</b>
          {discounted && <s>{money(dish.base)}</s>}
          <span>{weight(dish.weight)}</span>
        </div>
        <div className="modal-buy">
          <Qty value={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => q + 1)} name={name} />
          <button className="btn btn-primary btn-lg" onClick={submit}>
            {t("Savatga qo'shish")} · {money(dish.price * qty)}
          </button>
        </div>
      </div>
    </>
  );
}

const randomDish = () => ALL_DISHES[Math.floor(Math.random() * ALL_DISHES.length)];

function LuckyDish() {
  const { add, closeModal, notify, t, money, weight, eta } = useStore();
  const navigate = useNavigate();
  const [dish, setDish] = useState(randomDish);
  const restaurant = getRestaurant(dish.rid);
  const name = t(dish.name);

  const addToCart = () => {
    if (add(dish.id)) {
      notify(t("{name} savatga qo'shildi", { name }));
      closeModal();
    }
  };

  return (
    <>
      <img className="modal-img" key={dish.id} src={dish.photo} alt="" />
      <div className="modal-pad">
        <span className="eyebrow">{t('Bugungi taklif')}</span>
        <h2 aria-live="polite">{name}</h2>
        <p className="modal-text">
          {t(dish.desc)}. «{restaurant.name}» · {eta(restaurant)}
        </p>
        <div className="dish-price"><b>{money(dish.price)}</b><span>{weight(dish.weight)}</span></div>
        <div className="modal-actions">
          <button className="btn btn-soft btn-lg" onClick={() => setDish(randomDish())}>{t("Boshqasini ko'rsat")}</button>
          <button className="btn btn-primary btn-lg" onClick={addToCart}>{t("Savatga qo'shish")}</button>
        </div>
        <button className="link-btn" onClick={() => { closeModal(); navigate(`/r/${restaurant.id}`); }}>
          {t('«{name}» menyusini ochish', { name: restaurant.name })}
        </button>
      </div>
    </>
  );
}
