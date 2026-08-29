import { URGENT_THRESHOLD_SECONDS } from '../../constants/gameConfig';
import { describeClock, formatClock } from '../../utils/time';

/**
 * Sadece gösterim yapar; süreyi kimin saydığını bilmez (bkz. hooks/useCountdown).
 * Böylece sayacı ileride başka bir ekranda da kullanabiliriz.
 */
export default function CountdownTimer({ remainingMs, totalMs, isRunning }) {
  const isUrgent = remainingMs <= URGENT_THRESHOLD_SECONDS * 1000;
  // "+30 sn" ile süre toplamı aşabilir; çubuk taşmasın diye 0–1 arasına sıkıştırıyoruz.
  const progress = totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 0;

  const classNames = [
    'countdown',
    isUrgent && 'countdown--urgent',
    !isRunning && 'countdown--paused',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      {/*
        role="timer" + aria-live="off": ekran okuyucu her saniye konuşmasın.
        Okunacak metni aria-label'da veriyoruz, isteyen odaklanınca duyar.
      */}
      <div className="countdown__clock" role="timer" aria-live="off" aria-label={describeClock(remainingMs)}>
        {formatClock(remainingMs)}
      </div>

      <div className="countdown__bar">
        <div className="countdown__bar-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <p className="countdown__status">
        {isRunning ? 'Süre işliyor' : remainingMs === 0 ? 'Süre doldu' : 'Duraklatıldı'}
      </p>
    </div>
  );
}
