/**
 * Oy verilecek kişiyi seçtiren liste.
 * Oy veren kişi listede yok: kimse kendine oy veremez.
 */
export default function PlayerVoteList({ players, voterIndex, selectedIndex, onSelect }) {
  return (
    <ul className="vote-list">
      {players.map((name, index) => {
        if (index === voterIndex) return null;

        const isSelected = index === selectedIndex;

        return (
          <li key={index}>
            <button
              type="button"
              className={`vote-option${isSelected ? ' vote-option--selected' : ''}`}
              onClick={() => onSelect(index)}
              aria-pressed={isSelected}
            >
              <span className="vote-option__name">{name}</span>
              <span className="vote-option__mark" aria-hidden="true">
                {isSelected ? '●' : '○'}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
