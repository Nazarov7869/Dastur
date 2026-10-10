export const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const money = (n) => `${num(n)} so'm`;
export const distance = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
