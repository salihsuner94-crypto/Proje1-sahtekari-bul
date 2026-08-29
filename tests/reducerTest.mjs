// Faz 1 mantık testi: gameReducer + setupValidation
const SRC = new URL('../src', import.meta.url).href;

const { CATEGORIES } = await import(`${SRC}/data/categories.js`);
const { validateCategories } = await import(`${SRC}/data/validateCategories.js`);
const { gameReducer, createInitialState, ACTIONS } = await import(`${SRC}/game/gameReducer.js`);
const { getSetupIssues } = await import(`${SRC}/game/setupValidation.js`);

const categories = validateCategories(CATEGORIES).categories;
const ids = categories.map((c) => c.id);

let pass = 0;
let fail = 0;
const check = (label, condition, detail = '') => {
  if (condition) { pass++; console.log(`  OK   ${label}`); }
  else { fail++; console.log(`  FAIL ${label} ${detail}`); }
};

const run = (state, ...actions) => actions.reduce((s, a) => gameReducer(s, a), state);
const base = createInitialState(categories);

// 1) Başlangıç durumu
check('3 oyuncu ile başlar', base.settings.players.length === 3);
check('tüm kategoriler seçili başlar', base.settings.selectedCategoryIds.length === categories.length);
check('faz = setup', base.phase === 'setup');

// 2) Oyuncu ekleme / silme sınırları
let s = base;
for (let i = 0; i < 25; i++) s = run(s, { type: ACTIONS.ADD_PLAYER });
check('20 oyuncuda ekleme durur', s.settings.players.length === 20, `-> ${s.settings.players.length}`);

s = run(base, { type: ACTIONS.REMOVE_PLAYER, index: 0 });
check('3 oyuncuda silme engellenir', s.settings.players.length === 3, `-> ${s.settings.players.length}`);

// 3) Sahtekâr sayısı otomatik düzeltme
s = run(base, { type: ACTIONS.SET_PLAYER_COUNT, count: 9 }, { type: ACTIONS.SET_IMPOSTOR_COUNT, count: 2 });
check('9 oyuncuda 2 sahtekâr seçilebilir', s.settings.impostorCount === 2);
s = run(s, { type: ACTIONS.SET_PLAYER_COUNT, count: 5 });
check('oyuncu 5e düşünce sahtekâr 1e iner', s.settings.impostorCount === 1, `-> ${s.settings.impostorCount}`);

s = run(base, { type: ACTIONS.SET_PLAYER_COUNT, count: 10 }, { type: ACTIONS.SET_IMPOSTOR_COUNT, count: 2 },
        { type: ACTIONS.REMOVE_PLAYER, index: 0 }, { type: ACTIONS.REMOVE_PLAYER, index: 0 },
        { type: ACTIONS.REMOVE_PLAYER, index: 0 });
check('silerek 7 oyuncuya inince sahtekâr 1e iner', s.settings.players.length === 7 && s.settings.impostorCount === 1,
      `-> ${s.settings.players.length} oyuncu / ${s.settings.impostorCount} sahtekâr`);

s = run(base, { type: ACTIONS.SET_IMPOSTOR_COUNT, count: 2 });
check('3 oyuncuda 2 sahtekâr reddedilir', s.settings.impostorCount === 1);

// 4) Kategori seçimi
s = run(base, { type: ACTIONS.TOGGLE_CATEGORY, categoryId: ids[0] });
check('kategori kapatılır', !s.settings.selectedCategoryIds.includes(ids[0]));
s = run(s, { type: ACTIONS.TOGGLE_CATEGORY, categoryId: ids[0] });
check('kategori tekrar açılır', s.settings.selectedCategoryIds.includes(ids[0]));
check('toggle kategori sayısını bozmaz', s.settings.selectedCategoryIds.length === categories.length);

