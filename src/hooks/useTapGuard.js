import { useEffect, useState } from 'react';

import { TAP_GUARD_MS } from '../constants/gameConfig';

/**
 * Pass-and-play'de butonlar aynı konumda olduğu için hızlı çift dokunma
 * bir sonraki ekranın butonuna da basıyor — bu da başkasının rolünü açığa
 * çıkarabiliyor. Ekran değiştikten sonra butonu kısa süre pasif tutuyoruz.
 *
 * @param {unknown} resetKey - değiştiğinde koruma yeniden başlar (örn. isRevealed)
 * @returns {boolean} buton artık basılabilir mi
 */
export function useTapGuard(resetKey) {
  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    setIsArmed(false);
    const timer = setTimeout(() => setIsArmed(true), TAP_GUARD_MS);
    // Bileşen kalkarsa sayacı temizle (StrictMode'un çift çalıştırması dâhil).
    return () => clearTimeout(timer);
  }, [resetKey]);

  return isArmed;
}
