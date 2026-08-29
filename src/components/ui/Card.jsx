/**
 * Ekranlardaki içerik kutusu. Başlık isteğe bağlı.
 * `as` ile etiketi değiştirebiliriz (örn. as="section").
 */
export default function Card({
  children,
  title,
  flat = false,
  as: Element = 'section',
  className = '',
  ...rest
}) {
  const classNames = ['card', flat && 'card--flat', className].filter(Boolean).join(' ');

  return (
    <Element className={classNames} {...rest}>
      {title && <h2 className="card__title">{title}</h2>}
      {children}
    </Element>
  );
}
