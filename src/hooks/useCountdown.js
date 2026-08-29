import { useCallback, useEffect, useRef, useState } from 'react';

import { COUNTDOWN_TICK_MS } from '../constants/gameConfig';

/**
 * Tartışma turunun geri sayımı.
 *
 * Önemli karar: kalan süreyi her tik'te "eldeki sayıdan 200 ms düşerek" değil,
 * BİTİŞ ANINI saatle karşılaştırarak hesaplıyoruz (Date.now). Sebebi: tarayıcı,
 * sekme arka plandayken setInterval'i yavaşlatır veya atlar. Düşerek saysaydık
 * telefon kilitlenip açıldığında sayaç olması gerekenden ileride kalırdı.
 *
 * @param {number} durationSeconds - turun toplam süresi
 * @param {() => void} onExpire - süre bitince bir kez çağrılır
 */
export function useCountdown({ durationSeconds, onExpire }) {
  const [remainingMs, setRemainingMs] = useState(() => durationSeconds * 1000);
  const [isRunning, setIsRunning] = useState(true); // rol dağıtımı bitti, tur hemen başlasın

  // Kalan süreyi state'in yanında ref'te de tutuyoruz: effect'in içindeki tik
  // fonksiyonu güncel değeri okuyabilsin ama effect her tik'te yeniden kurulmasın.
  const remainingRef = useRef(remainingMs);
  const deadlineRef = useRef(null);

  // onExpire her render'da yeni bir fonksiyon olabilir; ref'te tutunca
  // sayacı bu yüzden sıfırdan kurmak zorunda kalmıyoruz.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  const writeRemaining = useCallback((ms) => {
    const safe = Math.max(0, ms);
    remainingRef.current = safe;
    setRemainingMs(safe);
    return safe;
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;

    deadlineRef.current = Date.now() + remainingRef.current;

    const timer = setInterval(() => {
      if (writeRemaining(deadlineRef.current - Date.now()) === 0) {
        setIsRunning(false);
        onExpireRef.current?.();
      }
    }, COUNTDOWN_TICK_MS);

    // Ekran kapanınca ya da duraklatınca sayacı bırak (StrictMode'un çift
    // çalıştırması dâhil; aksi hâlde iki interval birden dönerdi).
    return () => {
      clearInterval(timer);
      deadlineRef.current = null;
    };
  }, [isRunning, writeRemaining]);

  const pause = useCallback(() => setIsRunning(false), []);

  const resume = useCallback(() => {
    // Süresi dolmuş sayacı "devam" ile diriltmenin anlamı yok.
    if (remainingRef.current > 0) setIsRunning(true);
  }, []);

  const addSeconds = useCallback(
    (seconds) => {
      const bonusMs = seconds * 1000;
      // Sayaç çalışıyorsa bitiş anını da ötele; yoksa bir sonraki tik eklediğimiz
      // süreyi eski bitiş anına bakarak hemen geri silerdi.
      if (deadlineRef.current !== null) deadlineRef.current += bonusMs;
      writeRemaining(remainingRef.current + bonusMs);
    },
    [writeRemaining],
  );

  return { remainingMs, isRunning, pause, resume, addSeconds };
}
