import { CATEGORIES } from './categories';
import { validateCategories } from './validateCategories';

/**
 * Doğrulamayı modül yüklenirken BİR KEZ çalıştırıyoruz.
 * Kategoriler sabit veri olduğu için her render'da yeniden doğrulamanın anlamı yok.
 */
const validation = validateCategories(CATEGORIES);

if (validation.issues.length > 0) {
  console.warn(
    '[Sahtekârı Bul] categories.js içinde sorunlar bulundu:\n' +
      validation.issues.map((issue) => ` • ${issue}`).join('\n'),
  );
}

/** Oyunun kullanacağı, temizlenmiş kategori listesi. */
export const GAME_CATEGORIES = validation.categories;

/** Kurulum ekranında kullanıcıya gösterilecek uyarılar (genelde boş). */
export const CATEGORY_ISSUES = validation.issues;

export const TOTAL_WORD_COUNT = GAME_CATEGORIES.reduce(
  (total, category) => total + category.words.length,
  0,
);
