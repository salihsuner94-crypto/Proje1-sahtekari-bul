import Button from './Button';

/**
 * "−  3 dk  +" biçiminde sayı seçici.
 * Sınırları (min/max) kendi içinde kontrol eder; dışarıya sadece geçerli değer gider.
 * `format` ile ekranda görünen metni özelleştiriyoruz (saniye → "3 dk" gibi).
 */
export default function NumberStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (currentValue) => String(currentValue),
  label,
  disabled = false,
}) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  const change = (delta) => {
    const next = Math.min(Math.max(value + delta, min), max);
    if (next !== value) onChange(next);
  };

  return (
    <div className="stepper">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => change(-step)}
        disabled={!canDecrease}
        aria-label={`${label} azalt`}
      >
        −
      </Button>

      <output className="stepper__value" aria-live="polite">
        {format(value)}
      </output>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => change(step)}
        disabled={!canIncrease}
        aria-label={`${label} artır`}
      >
        +
      </Button>
    </div>
  );
}
