import { MAX_PLAYERS, MIN_PLAYERS } from '../constants/gameConfig';
import { normalizePlayerNames } from './gameReducer';

/**
 * Kurulum ekranının doğrulaması. Saf fonksiyon: aynı girdiye hep aynı sonucu döner,
 * ekranla ilgisi yok — bu yüzden hem butonu pasifleştirmek hem mesaj göstermek için
 * aynı yerden besleniyoruz (kural tekrarı olmasın diye).
 *
 * errors   → oyunu başlatmayı ENGELLER
 * warnings → sadece uyarır, oyun başlar
 */
export function getSetupIssues(settings, categories) {
  const errors = [];
  const warnings = [];

  const playerCount = settings.players.length;

  if (playerCount < MIN_PLAYERS) {
    errors.push(`En az ${MIN_PLAYERS} oyuncu gerekli.`);
  }
  if (playerCount > MAX_PLAYERS) {
    errors.push(`En fazla ${MAX_PLAYERS} oyuncu olabilir.`);
  }

  const selectedCategories = getSelectedCategories(settings, categories);

  if (selectedCategories.length === 0) {
    errors.push('En az bir kategori seçmelisin.');
  }

  if (settings.impostorCount >= playerCount) {
    errors.push('Sahtekâr sayısı oyuncu sayısından az olmalı.');
  }

  const duplicates = findDuplicateNames(settings.players);
  if (duplicates.length > 0) {
    warnings.push(
      `Aynı isim birden fazla kez var: ${duplicates.join(', ')}. Oylamada karışabilir.`,
    );
  }

  return { errors, warnings, canStart: errors.length === 0 };
}

/** Seçili id'leri gerçek kategori nesnelerine çevirir; bilinmeyen id'ler elenir. */
export function getSelectedCategories(settings, categories) {
  // Liste gelmezse çökmek yerine boş dön: çağıran taraf "havuz boş" durumunu zaten
  // ele alıyor (createRound null döner, oyun kurulumda kalır).
  if (!Array.isArray(categories)) return [];
  return categories.filter((category) => settings.selectedCategoryIds.includes(category.id));
}

/** Seçili kategorilerdeki toplam kelime sayısı (kurulumda özet olarak gösteriliyor). */
export function countSelectedWords(settings, categories) {
  return getSelectedCategories(settings, categories).reduce(
    (total, category) => total + category.words.length,
    0,
  );
}

function findDuplicateNames(players) {
  // Karşılaştırmayı normalize edilmiş (boşlar doldurulmuş) isimler üzerinden yapıyoruz,
  // çünkü oyunda görünecek olan isimler bunlar.
  const seen = new Set();
  const duplicates = new Set();

  normalizePlayerNames(players).forEach((name) => {
    const key = name.toLocaleLowerCase('tr');
    if (seen.has(key)) duplicates.add(name);
    seen.add(key);
  });

  return [...duplicates];
}
