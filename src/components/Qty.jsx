import Icon from './Icon.jsx';

// Miqdor boshqaruvi: − n +
export default function Qty({ value, onDec, onInc, name, size = '' }) {
  return (
    <div className={`qty ${size}`}>
      <button type="button" onClick={onDec} aria-label={`${name} — kamaytirish`}><Icon name="minus" size={16} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={onInc} aria-label={`${name} — ko'paytirish`}><Icon name="plus" size={16} /></button>
    </div>
  );
}
