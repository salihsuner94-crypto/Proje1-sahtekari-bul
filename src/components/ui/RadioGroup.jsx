/**
 * Tek seçimli ayar listesi (sahtekâr sayısı, ipucu modu).
 * Gerçek <input type="radio"> kullanıyoruz: klavye ve ekran okuyucu bedavaya geliyor.
 */
export default function RadioGroup({ name, value, options, onChange, disabled = false }) {
  return (
    <div className="radio-group" role="radiogroup">
      {options.map((option) => {
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={[
              'radio-option',
              value === option.value && 'radio-option--active',
              isDisabled && 'radio-option--disabled',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={isDisabled}
              onChange={() => onChange(option.value)}
            />
            <span className="radio-option__text">
              <span className="radio-option__label">{option.label}</span>
              {option.description && (
                <span className="radio-option__description">{option.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
