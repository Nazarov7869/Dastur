import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getRestaurant } from '../data';
import { useStore } from '../store.jsx';
import { distance } from '../lib/format.js';
import DishCard from '../components/DishCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Restaurant() {
  const { id } = useParams();
  const restaurant = getRestaurant(id);
  const { query, favs, toggleFav } = useStore();
  const [active, setActive] = useState('');

  const sections = useMemo(() => {
    if (!restaurant) return [];
    const q = query.trim().toLowerCase();
    return restaurant.sections
      .map((s) => ({
        ...s,
        dishes: s.dishes.filter((d) => !q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q))
      }))
      .filter((s) => s.dishes.length);
  }, [restaurant, query]);

  // Sahifa aylantirilganda yon menyuda joriy bo'limni belgilaymiz
  useEffect(() => {
    const nodes = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!nodes.length) return;
    setActive(nodes[0].id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-130px 0px -60% 0px' }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  if (!restaurant) return <Navigate to="/" replace />;
  const r = restaurant;
  const fav = favs.includes(r.id);

  return (
    <main>
      <div className="cover">
        <img src={r.cover} alt="" />
      </div>

      <div className="container">
        <section className="rinfo">
          <Link to="/" className="back"><Icon name="back" size={16} /> Barcha oshxonalar</Link>
          <div className="rinfo-main">
            <div>
              <h1>{r.name}</h1>
              <p className="rinfo-cuisine">{r.cuisine}</p>
            </div>
            <button className={`btn btn-soft ${fav ? 'is-fav' : ''}`} onClick={() => toggleFav(r.id)} aria-pressed={fav}>
              <Icon name="heart" size={18} filled={fav} /> {fav ? 'Sevimlilarda' : 'Sevimlilarga'}
            </button>
          </div>
          <ul className="facts">
            <li className="fact-rating"><b><Icon name="star" size={16} filled /> {r.rating}</b><span>{r.reviews} ta baho</span></li>
            <li><b><Icon name="clock" size={16} /> {r.time}–{r.time + 10} daq</b><span>yetkazish</span></li>
            <li><b><Icon name="pin" size={16} /> {distance(r.dist)}</b><span>{r.address}</span></li>
            <li><b>{r.hours}</b><span>ish vaqti</span></li>
            {r.discount > 0 && <li className="fact-sale"><b>−{r.discount}%</b><span>barcha taomlarga</span></li>}
          </ul>
        </section>

        <div className="menu">
          {sections.length > 0 && (
            <nav className="menu-nav" aria-label="Menyu bo'limlari">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''}>
                  {s.title} <span>{s.dishes.length}</span>
                </a>
              ))}
            </nav>
          )}

          <div className="menu-body">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="menu-section">
                <h2>{s.title}</h2>
                <div className="dishes">
                  {s.dishes.map((d) => <DishCard key={d.id} dish={d} />)}
                </div>
              </section>
            ))}

            {sections.length === 0 && (
              <div className="empty">
                <b>Bunday taom topilmadi</b>
                <p>Qidiruv so'zini o'zgartirib ko'ring.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
