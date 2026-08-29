import { POINTS_FOR_DETECTIVE_WIN, POINTS_FOR_IMPOSTOR_WIN } from '../../constants/gameConfig';

/**
 * Oturum boyunca biriken puanlar. Kayıt tutulmuyor: uygulama kapanınca sıfırlanır.
 */
export default function ScoreBoard({ players, scores }) {
  const rows = players
    .map((name, index) => ({ name, score: scores[index] ?? 0, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const topScore = rows[0]?.score ?? 0;

  return (
    <div className="scoreboard">
      <ul className="scoreboard__list">
        {rows.map((row) => (
          <li
            key={row.index}
            // Lider(ler) vurgulansın; 0-0 başlarken kimse lider sayılmasın.
            className={`scoreboard__row${topScore > 0 && row.score === topScore ? ' scoreboard__row--leader' : ''}`}
          >
            <span className="scoreboard__name">{row.name}</span>
            <span className="scoreboard__score">{row.score}</span>
          </li>
        ))}
      </ul>

      <p className="scoreboard__legend">
        Dedektifler kazanınca her dedektif +{POINTS_FOR_DETECTIVE_WIN}, sahtekâr kazanınca her
        sahtekâr +{POINTS_FOR_IMPOSTOR_WIN} puan alır.
      </p>
    </div>
  );
}
