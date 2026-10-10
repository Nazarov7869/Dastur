import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getRestaurant } from '../data';
import { useStore } from '../store.jsx';
import DishCard from '../components/DishCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Restaurant() {
  const { id } = useParams();
  const restaurant = getRestaurant(id);
  const { query, favs, toggleFav, t, distance, eta } = useStore();
  const [active, setActive] = useState('');

  const sections = useMemo(() => {
    if (!restaurant) return [];
    const q = query.trim().toLowerCase();
    return restaurant.sections
      .map((s) => ({
        ...s,
        dishes: s.dishes.filter((d) => !q || t(d.name).toLowerCase().includes(q) || t(d.desc).toLowerCase().includes(q))
      }))
      .filter((s) => s.dishes.length);
  }, [restaurant, query, t]);

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

      <div className="sheet rest-sheet">
        <div className="container">
          <section className="rinfo">
            <Link to="/" className="back"><Icon name="back" size={16} /> {t('Barcha oshxonalar')}</Link>
            <div className="rinfo-main">
              <div>
                <h1>{r.name}</h1>
                <p className="rinfo-cuisine">{r.cuisines.map((c) => t(c)).join(' · ')}</p>
              </div>
              <button className={`btn btn-soft ${fav ? 'is-fav' : ''}`} onClick={() => toggleFav(r.id)} aria-pressed={fav}>
                <Icon name="heart" size={18} filled={fav} /> {fav ? t('Sevimlilarda') : t('Sevimlilarga')}
              </button>
            </div>
            <ul className="facts">
              <li className="fact-rating"><b><Icon name="star" size={16} filled /> {r.rating}</b><span>{t('{n} ta baho', { n: r.reviews })}</span></li>
              <li><b><Icon name="clock" size={16} /> {eta(r)}</b><span>{t('yetkazish')}</span></li>
              <li><b><Icon name="pin" size={16} /> {distance(r.dist)}</b><span>{r.address}</span></li>
              <li><b>{r.hours}</b><span>{t('ish vaqti')}</span></li>
              {r.discount > 0 && <li className="fact-sale"><b>−{r.discount}%</b><span>{t('barcha taomlarga')}</span></li>}
              {!r.discount && r.hasPromo && <li className="fact-sale"><b>{t('Aksiya')}</b><span>{t('tanlangan taomlarga')}</span></li>}
            </ul>
          </section>

          <div className="menu">
            {sections.length > 0 && (
              <nav className="menu-nav" aria-label={t("Menyu bo'limlari")}>
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''}>
                    {t(s.title)} <span>{s.dishes.length}</span>
                  </a>
                ))}
              </nav>
            )}

            <div className="menu-body">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="menu-section">
                  <h2>{t(s.title)}</h2>
                  <div className="dishes">
                    {s.dishes.map((d) => <DishCard key={d.id} dish={d} />)}
                  </div>
                </section>
              ))}

              {sections.length === 0 && (
                <div className="empty">
                  <b>{t('Bunday taom topilmadi')}</b>
                  <p>{t("Qidiruv so'zini o'zgartirib ko'ring.")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
