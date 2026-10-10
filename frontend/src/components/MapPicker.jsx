import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';

// Do'stlik shahri markazi (Jizzax viloyati) — nuqta tanlanmagan bo'lsa xarita shu yerdan ochiladi
const DEFAULT_CENTER = [40.5247, 68.0358];

const pinIcon = L.divIcon({ className: 'map-pin', html: '<span></span>', iconSize: [34, 44], iconAnchor: [17, 42] });

// Koordinata bo'yicha manzil matnini topadi (OpenStreetMap Nominatim xizmati)
async function reverseGeocode({ lat, lng }, lang, signal) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}&accept-language=${lang}`;
  const data = await (await fetch(url, { signal })).json();
  const a = data.address || {};
  const street = [a.road || a.pedestrian || a.residential, a.house_number].filter(Boolean).join(', ');
  const area = a.neighbourhood || a.suburb || a.quarter || a.village || a.hamlet;
  const town = a.town || a.city || a.county;
  return [street, area, town].filter(Boolean).join(', ') || data.display_name || '';
}

/**
 * Xaritadan yetkazish nuqtasini tanlash.
 * value — {lat, lng} yoki null; onChange — yangi nuqta; onAddress — nuqta bo'yicha topilgan manzil matni.
 */
export default function MapPicker({ value, onChange, onAddress }) {
  const { t, lang } = useStore();
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const requestRef = useRef(null);
  const handlers = useRef({});
  const [status, setStatus] = useState(''); // '' | 'searching' | 'geo-error'

  // Xarita hodisalari eng oxirgi props bilan ishlashi uchun
  handlers.current = { onChange, onAddress, lang };

  const pick = (latlng, zoom) => {
    const point = { lat: +latlng.lat.toFixed(6), lng: +latlng.lng.toFixed(6) };
    const map = mapRef.current;
    if (!markerRef.current) {
      markerRef.current = L.marker(point, { icon: pinIcon, draggable: true, keyboard: false }).addTo(map);
      markerRef.current.on('dragend', (e) => pick(e.target.getLatLng()));
    } else {
      markerRef.current.setLatLng(point);
    }
    if (zoom) map.setView(point, Math.max(map.getZoom(), zoom));
    handlers.current.onChange(point);

    // Oldingi so'rov hali tugamagan bo'lsa, uni bekor qilamiz
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus('searching');
    reverseGeocode(point, handlers.current.lang, controller.signal)
      .then((text) => {
        if (text) handlers.current.onAddress(text);
        setStatus('');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('');
      });
  };

  useEffect(() => {
    const map = L.map(boxRef.current, { zoomControl: true, attributionControl: true }).setView(
      value ? [value.lat, value.lng] : DEFAULT_CENTER,
      value ? 17 : 14
    );
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    if (value) {
      markerRef.current = L.marker([value.lat, value.lng], { icon: pinIcon, draggable: true, keyboard: false }).addTo(map);
      markerRef.current.on('dragend', (e) => pick(e.target.getLatLng()));
    }
    map.on('click', (e) => pick(e.latlng));
    // Oyna ichida ochilganda o'lcham to'g'ri hisoblanishi uchun
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(timer);
      requestRef.current?.abort();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Xarita bir marta yaratiladi; keyingi o'zgarishlar pick() orqali boradi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return setStatus('geo-error');
    setStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (pos) => pick({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 17),
      () => setStatus('geo-error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="map-picker">
      <div className="map-box" ref={boxRef} role="application" aria-label={t('Xarita: yetkazish joyini belgilang')} />
      <div className="map-bar">
        <button type="button" className="btn btn-soft map-locate" onClick={locate}>
          <Icon name="pin" size={18} /> {t('Mening joylashuvim')}
        </button>
        <p className={status === 'geo-error' ? 'map-hint error' : 'map-hint'} role="status">
          {status === 'geo-error'
            ? t("Joylashuvni aniqlab bo'lmadi. Brauzerda ruxsat bering yoki xaritadan o'zingiz belgilang.")
            : status === 'searching'
              ? t('Manzil aniqlanmoqda…')
              : value
                ? t('Nuqta belgilandi. Aniqroq qilish uchun belgini suring.')
                : t('Xaritani bosib, yetkazish joyini belgilang.')}
        </p>
      </div>
    </div>
  );
}
