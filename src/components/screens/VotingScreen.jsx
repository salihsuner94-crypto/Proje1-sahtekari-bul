import { useState } from 'react';

import { useTapGuard } from '../../hooks/useTapGuard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import PlayerVoteList from '../voting/PlayerVoteList';

/**
 * Gizli oylama: telefon yine elden ele geziyor, herkes sırayla oy veriyor.
 *
 * Rol dağıtımındaki ile aynı kalıp: `key={currentVoterIndex}` sayesinde sıra
 * değişince alt bileşen sıfırdan kuruluyor, önceki oyuncunun seçimi ekranda kalmıyor.
 */
export default function VotingScreen({ players, currentVoterIndex, onCastVote }) {
  return (
    <VoterTurn
      key={currentVoterIndex}
      players={players}
      voterIndex={currentVoterIndex}
      onCastVote={onCastVote}
    />
  );
}

function VoterTurn({ players, voterIndex, onCastVote }) {
  const [isReady, setIsReady] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const isButtonArmed = useTapGuard(isReady);

  const voterName = players[voterIndex];

  if (!isReady) {
    return (
      <Card>
        <div className="reveal__progress">
          Oylama · {voterIndex + 1} / {players.length}
        </div>

        <div className="reveal__handoff">
          <span className="reveal__handoff-label">Sıra şu kişide:</span>
          <strong className="reveal__handoff-name">{voterName}</strong>
          <p className="reveal__handoff-note">
            Oyunu kimseye göstermeden ver. Herkes gizli oy kullanır.
          </p>
        </div>

        <Button size="lg" fullWidth onClick={() => setIsReady(true)} disabled={!isButtonArmed}>
          Oy Vermeye Hazırım
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="reveal__progress">
        Oylama · {voterIndex + 1} / {players.length}
      </div>

      <p className="vote-question">
        <strong>{voterName}</strong>, sence sahtekâr kim?
      </p>

      <PlayerVoteList
        players={players}
        voterIndex={voterIndex}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />

      {/* İki adım: önce isim seçiliyor, sonra onaylanıyor. Tek dokunuşta oy
          kaydetseydik yanlış isme değen parmak turu bitirirdi. */}
      <Button
        size="lg"
        fullWidth
        onClick={() => onCastVote(selectedIndex)}
        disabled={selectedIndex === null}
      >
        {selectedIndex === null ? 'Bir isim seç' : `Oyumu ver: ${players[selectedIndex]}`}
      </Button>
    </Card>
  );
}
