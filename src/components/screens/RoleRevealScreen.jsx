import { useState } from 'react';

import { isImpostor } from '../../game/roundSetup';
import { useTapGuard } from '../../hooks/useTapGuard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import RoleCard from '../role/RoleCard';

/**
 * Pass-and-play rol gösterimi: telefon elden ele geziyor.
 *
 * Sıradaki oyuncu değiştiğinde kartın tekrar kapanması gerekiyor. Bunu useEffect ile
 * sıfırlamak yerine alt bileşene `key={revealIndex}` vererek yapıyoruz: React o bileşeni
 * baştan kurar, iç state doğal olarak sıfırlanır. Daha az kod, unutulacak bağımlılık yok.
 */
export default function RoleRevealScreen({ round, players, onNext }) {
  const currentIndex = round.revealIndex;

  return (
    <PlayerReveal
      key={currentIndex}
      playerName={players[currentIndex]}
      playerNumber={currentIndex + 1}
      playerCount={players.length}
      isLastPlayer={currentIndex === players.length - 1}
      round={round}
      isPlayerImpostor={isImpostor(round, currentIndex)}
      onNext={onNext}
    />
  );
}

function PlayerReveal({
  playerName,
  playerNumber,
  playerCount,
  isLastPlayer,
  round,
  isPlayerImpostor,
  onNext,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  // Ekran her değiştiğinde butonu kısa süre kilitler; çift dokunma bir sonraki
  // oyuncunun rolünü açmasın diye.
  const isButtonArmed = useTapGuard(isRevealed);

  return (
    <Card>
      <div className="reveal__progress">
        Rol dağıtımı · {playerNumber} / {playerCount}
      </div>

      {isRevealed ? (
        <>
          <RoleCard round={round} isImpostor={isPlayerImpostor} />
          <Button size="lg" fullWidth onClick={onNext} disabled={!isButtonArmed}>
            {isLastPlayer ? 'Gördüm, tartışmaya başla' : 'Gördüm, telefonu sıradakine ver'}
          </Button>
        </>
      ) : (
        <>
          <div className="reveal__handoff">
            <span className="reveal__handoff-label">Telefonu şu kişiye ver:</span>
            <strong className="reveal__handoff-name">{playerName}</strong>
            <p className="reveal__handoff-note">
              Sadece {playerName} baksın. Hazır olduğunda butona dokun.
            </p>
          </div>
          <Button
            size="lg"
            fullWidth
            onClick={() => setIsRevealed(true)}
            disabled={!isButtonArmed}
          >
            Rolümü Göster
          </Button>
        </>
      )}
    </Card>
  );
}
