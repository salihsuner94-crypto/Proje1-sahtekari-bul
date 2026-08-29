/**
 * Tüm butonlar bundan geçsin ki stil ve davranış tek yerde dursun.
 * `type="button"` varsayılan: React'te form içindeki butonlar yanlışlıkla
 * sayfayı göndermesin diye.
 */
export default function Button({
  children,
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md', // sm | md | lg
  fullWidth = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const classNames = [
    'button',
    `button--${variant}`,
    size !== 'md' && `button--${size}`,
    fullWidth && 'button--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} {...rest}>
      {children}
    </button>
  );
}
