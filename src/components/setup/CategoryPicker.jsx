import Button from '../ui/Button';

/**
 * Çoklu kategori seçimi. Birden fazla kategori işaretlenebilir; oyun her turda
 * işaretliler arasından rastgele birini, sonra o kategoriden rastgele bir kelime seçer.
 */
export default function CategoryPicker({ categories, selectedIds, onToggle, onSetAll }) {
  const allSelected = selectedIds.length === categories.length;
  const noneSelected = selectedIds.length === 0;
  const selectedWordCount = categories
    .filter((category) => selectedIds.includes(category.id))
    .reduce((total, category) => total + category.words.length, 0);

  return (
    <div className="category-picker">
      <div className="category-picker__toolbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetAll(true)}
          disabled={allSelected}
        >
          Tümünü seç
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetAll(false)}
          disabled={noneSelected}
        >
          Temizle
        </Button>
      </div>

      <div className="category-picker__grid">
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id);

          return (
            <label
              key={category.id}
              className={`category-option ${isSelected ? 'category-option--active' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(category.id)}
              />
              <span className="category-option__name">{category.name}</span>
              <span className="category-option__count">{category.words.length}</span>
            </label>
          );
        })}
      </div>

      <p className="category-picker__summary">
        {noneSelected
          ? 'Hiç kategori seçili değil.'
          : `${selectedIds.length} kategori · ${selectedWordCount} kelime havuzda.`}
      </p>
    </div>
  );
}
