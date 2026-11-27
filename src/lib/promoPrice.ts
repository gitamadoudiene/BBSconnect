/** Discounted price, rounded down to a clean figure (500 F, or 100 F under 50 000 F). */
export function promoPrice(price: number, percent: number) {
  const raw = price * (1 - percent / 100);
  const step = price >= 50_000 ? 500 : 100;
  return Math.max(step, Math.floor(raw / step) * step);
}
