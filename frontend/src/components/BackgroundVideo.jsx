import { useState } from 'react';
import { useStore } from '../store.jsx';

// Osh va shashlik videolari ketma-ket almashadi
const CLIPS = ['/video/osh1.mp4', '/video/shashlik1.mp4', '/video/osh2.webm', '/video/shashlik2.mp4'];

// Butun sayt ortida aylanib turadigan fon videosi (ovozsiz)
export default function BackgroundVideo() {
  const { t } = useStore();
  const [index, setIndex] = useState(0);
  // Harakatni kamaytirish yoqilgan bo'lsa, video o'rniga rasm ko'rsatiladi
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const next = () => setIndex((i) => (i + 1) % CLIPS.length);

  return (
    <>
      <div className="bg" aria-hidden="true">
        {playing && <video key={CLIPS[index]} src={CLIPS[index]} autoPlay muted playsInline onEnded={next} onError={next} />}
      </div>
      <button className="bg-toggle" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
        {playing ? t("Fon videosini to'xtatish") : t('Fon videosini yoqish')}
      </button>
    </>
  );
}
