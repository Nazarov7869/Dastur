import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LANGS } from '../i18n';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

export default function Header() {
  const { query, setQuery, address, openModal, totals, setCartOpen, lang, setLang, theme, setTheme, t } = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onRestaurant = pathname.startsWith('/r/');
  const canSearch = pathname === '/' || onRestaurant;
  const dark = theme === 'dark';
  const headerRef = useRef(null);

  // Header balandligi ekran kengligiga qarab o'zgaradi (telefonda ikki qator) — uni CSS ga uzatamiz
  useEffect(() => {
    const el = headerRef.current;
    const update = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sahifa almashganda qidiruvni tozalaymiz va tepaga qaytamiz
  useEffect(() => {
    setQuery('');
    window.scrollTo(0, 0);
  }, [pathname, setQuery]);

  useEffect(() => {
    document.title = `Ulfatlar — ${t('taom yetkazib berish')}`;
  }, [t]);

  return (
    <header className="header" ref={headerRef}>
      <div className="container header-in">
        <Link to="/" className="logo" aria-label={`Ulfatlar — ${t('bosh sahifa')}`}>
          <Logo />
        </Link>

        <button className="addr" onClick={() => openModal('address')} aria-label={`${t('Yetkazish manzili')}: ${address || t('Manzilni kiriting')}`}>
          <Icon name="pin" />
          <span className="addr-text">
            <small>{t('Yetkazish manzili')}</small>
            <b>{address || t('Manzilni kiriting')}</b>
          </span>
        </button>

        <label className="search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => !canSearch && navigate('/')}
            placeholder={onRestaurant ? t('Shu oshxona menyusidan izlash') : t('Oshxona yoki taom izlash')}
            aria-label={t('Qidirish')}
          />
        </label>

        <div className="lang" role="group" aria-label={t('Til')}>
          {LANGS.map((l) => (
            <button key={l.id} className={lang === l.id ? 'on' : ''} onClick={() => setLang(l.id)} aria-pressed={lang === l.id} title={l.name} lang={l.id}>
              {l.label}
            </button>
          ))}
        </div>

        <button
          className="icon-btn theme-btn"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          aria-label={dark ? t("Kunduzgi rejimga o'tish") : t("Tungi rejimga o'tish")}
          title={dark ? t("Kunduzgi rejimga o'tish") : t("Tungi rejimga o'tish")}
        >
          <Icon name={dark ? 'sun' : 'moon'} />
        </button>

        <button className="btn btn-primary cart-btn" onClick={() => setCartOpen(true)} aria-label={t('Savat')}>
          <Icon name="bag" />
          <span className="cart-label">{t('Savat')}</span>
          {totals.count > 0 && <b className="cart-count">{totals.count}</b>}
        </button>
      </div>
    </header>
  );
}
