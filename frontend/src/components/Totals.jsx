import { useStore } from '../store.jsx';

// Hisob-kitob qatorlari: savat paneli, rasmiylashtirish va buyurtma sahifalarida ishlatiladi
export default function Totals({ subtotal, delivery, service, total }) {
  const { t, money } = useStore();
  return (
    <dl className="totals">
      <div><dt>{t('Taomlar')}</dt><dd>{money(subtotal)}</dd></div>
      <div><dt>{t('Yetkazib berish')}</dt><dd>{delivery ? money(delivery) : t('Bepul')}</dd></div>
      <div><dt>{t('Xizmat haqi')}</dt><dd>{money(service)}</dd></div>
      <div className="totals-sum"><dt>{t('Jami')}</dt><dd>{money(total)}</dd></div>
    </dl>
  );
}
