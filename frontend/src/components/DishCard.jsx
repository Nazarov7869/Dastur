import { getRestaurant } from '../data';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';
import Qty from './Qty.jsx';

// Taom kartochkasi: matn chapda, rasm o'ngda. Bosilsa — batafsil oyna ochiladi.
export default function DishCard({ dish, showRestaurant = false }) {
  const { cart, add, dec, openModal, t, money, weight } = useStore();
  const qty = cart.items[dish.id] || 0;
  const discounted = dish.price !== dish.base;
  const name = t(dish.name);

  return (
    <article className={`dish ${qty ? 'in-cart' : ''}`}>
      <div className="dish-text">
        <h4>
          <button className="stretched" onClick={() => openModal('dish', { dishId: dish.id })}>{name}</button>
        </h4>
        {showRestaurant && <span className="dish-from">{getRestaurant(dish.rid).name}</span>}
        <p>{t(dish.desc)}</p>
        <div className="dish-price">
          <b>{money(dish.price)}</b>
          {discounted && <s>{money(dish.base)}</s>}
          <span>{weight(dish.weight)}</span>
        </div>
      </div>
      <div className="dish-photo">
        <img src={dish.photo} alt="" loading="lazy" />
        {discounted && <span className="tag tag-sale">−{Math.round((1 - dish.price / dish.base) * 100)}%</span>}
        {qty ? (
          <Qty value={qty} onDec={() => dec(dish.id)} onInc={() => add(dish.id)} name={name} size="sm" />
        ) : (
          <button className="dish-add" onClick={() => add(dish.id)} aria-label={`${name} — ${t("savatga qo'shish")}`}>
            <Icon name="plus" />
          </button>
        )}
      </div>
    </article>
  );
}
