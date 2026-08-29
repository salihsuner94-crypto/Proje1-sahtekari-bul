/**
 * Konuşma sırasını gösterir. Listeyi başlayan oyuncudan itibaren döndürüyoruz
 * ki masadakiler "sıra kimde" diye tartışmasın.
 */
export default function TurnOrder({ players, startingPlayerIndex }) {
  const ordered = players.map(
    (_, offset) => players[(startingPlayerIndex + offset) % players.length],
  );

  return (
    <ol className="turn-order">
      {ordered.map((name, position) => (
        // İsimler tekrar edebilir (aynı isimli iki oyuncu uyarı ile serbest),
        // bu yüzden key olarak sıradaki konumu kullanıyoruz.
        <li key={position} className="turn-order__item">
          <span className="turn-order__position">{position + 1}</span>
          <span className="turn-order__name">{name}</span>
        </li>
      ))}
    </ol>
  );
}
