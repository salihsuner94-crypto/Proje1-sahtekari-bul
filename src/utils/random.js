/** Diziyi kopyalayıp karıştırır (Fisher-Yates). Orijinali değiştirmez. */
export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Diziden rastgele bir eleman. Boş dizide null döner. */
export function pickRandomItem(items) {
  if (!items || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * 0..total-1 aralığından birbirinden farklı `count` adet indeks seçer.
 * Sahtekâr atamasında kullanılıyor: aynı oyuncu iki kez sahtekâr olamasın diye.
 */
export function pickDistinctIndexes(count, total) {
  const allIndexes = Array.from({ length: total }, (_, index) => index);
  return shuffle(allIndexes)
    .slice(0, Math.max(0, Math.min(count, total)))
    .sort((a, b) => a - b);
}
