import { Link } from 'react-router-dom';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';

export default function RestaurantCard({ restaurant: r }) {
  const { favs, toggleFav, t, distance, eta } = useStore();
  const fav = favs.includes(r.id);

  return (
    <article className="rcard">
      <div className="rcard-photo">
        <img src={r.cover} alt="" loading="lazy" />
        {r.discount > 0 ? (
          <span className="tag tag-sale">−{r.discount}%</span>
        ) : (
          r.hasPromo && <span className="tag tag-sale">{t('Aksiya')}</span>
        )}
        <span className="tag tag-time"><Icon name="clock" size={14} /> {eta(r)}</span>
        <button
          className={`heart ${fav ? 'on' : ''}`}
          onClick={() => toggleFav(r.id)}
          aria-pressed={fav}
          aria-label={`${r.name} — ${t('sevimlilar')}`}
        >
          <Icon name="heart" size={18} filled={fav} />
        </button>
      </div>
      <div className="rcard-body">
        <h3><Link to={`/r/${r.id}`} className="stretched">{r.name}</Link></h3>
        <span className="rating"><Icon name="star" size={14} filled /> {r.rating}</span>
        <p>{r.cuisines.map((c) => t(c)).join(' · ')} · {distance(r.dist)}</p>
      </div>
    </article>
  );
}
