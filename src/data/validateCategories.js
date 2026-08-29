import { MIN_WORDS_PER_CATEGORY } from '../constants/gameConfig';

/**
 * categories.js kullanıcı tarafından elle düzenlenecek bir dosya; bu yüzden içeriğine
 * güvenmiyoruz. Burada temizleyip doğruluyoruz ki bozuk bir satır oyunu çökertmesin.
 *
 * Dönen değer:
 *   { categories: [temiz kategoriler], issues: ['insan-okur uyarı metinleri'] }
 *
 * Saf (pure) fonksiyon — konsola bir şey basmaz, sadece sonuç döner. Böylece hem
 * uygulamada hem testte kullanılabilir. Uyarıları basma işini çağıran taraf yapar.
 */
export function validateCategories(rawCategories) {
  const issues = [];

  if (!Array.isArray(rawCategories)) {
    return { categories: [], issues: ['CATEGORIES bir dizi değil.'] };
  }

  const seenIds = new Set();
  const categories = [];

  rawCategories.forEach((category, categoryIndex) => {
    const label = `Kategori #${categoryIndex + 1}`;

    if (!category || typeof category !== 'object') {
      issues.push(`${label}: geçersiz kayıt, atlandı.`);
      return;
    }

    const id = typeof category.id === 'string' ? category.id.trim() : '';
    const name = typeof category.name === 'string' ? category.name.trim() : '';

    if (!id) {
      issues.push(`${label}: "id" alanı eksik, atlandı.`);
      return;
    }
    if (!name) {
      issues.push(`"${id}": "name" alanı eksik, atlandı.`);
      return;
    }
    if (seenIds.has(id)) {
      issues.push(`"${id}": bu id daha önce kullanılmış, ikinci kayıt atlandı.`);
      return;
    }

    const words = sanitizeWords(category.words, id, issues);

    if (words.length < MIN_WORDS_PER_CATEGORY) {
      issues.push(
        `"${name}": en az ${MIN_WORDS_PER_CATEGORY} geçerli kelime gerekiyor, atlandı.`,
      );
      return;
    }

    seenIds.add(id);
    categories.push({ id, name, words });
  });

  if (categories.length === 0) {
    issues.push('Hiç geçerli kategori kalmadı — oyun başlatılamaz.');
  }

  return { categories, issues };
}

/** Bir kategorinin kelime listesini temizler; bozuk kayıtları eleyip uyarı üretir. */
function sanitizeWords(rawWords, categoryId, issues) {
  if (!Array.isArray(rawWords)) {
    issues.push(`"${categoryId}": "words" bir dizi değil.`);
    return [];
  }

  const seenWords = new Set();
  const words = [];

  rawWords.forEach((entry, wordIndex) => {
    const position = `"${categoryId}" #${wordIndex + 1}`;

    if (!entry || typeof entry !== 'object') {
      issues.push(`${position}: geçersiz kelime kaydı, atlandı.`);
      return;
    }

    const word = typeof entry.word === 'string' ? entry.word.trim() : '';
    const hint = typeof entry.hint === 'string' ? entry.hint.trim() : '';

    if (!word) {
      issues.push(`${position}: "word" alanı boş, atlandı.`);
      return;
    }

    const wordKey = word.toLocaleLowerCase('tr');
    if (seenWords.has(wordKey)) {
      issues.push(`${position}: "${word}" bu kategoride zaten var, ikincisi atlandı.`);
      return;
    }

    // hint eksikse kelimeyi atmıyoruz: oyun oynanabilir, sadece o kelime "yanıltıcı
    // ipucu" modunda kategori ipucuna düşer (bkz. roundSetup).
    if (!hint) {
      issues.push(`${position}: "${word}" için "hint" yok, ipucu modunda kategori gösterilecek.`);
    }

    seenWords.add(wordKey);
    words.push({ word, hint: hint || null });
  });

  return words;
}
