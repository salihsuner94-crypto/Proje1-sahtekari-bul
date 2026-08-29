import {
  DURATION_STEP_SECONDS,
  IMPOSTOR_CLUE_MODE_OPTIONS,
  MAX_DURATION_SECONDS,
  MAX_IMPOSTORS,
  MIN_DURATION_SECONDS,
  MIN_PLAYERS_FOR_TWO_IMPOSTORS,
} from '../../constants/gameConfig';
import { formatDuration } from '../../utils/time';
import NumberStepper from '../ui/NumberStepper';
import RadioGroup from '../ui/RadioGroup';

/**
 * Süre, sahtekâr sayısı ve sahtekârın göreceği ipucu ayarları.
 * Sahtekâr sayısı seçenekleri IMPOSTOR ayarlarından türetiliyor; 8'den az oyuncuda
 * ikinci seçenek pasif kalıyor (sebebi de altında yazıyor, kullanıcı tahmin etmesin).
 */
export default function SettingsPanel({
  durationSeconds,
  impostorCount,
  impostorClueMode,
  playerCount,
  onDurationChange,
  onImpostorCountChange,
  onImpostorClueModeChange,
}) {
  const twoImpostorsAllowed = playerCount >= MIN_PLAYERS_FOR_TWO_IMPOSTORS;

  const impostorOptions = Array.from({ length: MAX_IMPOSTORS }, (_, index) => {
    const count = index + 1;
    return {
      value: count,
      label: `${count} sahtekâr`,
      disabled: count > 1 && !twoImpostorsAllowed,
      description:
        count > 1 && !twoImpostorsAllowed
          ? `En az ${MIN_PLAYERS_FOR_TWO_IMPOSTORS} oyuncu gerekir`
          : undefined,
    };
  });

  return (
    <div className="settings-panel">
      <div className="settings-panel__row">
        <div>
          <span className="settings-panel__label">Tartışma süresi</span>
          <span className="settings-panel__hint">
            {MIN_DURATION_SECONDS} sn – {formatDuration(MAX_DURATION_SECONDS)} arası
          </span>
        </div>
        <NumberStepper
          value={durationSeconds}
          min={MIN_DURATION_SECONDS}
          max={MAX_DURATION_SECONDS}
          step={DURATION_STEP_SECONDS}
          onChange={onDurationChange}
          format={formatDuration}
          label="Süre"
        />
      </div>

      <div className="settings-panel__block">
        <span className="settings-panel__label">Sahtekâr sayısı</span>
        <RadioGroup
          name="impostorCount"
          value={impostorCount}
          options={impostorOptions}
          onChange={onImpostorCountChange}
        />
      </div>

      <div className="settings-panel__block">
        <span className="settings-panel__label">Sahtekâr ne görsün?</span>
        <RadioGroup
          name="impostorClueMode"
          value={impostorClueMode}
          options={IMPOSTOR_CLUE_MODE_OPTIONS}
          onChange={onImpostorClueModeChange}
        />
      </div>
    </div>
  );
}
