import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_DISHES, getDish, getRestaurant } from '../data';
import { useStore } from '../store.jsx';
import { money } from '../lib/format.js';
import Icon from './Icon.jsx';
import Qty from './Qty.jsx';

const BODIES = { address: AddressForm, swap: SwapCart, lucky: LuckyDish, dish: DishDetails };

export default function Modals() {
  const { modal, closeModal } = useStore();

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);

  const Body = modal && BODIES[modal.type];
  if (!Body) return null;
  const wide = modal.type === 'dish' || modal.type === 'lucky';

  return (
    <div className="overlay center" onClick={closeModal}>
      <div className={`modal ${wide ? 'modal-photo' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal-close" onClick={closeModal} aria-label="Yopish"><Icon name="close" /></button>
        <Body {...modal} />
      </div>
    </div>
  );
}

function AddressForm() {
  const { address, setAddress, closeModal } = useStore();
  const [value, setValue] = useState(address);

  const submit = (e) => {
    e.preventDefault();
    setAddress(value.trim());
    closeModal();
  };

  return (
    <form onSubmit={submit}>
      <h2>Yetkazish manzili</h2>
      <p className="modal-text">Kuryer buyurtmani shu manzilga olib boradi.</p>
      <label className="field">
        Ko'cha, uy, xonadon
        <input autoFocus required value={value} onChange={(e) => setValue(e.target.value)} placeholder="Amir Temur ko'chasi, 15-uy" />
      </label>
      <button className="btn btn-primary btn-lg btn-block">Saqlash</button>
    </form>
  );
}

function SwapCart({ dishId, qty }) {
  const { totals, replaceCartWith, closeModal } = useStore();
  const next = getRestaurant(getDish(dishId).rid);

  return (
    <>
      <h2>Savat yangilansinmi?</h2>
      <p className="modal-text">
        Savatda «{totals.restaurant?.name}» taomlari bor. Bitta buyurtmada faqat bitta oshxona bo'lishi mumkin.
        Savatni tozalab, «{next.name}»dan boshlaysizmi?
      </p>
      <div className="modal-actions">
        <button className="btn btn-soft btn-lg" onClick={closeModal}>Bekor qilish</button>
        <button className="btn btn-primary btn-lg" onClick={() => { replaceCartWith(dishId, qty); closeModal(); }}>
          Yangilash
        </button>
      </div>
    </>
  );
}

function DishDetails({ dishId }) {
  const { add, closeModal, notify } = useStore();
  const [qty, setQty] = useState(1);
  const dish = getDish(dishId);
  const discounted = dish.price !== dish.base;

  const submit = () => {
    if (add(dish.id, qty)) {
      notify(`${dish.name} savatga qo'shildi`);
      closeModal();
    }
  };

  return (
    <>
      <img className="modal-img" src={dish.photo} alt="" />
      <div className="modal-pad">
        <h2>{dish.name}</h2>
        <p className="modal-text">{dish.desc}</p>
        <div className="dish-price">
          <b>{money(dish.price)}</b>
          {discounted && <s>{money(dish.base)}</s>}
          <span>{dish.weight}</span>
        </div>
        <div className="modal-buy">
          <Qty value={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => q + 1)} name={dish.name} />
          <button className="btn btn-primary btn-lg" onClick={submit}>
            Savatga qo'shish · {money(dish.price * qty)}
          </button>
        </div>
      </div>
    </>
  );
}

const randomDish = () => ALL_DISHES[Math.floor(Math.random() * ALL_DISHES.length)];

function LuckyDish() {
  const { add, closeModal, notify } = useStore();
  const navigate = useNavigate();
  const [dish, setDish] = useState(randomDish);
  const restaurant = getRestaurant(dish.rid);

  const addToCart = () => {
    if (add(dish.id)) {
      notify(`${dish.name} savatga qo'shildi`);
      closeModal();
    }
  };

  return (
    <>
      <img className="modal-img" key={dish.id} src={dish.photo} alt="" />
      <div className="modal-pad">
        <span className="eyebrow">Bugungi taklif</span>
        <h2 aria-live="polite">{dish.name}</h2>
        <p className="modal-text">
          {dish.desc}. «{restaurant.name}» · {restaurant.time}–{restaurant.time + 10} daqiqa
        </p>
        <div className="dish-price"><b>{money(dish.price)}</b><span>{dish.weight}</span></div>
        <div className="modal-actions">
          <button className="btn btn-soft btn-lg" onClick={() => setDish(randomDish())}>Boshqasini ko'rsat</button>
          <button className="btn btn-primary btn-lg" onClick={addToCart}>Savatga qo'shish</button>
        </div>
        <button className="link-btn" onClick={() => { closeModal(); navigate(`/r/${restaurant.id}`); }}>
          «{restaurant.name}» menyusini ochish
        </button>
      </div>
    </>
  );
}
