import { MAX_PLAYERS, MIN_PLAYERS } from '../../constants/gameConfig';
import Button from '../ui/Button';

/**
 * Oyuncu isimleri. İsim boş bırakılabilir; oyun başlarken "Oyuncu 3" gibi
 * doldurulur (placeholder da bunu gösteriyor ki kullanıcı ne olacağını bilsin).
 */
export default function PlayerListEditor({ players, onNameChange, onAdd, onRemove }) {
  const canAdd = players.length < MAX_PLAYERS;
  const canRemove = players.length > MIN_PLAYERS;

  return (
    <div className="player-list">
      <ol className="player-list__items">
        {players.map((name, index) => (
          // Oyuncuların kalıcı bir id'si yok; sıra değişmediği (sadece sondan
          // eklenip aradan silindiği) için index key burada güvenli.
          <li key={index} className="player-row">
            <span className="player-row__index">{index + 1}</span>

            <input
              className="player-row__input"
              type="text"
              value={name}
              maxLength={20}
              placeholder={`Oyuncu ${index + 1}`}
              aria-label={`${index + 1}. oyuncunun adı`}
              onChange={(event) => onNameChange(index, event.target.value)}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              disabled={!canRemove}
              aria-label={`${index + 1}. oyuncuyu sil`}
              title={canRemove ? 'Oyuncuyu sil' : `En az ${MIN_PLAYERS} oyuncu olmalı`}
            >
              ✕
            </Button>
          </li>
        ))}
      </ol>

      <div className="player-list__footer">
        <Button variant="secondary" onClick={onAdd} disabled={!canAdd}>
          + Oyuncu ekle
        </Button>
        <span className="player-list__count">
          {players.length} / {MAX_PLAYERS} oyuncu
        </span>
      </div>
    </div>
  );
}
