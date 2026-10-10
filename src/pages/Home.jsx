import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_DISHES, AVERAGE_TIME, CATEGORIES, FREE_DELIVERY_FROM, RESTAURANTS } from '../data';
import { useStore } from '../store.jsx';
import { money } from '../lib/format.js';
import DishCard from '../components/DishCard.jsx';
import Icon from '../components/Icon.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';

const SORTERS = {
  rating: (a, b) => b.rating - a.rating,
  time: (a, b) => a.time - b.time,
  dist: (a, b) => a.dist - b.dist
};

const DEALS = RESTAURANTS.filter((r) => r.discount).sort((a, b) => b.discount - a.discount);
const FAST = RESTAURANTS.filter((r) => r.time <= 20).sort(SORTERS.time);
const TOP_RATING = Math.max(...RESTAURANTS.map((r) => r.rating));

export default function Home() {
  const { query, favs, address, openModal } = useStore();
  const [filter, setFilter] = useState('all'); // 'all' | 'fav' | toifa id
  const [sort, setSort] = useState('default');
  const allRef = useRef(null);
  const q = query.trim().toLowerCase();

  const list = useMemo(() => {
    const result = RESTAURANTS.filter((r) => {
      if (filter === 'fav') return favs.includes(r.id);
      return filter === 'all' || r.cats.includes(filter);
    });
    return SORTERS[sort] ? [...result].sort(SORTERS[sort]) : result;
  }, [filter, sort, favs]);

  const pickCategory = (id) => {
    setFilter(id);
    allRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (q) return <SearchResults q={q} query={query} />;

  return (
    <main>
      <section className="container hero">
        <div className="hero-text">
          <span className="eyebrow">Toshkent bo'ylab yetkazib berish</span>
          <h1>
            Sevimli taomingiz — <em>issiq holda</em> eshigingiz oldida
          </h1>
          <p>
            Milliy oshxonadan sushigacha: {RESTAURANTS.length} ta oshxona, {ALL_DISHES.length} dan ortiq taom.
            {' '}{money(FREE_DELIVERY_FROM)}dan boshlab yetkazib berish bepul.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => allRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              Oshxonalarni ko'rish
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => openModal('address')}>
              <Icon name="pin" size={18} /> {address ? "Manzilni o'zgartirish" : 'Manzilni kiritish'}
            </button>
          </div>
          <ul className="hero-stats">
            <li><b>{AVERAGE_TIME} daq</b>o'rtacha yetkazish</li>
            <li><b>{TOP_RATING}</b>eng yuqori reyting</li>
            <li><b>{DEALS.length} ta</b>bugungi chegirma</li>
          </ul>
        </div>

        <div className="hero-art" aria-hidden="true">
          <img className="hero-main" src="/img/covers/hero.jpg" alt="" />
          <img className="hero-small a" src="/img/plov.jpg" alt="" />
          <img className="hero-small b" src="/img/sushi1.jpg" alt="" />
          <span className="hero-chip"><Icon name="clock" size={16} /> {AVERAGE_TIME} daqiqada</span>
        </div>
      </section>

      <section className="container block">
        <h2>Bugun nima yeymiz?</h2>
        <div className="cats scroller">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="cat" onClick={() => pickCategory(c.id)}>
              <img src={c.photo} alt="" loading="lazy" />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="container block">
        <div className="block-head">
          <h2>Bugungi chegirmalar</h2>
          <p>Chegirma narxlarda allaqachon hisobga olingan</p>
        </div>
        <div className="deals scroller">
          {DEALS.map((r) => (
            <Link key={r.id} to={`/r/${r.id}`} className="deal">
              <img src={r.cover} alt="" loading="lazy" />
              <span className="deal-off">−{r.discount}%</span>
              <span className="deal-text">
                <b>{r.name}</b>
                barcha taomlarga · {r.time}–{r.time + 10} daq
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container block">
        <div className="lucky">
          <img src="/img/kebab1.jpg" alt="" loading="lazy" />
          <div>
            <span className="eyebrow">Tanlash qiyinmi?</span>
            <h2>Bizga ishoning — bitta taom taklif qilamiz</h2>
            <button className="btn btn-light btn-lg" onClick={() => openModal('lucky')}>
              <Icon name="spark" size={18} /> Taklif olish
            </button>
          </div>
        </div>
      </section>

      <section className="container block">
        <div className="block-head">
          <h2>Tez yetkazadi</h2>
          <p>20 daqiqagacha</p>
        </div>
        <div className="row scroller">
          {FAST.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      </section>

      <section className="container block" ref={allRef} id="oshxonalar">
        <div className="block-head">
          <h2>Barcha oshxonalar</h2>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Saralash">
            <option value="default">Saralash: tavsiya etilgan</option>
            <option value="rating">Reyting bo'yicha</option>
            <option value="time">Tezroq yetkazadigan</option>
            <option value="dist">Yaqinroq</option>
          </select>
        </div>

        <div className="chips scroller">
          <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>Hammasi</button>
          <button className={`chip ${filter === 'fav' ? 'on' : ''}`} onClick={() => setFilter('fav')}>
            <Icon name="heart" size={15} /> Sevimlilar
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={`chip ${filter === c.id ? 'on' : ''}`} onClick={() => setFilter(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        {list.length ? (
          <div className="grid">
            {list.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        ) : (
          <div className="empty">
            <b>{filter === 'fav' ? "Sevimlilar hali yo'q" : 'Bu toifada oshxona topilmadi'}</b>
            {filter === 'fav' && <p>Oshxona rasmidagi yurakcha belgisini bosing — u shu yerda saqlanadi.</p>}
          </div>
        )}
      </section>
    </main>
  );
}

function SearchResults({ q, query }) {
  const restaurants = RESTAURANTS.filter((r) => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
  const dishes = ALL_DISHES.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 12);

  return (
    <main className="container results">
      <h1>«{query.trim()}» bo'yicha natijalar</h1>

      {restaurants.length > 0 && (
        <section className="block">
          <h2>Oshxonalar</h2>
          <div className="grid">
            {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </section>
      )}

      {dishes.length > 0 && (
        <section className="block">
          <h2>Taomlar</h2>
          <div className="dishes">
            {dishes.map((d) => <DishCard key={d.id} dish={d} showRestaurant />)}
          </div>
        </section>
      )}

      {!restaurants.length && !dishes.length && (
        <div className="empty">
          <b>Hech narsa topilmadi</b>
          <p>So'zni boshqacha yozib ko'ring, masalan: «osh», «pitsa», «sushi».</p>
        </div>
      )}
    </main>
  );
}
