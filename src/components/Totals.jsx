import { money } from '../lib/format.js';

// Hisob-kitob qatorlari: savat paneli, rasmiylashtirish va buyurtma sahifalarida ishlatiladi
export default function Totals({ subtotal, delivery, service, total }) {
  return (
    <dl className="totals">
      <div><dt>Taomlar</dt><dd>{money(subtotal)}</dd></div>
      <div><dt>Yetkazib berish</dt><dd>{delivery ? money(delivery) : 'Bepul'}</dd></div>
      <div><dt>Xizmat haqi</dt><dd>{money(service)}</dd></div>
      <div className="totals-sum"><dt>Jami</dt><dd>{money(total)}</dd></div>
    </dl>
  );
}
