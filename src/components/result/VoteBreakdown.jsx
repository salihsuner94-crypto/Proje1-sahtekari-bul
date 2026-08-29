/**
 * Kimin kaç oy aldığı ve o oyları kimlerin verdiği.
 * Turdan sonra "ben sana oy vermedim ki" tartışmasını bitiriyor.
 */
export default function VoteBreakdown({ players, tally, votersByTarget, impostorIndexes }) {
  // Çok oy alandan aza doğru; hiç oy almayanlar da listede kalsın ki
  // "kimse ona oy vermemiş" bilgisi de görünsün.
  const rows = players
    .map((name, index) => ({ name, index, count: tally[index] }))
    .sort((a, b) => b.count - a.count || a.index - b.index);

  return (
    <ul className="vote-breakdown">
      {rows.map((row) => {
        const voterNames = votersByTarget[row.index].map((voterIndex) => players[voterIndex]);
        const isImpostorPlayer = impostorIndexes.includes(row.index);

        return (
          <li
            key={row.index}
            className={`vote-breakdown__row${isImpostorPlayer ? ' vote-breakdown__row--impostor' : ''}`}
          >
            <div className="vote-breakdown__head">
              <span className="vote-breakdown__name">
                {row.name}
                {isImpostorPlayer && <span className="vote-breakdown__tag">sahtekâr</span>}
              </span>
              <span className="vote-breakdown__count">{row.count} oy</span>
            </div>

            {voterNames.length > 0 && (
              <p className="vote-breakdown__voters">Oy verenler: {voterNames.join(', ')}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
