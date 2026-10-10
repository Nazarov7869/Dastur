// Logotip: tungi rejimda oq yozuvli, kunduzgi rejimda yashil yozuvli nusxa ko'rsatiladi (styles.css)
export default function Logo() {
  return (
    <span className="logo-wrap">
      <img className="logo-img logo-night" src="/logo/ulfatlar-tungi.svg" alt="Ulfatlar" width="470" height="102" />
      <img className="logo-img logo-day" src="/logo/ulfatlar-tongi.svg" alt="Ulfatlar" width="470" height="102" />
    </span>
  );
}
