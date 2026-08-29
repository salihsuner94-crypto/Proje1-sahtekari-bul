import { IMPOSTOR_CLUE_MODES } from '../constants/gameConfig';
import { pickDistinctIndexes, pickRandomItem } from '../utils/random';
import { getSelectedCategories } from './setupValidation';

/**
 * Bir turu kurar: kategori seç → kelime seç → sahtekârları ata → başlayan oyuncuyu seç.
 * Saf fonksiyon değil (rastgelelik içeriyor) ama dışarıdan hiçbir şeye dokunmuyor;
 * sadece yeni bir `round` nesnesi üretiyor.
 *
 * @returns {object|null} kelime havuzu boşsa null
 */
export function createRound({ settings, categories, roundNumber, previousWord = null }) {
  const pool = getSelectedCategories(settings, categories);
  const category = pickRandomItem(pool);
  if (!category) return null;

  const entry = pickWord(category.words, previousWord);
  if (!entry) return null;

  const playerCount = settings.players.length;
  // Son bir güvenlik: sahtekâr sayısı asla oyuncu sayısına eşit olamaz,
  // yoksa "herkes sahtekâr" gibi anlamsız bir tur çıkar.
  const impostorCount = Math.min(settings.impostorCount, playerCount - 1);

  return {
    number: roundNumber,
    categoryId: category.id,
    categoryName: category.name,
    word: entry.word,
    hint: entry.hint,
    // Kelimenin hint'i yoksa "yanıltıcı ipucu" modu kategoriye düşer (bkz. resolveClueMode).
    effectiveClueMode: resolveClueMode(settings.impostorClueMode, entry.hint),
    impostorIndexes: pickDistinctIndexes(impostorCount, playerCount),
    startingPlayerIndex: Math.floor(Math.random() * playerCount),
    revealIndex: 0, // rol gösteriminde sıradaki oyuncu
  };
}

/**
 * Kelime seçer. Havuzda başka seçenek varsa bir önceki turun kelimesini tekrar
 * vermez — arka arkaya aynı kelimenin gelmesi oyunu bozuyor.
 */
function pickWord(words, previousWord) {
  const candidates =
    previousWord && words.length > 1 ? words.filter((entry) => entry.word !== previousWord) : words;

  return pickRandomItem(candidates.length > 0 ? candidates : words);
}

/** Kullanıcının seçtiği ipucu modunu, bu kelime için gerçekten uygulanabilir moda çevirir. */
export function resolveClueMode(requestedMode, hint) {
  if (requestedMode === IMPOSTOR_CLUE_MODES.HINT && !hint) {
    return IMPOSTOR_CLUE_MODES.CATEGORY;
  }
  return requestedMode;
}

/** Bir oyuncu bu turda sahtekâr mı? */
export function isImpostor(round, playerIndex) {
  return round.impostorIndexes.includes(playerIndex);
}
