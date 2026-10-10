import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';

// Miqdor boshqaruvi: − n +
export default function Qty({ value, onDec, onInc, name, size = '' }) {
  const { t } = useStore();
  return (
    <div className={`qty ${size}`}>
      <button type="button" onClick={onDec} aria-label={`${name} — ${t('kamaytirish')}`}><Icon name="minus" size={16} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={onInc} aria-label={`${name} — ${t("ko'paytirish")}`}><Icon name="plus" size={16} /></button>
    </div>
  );
}
