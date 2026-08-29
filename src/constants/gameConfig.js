/**
 * Oyunun tüm "sihirli sayıları" burada. Kuralı değiştirmek istersen kod içinde
 * arama yapmana gerek kalmasın diye tek dosyada topladım.
 */

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

/** Bu sayıdan az oyuncuda 2. sahtekâr seçeneği kapalı kalır. */
export const MIN_PLAYERS_FOR_TWO_IMPOSTORS = 8;
export const MAX_IMPOSTORS = 2;

export const MIN_DURATION_SECONDS = 30;
export const MAX_DURATION_SECONDS = 600; // 10 dakika
export const DURATION_STEP_SECONDS = 30;
export const DEFAULT_DURATION_SECONDS = 180; // 3 dakika

/** Tartışma sırasında "+30 sn" butonunun eklediği süre. */
export const TIME_BONUS_SECONDS = 30;

/** Puanlama: kazanan taraftaki her oyuncuya verilen puan. */
export const POINTS_FOR_DETECTIVE_WIN = 1;
export const POINTS_FOR_IMPOSTOR_WIN = 2; // sahtekârlar azınlıkta olduğu için daha yüksek

/** Sayaç bu saniyenin altına inince kırmızıya döner (görsel uyarı). */
export const URGENT_THRESHOLD_SECONDS = 30;

/**
 * Sayacın ekranı tazeleme sıklığı (ms). Saniyeden küçük tutuyoruz ki
 * gösterilen değer gerçek saatten yarım saniyeden fazla geri kalmasın.
 */
export const COUNTDOWN_TICK_MS = 200;

/** Bir kategorinin oyuna girebilmesi için gereken en az kelime sayısı. */
export const MIN_WORDS_PER_CATEGORY = 2;

/**
 * Pass-and-play ekranlarında yanlışlıkla çift dokunmayı engellemek için
 * butonun pasif kaldığı süre (ms). Bkz. hooks/useTapGuard.js
 */
export const TAP_GUARD_MS = 500;

/** Oyunun hangi ekranda olduğu. Tek doğruluk kaynağı bu liste. */
export const PHASES = {
  SETUP: 'setup',
  REVEAL: 'reveal',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  RESULT: 'result',
};

/** Sahtekârın rol ekranında ne göreceği. */
export const IMPOSTOR_CLUE_MODES = {
  NONE: 'none',
  CATEGORY: 'category',
  HINT: 'hint',
};

export const DEFAULT_IMPOSTOR_CLUE_MODE = IMPOSTOR_CLUE_MODES.CATEGORY;

/** Kurulum ekranındaki radyo grubunu bu listeden üreteceğiz (tek kaynak). */
export const IMPOSTOR_CLUE_MODE_OPTIONS = [
  {
    value: IMPOSTOR_CLUE_MODES.NONE,
    label: 'Hiçbir ipucu yok',
    description: 'Sahtekâr sadece sahtekâr olduğunu bilir. En zor mod.',
  },
  {
    value: IMPOSTOR_CLUE_MODES.CATEGORY,
    label: 'Sadece kategori',
    description: 'Sahtekâr kategoriyi görür, kelimeyi bilmez. Dengeli mod.',
  },
  {
    value: IMPOSTOR_CLUE_MODES.HINT,
    label: 'Yanıltıcı ipucu kelime',
    description: 'Sahtekâr kategoriyi ve benzer ama yanlış olabilecek bir kelime görür. En eğlenceli mod.',
  },
];

export const WINNERS = {
  DETECTIVES: 'detectives',
  IMPOSTORS: 'impostors',
};
