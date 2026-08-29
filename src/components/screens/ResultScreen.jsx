import { IMPOSTOR_CLUE_MODES, WINNERS } from '../../constants/gameConfig';
import { getVotersByTarget } from '../../game/voting';
import { useTapGuard } from '../../hooks/useTapGuard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ScoreBoard from '../result/ScoreBoard';
import VoteBreakdown from '../result/VoteBreakdown';

/**
 * Turun sonucu: kim kazandı, kelime neydi, sahtekâr kimdi, oylar nasıl dağıldı.
 * Buradaki bilgilerin hepsi artık açık — tur bitti.
 */
export default function ResultScreen({ round, settings, result, votes, scores, onNextRound, onFinish }) {
  const { players } = settings;
  const detectivesWon = result.winner === WINNERS.DETECTIVES;
  const impostorNames = round.impostorIndexes.map((index) => players[index]);
  const votersByTarget = getVotersByTarget(votes, players.length);
  // Oylamanın son butonu da tam genişlikteydi. Buradaki yanlış dokunuşun bedeli ağır:
  // yeni tur başlarsa sonuç ekranına geri dönüş yok.
  const isNextRoundArmed = useTapGuard(round.number);

  return (
    <>
      <Card>
        <div className={`result-banner${detectivesWon ? '' : ' result-banner--impostor'}`}>
          <span className="result-banner__title">
            {detectivesWon ? '✅ Dedektifler kazandı!' : '🕵️ Sahtekâr kazandı!'}
          </span>
          <span className="result-banner__subtitle">{describeOutcome(result, impostorNames)}</span>
        </div>

        <div className="result-word">
          <span className="result-word__category">{round.categoryName}</span>
          <strong className="result-word__value">{round.word}</strong>
          {/* İpucu modu kullanıldıysa sahtekârın neye bakarak konuştuğunu göstermek
              turun en eğlenceli kısmı; masaya "haklıymışım" dedirtiyor. */}
          {round.effectiveClueMode === IMPOSTOR_CLUE_MODES.HINT && round.hint && (
            <span className="result-word__hint">Sahtekâr şunu görüyordu: {round.hint}</span>
          )}
        </div>

        <p className="result-impostors">
          {impostorNames.length > 1 ? 'Sahtekârlar' : 'Sahtekâr'}:{' '}
          <strong>{impostorNames.join(', ')}</strong>
        </p>
      </Card>

      <Card title="Oy dağılımı">
        <VoteBreakdown
          players={players}
          tally={result.tally}
          votersByTarget={votersByTarget}
          impostorIndexes={round.impostorIndexes}
        />
      </Card>

      <Card title={`Puan durumu · ${round.number}. tur sonu`}>
        <ScoreBoard players={players} scores={scores} />
      </Card>

      <div className="result-actions">
        <Button size="lg" fullWidth onClick={onNextRound} disabled={!isNextRoundArmed}>
          Yeni Tur
        </Button>
        <Button variant="secondary" fullWidth onClick={onFinish}>
          Oyunu Bitir
        </Button>
      </div>
    </>
  );
}

/** Sonucun tek cümlelik gerekçesi. */
function describeOutcome(result, impostorNames) {
  if (result.isUndecided) {
    return 'Oylar eşit dağıldı, masa karar veremedi. Beraberlikte sahtekâr kazanır.';
  }

  if (result.winner === WINNERS.DETECTIVES) {
    return impostorNames.length > 1
      ? 'Sahtekârların ikisi de yakalandı.'
      : 'Sahtekâr doğru bilindi.';
  }

  if (result.caughtIndexes.length > 0) {
    return 'Sahtekârlardan biri yakalandı ama diğeri kurtuldu.';
  }

  return 'Yanlış kişi suçlandı.';
}
