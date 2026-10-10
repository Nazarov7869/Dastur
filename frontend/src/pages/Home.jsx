import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_DISHES, AVERAGE_TIME, CATEGORIES, FREE_DELIVERY_FROM, RESTAURANTS } from '../data';
import { useStore } from '../store.jsx';
import DishCard from '../components/DishCard.jsx';
import Icon from '../components/Icon.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';

const SORTERS = {
  rating: (a, b) => b.rating - a.rating,
  time: (a, b) => a.time - b.time,
  dist: (a, b) => a.dist - b.dist
};


export default function Home() {
  const { query, favs, address, openModal, t, money, eta } = useStore();
  const [filter, setFilter] = useState('all'); // 'all' | 'fav' | toifa id
  const [sort, setSort] = useState('default');
  const allRef = useRef(null);
  const q = query.trim().toLowerCase();

  const deals = useMemo(() => RESTAURANTS.filter((r) => r.discount || r.hasPromo).sort((a, b) => b.discount - a.discount), []);
  const fast = useMemo(() => RESTAURANTS.filter((r) => r.time <= 20).sort(SORTERS.time), []);
  const topRating = Math.max(0, ...RESTAURANTS.map((r) => r.rating));

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
          <span className="eyebrow">{t("Do'stlik tumani bo'ylab yetkazib berish")}</span>
          <h1>
            {t('Sevimli taomingiz —')} <em>{t('issiq holda')}</em> {t('eshigingiz oldida')}
          </h1>
          <p>
            {t('Milliy oshxonadan sushigacha: {r} ta oshxona, {d} dan ortiq taom. {sum}dan boshlab yetkazib berish bepul.', {
              r: RESTAURANTS.length,
              d: Math.floor(ALL_DISHES.length / 10) * 10,
              sum: money(FREE_DELIVERY_FROM)
            })}
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => allRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              {t("Oshxonalarni ko'rish")}
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => openModal('address')}>
              <Icon name="pin" size={18} /> {address ? t("Manzilni o'zgartirish") : t('Manzilni kiritish')}
            </button>
          </div>
          <ul className="hero-stats">
            <li><b>{AVERAGE_TIME} {t('daq')}</b>{t("o'rtacha yetkazish")}</li>
            <li><b>{topRating}</b>{t('eng yuqori reyting')}</li>
            <li><b>{deals.length}</b>{t('bugungi aksiya')}</li>
          </ul>
        </div>
      </section>

      <div className="sheet home-sheet">
        <section className="container block">
          <h2>{t('Bugun nima yeymiz?')}</h2>
          <div className="cats scroller">
            {CATEGORIES.map((c) => (
              <button key={c.id} className="cat" onClick={() => pickCategory(c.id)}>
                <img src={c.photo} alt="" loading="lazy" />
                <span>{t(c.label)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="container block">
          <div className="block-head">
            <h2>{t('Bugungi aksiyalar')}</h2>
            <p>{t('Chegirma va aksiyalar narxlarda hisobga olingan')}</p>
          </div>
          <div className="deals scroller">
            {deals.map((r) => (
              <Link key={r.id} to={`/r/${r.id}`} className="deal">
                <img src={r.cover} alt="" loading="lazy" />
                <span className="deal-off">{r.discount ? `−${r.discount}%` : t('Aksiya')}</span>
                <span className="deal-text">
                  <b>{r.name}</b>
                  {r.discount ? t('barcha taomlarga') : t('tanlangan taomlarga')} · {eta(r)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="container block">
          <div className="lucky">
            <img src="/img/kabob.jpg" alt="" loading="lazy" />
            <div>
              <span className="eyebrow">{t('Tanlash qiyinmi?')}</span>
              <h2>{t('Bizga ishoning — bitta taom taklif qilamiz')}</h2>
              <button className="btn btn-primary btn-lg" onClick={() => openModal('lucky')}>
                <Icon name="spark" size={18} /> {t('Taklif olish')}
              </button>
            </div>
          </div>
        </section>

        <section className="container block">
          <div className="block-head">
            <h2>{t('Tez yetkazadi')}</h2>
            <p>{t('20 daqiqagacha')}</p>
          </div>
          <div className="row scroller">
            {fast.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </section>

        <section className="container block" ref={allRef} id="oshxonalar">
          <div className="block-head">
            <h2>{t('Barcha oshxonalar')}</h2>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('Saralash')}>
              <option value="default">{t('Saralash: tavsiya etilgan')}</option>
              <option value="rating">{t("Reyting bo'yicha")}</option>
              <option value="time">{t('Tezroq yetkazadigan')}</option>
              <option value="dist">{t('Yaqinroq')}</option>
            </select>
          </div>

          <div className="chips scroller">
            <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>{t('Hammasi')}</button>
            <button className={`chip ${filter === 'fav' ? 'on' : ''}`} onClick={() => setFilter('fav')}>
              <Icon name="heart" size={15} /> {t('Sevimlilar')}
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`chip ${filter === c.id ? 'on' : ''}`} onClick={() => setFilter(c.id)}>
                {t(c.label)}
              </button>
            ))}
          </div>

          {list.length ? (
            <div className="grid">
              {list.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          ) : (
            <div className="empty">
              <b>{filter === 'fav' ? t("Sevimlilar hali yo'q") : t('Bu toifada oshxona topilmadi')}</b>
              {filter === 'fav' && <p>{t('Oshxona rasmidagi yurakcha belgisini bosing — u shu yerda saqlanadi.')}</p>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SearchResults({ q, query }) {
  const { t } = useStore();
  // Qidiruv joriy tildagi nomlar bo'yicha ishlaydi
  const restaurants = RESTAURANTS.filter(
    (r) => r.name.toLowerCase().includes(q) || r.cuisines.some((c) => t(c).toLowerCase().includes(q))
  );
  const dishes = ALL_DISHES.filter((d) => t(d.name).toLowerCase().includes(q)).slice(0, 12);

  return (
    <main className="sheet page-sheet">
      <div className="container results">
        <h1>{t("«{q}» bo'yicha natijalar", { q: query.trim() })}</h1>

        {restaurants.length > 0 && (
          <section className="block">
            <h2>{t('Oshxonalar')}</h2>
            <div className="grid">
              {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </section>
        )}

        {dishes.length > 0 && (
          <section className="block">
            <h2>{t('Taomlar')}</h2>
            <div className="dishes">
              {dishes.map((d) => <DishCard key={d.id} dish={d} showRestaurant />)}
            </div>
          </section>
        )}

        {!restaurants.length && !dishes.length && (
          <div className="empty">
            <b>{t('Hech narsa topilmadi')}</b>
            <p>{t("So'zni boshqacha yozib ko'ring, masalan: «osh», «pitsa», «sushi».")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
