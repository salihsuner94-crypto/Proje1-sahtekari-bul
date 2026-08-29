import { TIME_BONUS_SECONDS } from '../../constants/gameConfig';
import { useCountdown } from '../../hooks/useCountdown';
import { useTapGuard } from '../../hooks/useTapGuard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import CountdownTimer from '../discussion/CountdownTimer';
import TurnOrder from '../discussion/TurnOrder';

/**
 * Tartışma turu. Uygulamanın burada tek işi süreyi ve sırayı takip etmek;
 * ipuçları sözlü veriliyor.
 *
 * DİKKAT: Bu ekranda kelime de kategori de gösterilmez. Telefon masanın
 * ortasında durabildiği için burada görünen her bilgi sahtekâra hediye olur.
 */
export default function DiscussionScreen({ round, settings, onGoToVoting }) {
  const totalMs = settings.durationSeconds * 1000;
  const { remainingMs, isRunning, pause, resume, addSeconds } = useCountdown({
    durationSeconds: settings.durationSeconds,
    onExpire: onGoToVoting, // süre biterse oylamaya kendiliğinden geçer
  });

  // Rol dağıtımının son butonu da tam genişlikte ve alttaydı; hızlı çift dokunma
  // tartışmayı hiç başlamadan bitirebilirdi. Ekran açılınca butonu kısa süre kilitliyoruz.
  const isVoteButtonArmed = useTapGuard(round.number);

  const startingPlayer = settings.players[round.startingPlayerIndex];

  return (
    <Card title="Tartışma turu">
      <p className="discussion__intro">
        Konuşmaya <strong>{startingPlayer}</strong> başlıyor. Sırayla herkes kelimeyle ilgili{' '}
        <strong>tek bir ipucu</strong> versin. Kelimeyi doğrudan söylemek yok.
      </p>

      <CountdownTimer remainingMs={remainingMs} totalMs={totalMs} isRunning={isRunning} />

      <div className="discussion__controls">
        <Button variant="secondary" onClick={isRunning ? pause : resume}>
          {isRunning ? '⏸ Duraklat' : '▶ Devam et'}
        </Button>
        <Button variant="secondary" onClick={() => addSeconds(TIME_BONUS_SECONDS)}>
          +{TIME_BONUS_SECONDS} sn
        </Button>
      </div>

      <TurnOrder players={settings.players} startingPlayerIndex={round.startingPlayerIndex} />

      {/* Süre dolmadan da oylamaya geçilebilsin: masa erken karar verebilir. */}
      <Button size="lg" fullWidth onClick={onGoToVoting} disabled={!isVoteButtonArmed}>
        Oylamaya Geç
      </Button>
    </Card>
  );
}
