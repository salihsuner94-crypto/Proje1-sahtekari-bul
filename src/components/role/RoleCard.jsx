import { IMPOSTOR_CLUE_MODES } from '../../constants/gameConfig';

/**
 * Bir oyuncunun rolünü gösterir.
 * Üç ipucu modunun tamamı BURADA çözülüyor — ekranlar mod bilmek zorunda kalmasın diye.
 *
 * Dedektif her modda aynı şeyi görür: kategori + gerçek kelime.
 * Sahtekârın gördüğü moda göre değişir.
 */
export default function RoleCard({ round, isImpostor }) {
  if (isImpostor) {
    return (
      <div className="role-card role-card--impostor">
        <span className="role-card__badge">🕵️ SEN SAHTEKÂRSIN</span>
        <ImpostorClue round={round} />
        <p className="role-card__note">Kelimeyi bilmiyorsun. Dinle, uydur, belli etme!</p>
      </div>
    );
  }

  return (
    <div className="role-card role-card--detective">
      <span className="role-card__badge">✅ DEDEKTİFSİN</span>
      <span className="role-card__category">{round.categoryName}</span>
      <strong className="role-card__word">{round.word}</strong>
      <p className="role-card__note">
        Kelimeyi biliyorsun. İpucu ver ama sahtekâra kelimeyi hediye etme!
      </p>
    </div>
  );
}

function ImpostorClue({ round }) {
  switch (round.effectiveClueMode) {
    case IMPOSTOR_CLUE_MODES.CATEGORY:
      return (
        <>
          <span className="role-card__category">Kategori</span>
          <strong className="role-card__word">{round.categoryName}</strong>
        </>
      );

    // İpucu modunda kategori de gösteriliyor: ipucu kelime yanıltıcı olabildiği için
    // sahtekârın en azından hangi alanda konuştuğunu bilmesi gerekiyor.
    case IMPOSTOR_CLUE_MODES.HINT:
      return (
        <>
          <span className="role-card__category">Kategori</span>
          <strong className="role-card__word role-card__word--secondary">{round.categoryName}</strong>
          <span className="role-card__clue-label">İpucun</span>
          <strong className="role-card__word">{round.hint}</strong>
          <span className="role-card__warning">⚠ Bu kelime doğru olmayabilir!</span>
        </>
      );

    // IMPOSTOR_CLUE_MODES.NONE
    default:
      return <strong className="role-card__word role-card__word--empty">Hiçbir ipucun yok</strong>;
  }
}
