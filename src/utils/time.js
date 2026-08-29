/** Saniyeyi "3 dk", "3 dk 30 sn", "45 sn" gibi okunur metne çevirir (ayar ekranı için). */
export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds} sn`;
  if (seconds === 0) return `${minutes} dk`;
  return `${minutes} dk ${seconds} sn`;
}

/**
 * Geri sayım ekranı için "02:45" biçimi.
 * Saniye yerine milisaniye alıyoruz çünkü sayaç ms hassasiyetinde çalışıyor;
 * yukarı yuvarlıyoruz ki 1 ms kala bile "00:01" görünsün, 0 sadece süre bitince yazsın.
 */
export function formatClock(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Ekran okuyucular için "2 dakika 45 saniye" gibi sözlü karşılık. */
export function describeClock(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  return `${Math.floor(totalSeconds / 60)} dakika ${totalSeconds % 60} saniye kaldı`;
}
