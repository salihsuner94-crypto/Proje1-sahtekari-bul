import { getSetupIssues } from '../../game/setupValidation';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ErrorText from '../ui/ErrorText';
import CategoryPicker from '../setup/CategoryPicker';
import PlayerListEditor from '../setup/PlayerListEditor';
import SettingsPanel from '../setup/SettingsPanel';

/**
 * Oyun kurulumu. Doğrulama sonucunu tek yerden (getSetupIssues) alıyoruz;
 * hem "Başlat" butonunun aktifliği hem mesajlar aynı kaynaktan besleniyor.
 */
export default function SetupScreen({ settings, categories, categoryIssues, actions }) {
  const { errors, warnings, canStart } = getSetupIssues(settings, categories);
  const categoryIds = categories.map((category) => category.id);

  return (
    <>
      <Card title="Oyuncular">
        <PlayerListEditor
          players={settings.players}
          onNameChange={actions.setPlayerName}
          onAdd={actions.addPlayer}
          onRemove={actions.removePlayer}
        />
      </Card>

      <Card title="Kategoriler">
        <CategoryPicker
          categories={categories}
          selectedIds={settings.selectedCategoryIds}
          onToggle={actions.toggleCategory}
          onSetAll={(selected) => actions.setAllCategories(selected, categoryIds)}
        />
        <ErrorText messages={categoryIssues} tone="warning" />
      </Card>

      <Card title="Ayarlar">
        <SettingsPanel
          durationSeconds={settings.durationSeconds}
          impostorCount={settings.impostorCount}
          impostorClueMode={settings.impostorClueMode}
          playerCount={settings.players.length}
          onDurationChange={actions.setDuration}
          onImpostorCountChange={actions.setImpostorCount}
          onImpostorClueModeChange={actions.setImpostorClueMode}
        />
      </Card>

      <div className="setup-actions">
        <ErrorText messages={errors} tone="error" />
        <ErrorText messages={warnings} tone="warning" />
        <Button size="lg" fullWidth onClick={actions.startGame} disabled={!canStart}>
          Oyunu Başlat
        </Button>
      </div>
    </>
  );
}
