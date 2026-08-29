/**
 * Hata ve uyarı mesajlarını tek biçimde gösterir.
 * tone="error"   → oyunu engelleyen sorun (kırmızı)
 * tone="warning" → sadece bilgilendirme (turuncu)
 */
export default function ErrorText({ messages, tone = 'error' }) {
  if (!messages || messages.length === 0) return null;

  return (
    <ul className={`message-list message-list--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
