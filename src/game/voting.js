import {
  POINTS_FOR_DETECTIVE_WIN,
  POINTS_FOR_IMPOSTOR_WIN,
  WINNERS,
} from '../constants/gameConfig';

/**
 * Oylama kuralları. Hepsi saf fonksiyon: ekranı, React'i, zamanı bilmezler.
 * Böylece kuralı tek başına test edebiliyoruz.
 *
 * `votes` biçimi: { oyVerenIndex: oyVerilenIndex }
 */

/** Her oyuncunun kaç oy aldığı. Dizinin sırası oyuncu sırasıyla aynı. */
export function tallyVotes(votes, playerCount) {
  const tally = Array(playerCount).fill(0);

  Object.values(votes).forEach((targetIndex) => {
    // Bozuk veri gelirse sessizce atla; sayım yine de tutarlı kalsın.
    if (Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < playerCount) {
      tally[targetIndex] += 1;
    }
  });

  return tally;
}

/** Kime kimlerin oy verdiği — sonuç ekranındaki dökümü için. */
export function getVotersByTarget(votes, playerCount) {
  const voters = Array.from({ length: playerCount }, () => []);

  Object.entries(votes).forEach(([voterIndex, targetIndex]) => {
    if (targetIndex >= 0 && targetIndex < playerCount) {
      voters[targetIndex].push(Number(voterIndex));
    }
  });

  return voters;
}

/**
 * Oylamayı sonuca bağlar.
 *
 * Kural: en çok oy alan ilk N kişi suçlanır (N = o turdaki sahtekâr sayısı).
 * Kesim çizgisinde beraberlik varsa masa net bir karara varamamış sayılır ve
 * sahtekârlar kazanır — beraberliği rastgele bozmak, kimsenin hak etmediği bir
 * galibiyet üretirdi.
 *
 * Dedektiflerin kazanması için suçlananların TAMAMININ sahtekâr olması gerekir.
 */
export function resolveVoting({ votes, impostorIndexes, playerCount }) {
  const tally = tallyVotes(votes, playerCount);
  const impostorCount = impostorIndexes.length;

  // Çok oydan aza; eşitlikte oyuncu sırası (sadece kararlı bir sıralama için).
  const ranking = tally
    .map((count, index) => ({ index, count }))
    .sort((a, b) => b.count - a.count || a.index - b.index);

  const cutCount = ranking[impostorCount - 1]?.count ?? 0;
  const nextCount = ranking[impostorCount]?.count ?? -1;

  // Kesim çizgisinde eşitlik ya da suçlanacak kişinin hiç oyu yoksa karar yok.
  const isUndecided = cutCount === nextCount || cutCount === 0;

  const accusedIndexes = isUndecided
    ? []
    : ranking.slice(0, impostorCount).map((entry) => entry.index);

  const caughtIndexes = accusedIndexes.filter((index) => impostorIndexes.includes(index));
  const detectivesWin = caughtIndexes.length === impostorCount;

  return {
    tally,
    accusedIndexes,
    caughtIndexes,
    isUndecided,
    winner: detectivesWin ? WINNERS.DETECTIVES : WINNERS.IMPOSTORS,
  };
}

/**
 * Turun puanlarını mevcut skorlara ekler.
 * Sahtekâr kazanınca daha çok puan alıyor çünkü azınlıkta ve işi daha zor.
 */
export function awardPoints(scores, winner, impostorIndexes) {
  return scores.map((score, index) => {
    const isImpostorPlayer = impostorIndexes.includes(index);

    if (winner === WINNERS.IMPOSTORS) {
      return isImpostorPlayer ? score + POINTS_FOR_IMPOSTOR_WIN : score;
    }

    return isImpostorPlayer ? score : score + POINTS_FOR_DETECTIVE_WIN;
  });
}