const cleared = run(base, { type: ACTIONS.SET_ALL_CATEGORIES, selected: false, categoryIds: ids });
check('temizle -> 0 kategori', cleared.settings.selectedCategoryIds.length === 0);
check('0 kategoride canStart false', getSetupIssues(cleared.settings, categories).canStart === false);
check('0 kategoride START_GAME yok sayılır',
      run(cleared, { type: ACTIONS.START_GAME, categories }).phase === 'setup');

const allBack = run(cleared, { type: ACTIONS.SET_ALL_CATEGORIES, selected: true, categoryIds: ids });
check('tümünü seç -> hepsi', allBack.settings.selectedCategoryIds.length === categories.length);

// 5) Tek kategori ile oynanabilir
const single = run(cleared, { type: ACTIONS.TOGGLE_CATEGORY, categoryId: ids[2] });
check('tek kategori yeterli', getSetupIssues(single.settings, categories).canStart === true);

// 6) Süre sınırları
check('süre alt sınırda kırpılır', run(base, { type: ACTIONS.SET_DURATION, seconds: 5 }).settings.durationSeconds === 30);
check('süre üst sınırda kırpılır', run(base, { type: ACTIONS.SET_DURATION, seconds: 9999 }).settings.durationSeconds === 600);

// 7) 2 oyuncu ile başlatma engeli (sadece doğrulama seviyesinde ulaşılabilir durum)
const twoPlayers = { ...base, settings: { ...base.settings, players: ['Ali', 'Ayşe'] } };
check('2 oyuncuda canStart false', getSetupIssues(twoPlayers.settings, categories).canStart === false);
check('2 oyuncuda START_GAME yok sayılır', run(twoPlayers, { type: ACTIONS.START_GAME, categories }).phase === 'setup');

// 8) START_GAME normal akış
const named = run(base,
  { type: ACTIONS.SET_PLAYER_NAME, index: 0, name: '  Ali  ' },
  { type: ACTIONS.SET_PLAYER_NAME, index: 1, name: '' },
  { type: ACTIONS.START_GAME, categories });
check('faz reveal olur', named.phase === 'reveal');
check('isimler normalize edilir', JSON.stringify(named.settings.players) === JSON.stringify(['Ali', 'Oyuncu 2', 'Oyuncu 3']),
      `-> ${JSON.stringify(named.settings.players)}`);
check('skorlar sıfırlanır', JSON.stringify(named.scores) === '[0,0,0]');

// 9) RESET_GAME ayarları korur
const afterReset = run(named, { type: ACTIONS.RESET_GAME });
check('reset kuruluma döner', afterReset.phase === 'setup');
check('reset ayarları korur', afterReset.settings.players.length === 3 && afterReset.settings.durationSeconds === 180);

// 10) Aynı isim uyarısı (engellemez)
const dup = run(base,
  { type: ACTIONS.SET_PLAYER_NAME, index: 0, name: 'Ali' },
  { type: ACTIONS.SET_PLAYER_NAME, index: 1, name: 'ali' });
const dupIssues = getSetupIssues(dup.settings, categories);
check('aynı isim uyarı üretir', dupIssues.warnings.length === 1, `-> ${JSON.stringify(dupIssues.warnings)}`);
check('aynı isim başlatmayı engellemez', dupIssues.canStart === true);

// 10b) Kategori listesi hiç gelmezse çökmemeli, kurulumda kalmalı
check('categories eksik gelirse START_GAME güvenle yok sayılır',
  gameReducer(base, { type: ACTIONS.START_GAME }).phase === 'setup');

// 11) Değişmezlik (state mutasyonu yok)
const before = JSON.stringify(base);
run(base, { type: ACTIONS.ADD_PLAYER }, { type: ACTIONS.TOGGLE_CATEGORY, categoryId: ids[0] });
check('orijinal state değişmedi (immutability)', JSON.stringify(base) === before);

console.log(`\n${pass} gecti, ${fail} kaldi`);
process.exit(fail === 0 ? 0 : 1);
