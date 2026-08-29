// Faz 2 mantık testi: roundSetup + rol dağıtımı akışı
const SRC = new URL('../src', import.meta.url).href;

const { CATEGORIES } = await import(`${SRC}/data/categories.js`);
const { validateCategories } = await import(`${SRC}/data/validateCategories.js`);
const { gameReducer, createInitialState, ACTIONS } = await import(`${SRC}/game/gameReducer.js`);
const { createRound, resolveClueMode, isImpostor } = await import(`${SRC}/game/roundSetup.js`);
const { pickDistinctIndexes } = await import(`${SRC}/utils/random.js`);

const categories = validateCategories(CATEGORIES).categories;
const ids = categories.map((c) => c.id);

let pass = 0, fail = 0;
const check = (label, ok, detail = '') => {
  if (ok) { pass++; console.log(`  OK   ${label}`); }
  else { fail++; console.log(`  FAIL ${label} ${detail}`); }
};
const run = (state, ...actions) => actions.reduce((s, a) => gameReducer(s, a), state);
const settingsFor = (over = {}) => ({
  players: ['Ali', 'Ayse', 'Can', 'Dilek', 'Efe'],
  selectedCategoryIds: ids,
  durationSeconds: 180,
  impostorCount: 1,
  impostorClueMode: 'category',
  ...over,
});

// 1) Tur kurulumu 2000 kez: her seferinde geçerli mi?
let bad = 0;
const impostorHits = Array(5).fill(0);
const startHits = Array(5).fill(0);
const seenCategories = new Set();
for (let i = 0; i < 2000; i++) {
  const r = createRound({ settings: settingsFor(), categories, roundNumber: 1 });
  if (!r) { bad++; continue; }
  const cat = categories.find((c) => c.id === r.categoryId);
  const inCategory = cat?.words.some((w) => w.word === r.word && w.hint === r.hint);
  if (!inCategory) bad++;
  if (r.impostorIndexes.length !== 1) bad++;
  if (new Set(r.impostorIndexes).size !== r.impostorIndexes.length) bad++;
  if (r.impostorIndexes.some((x) => x < 0 || x >= 5)) bad++;
  if (r.startingPlayerIndex < 0 || r.startingPlayerIndex >= 5) bad++;
  if (r.revealIndex !== 0) bad++;
  seenCategories.add(r.categoryId);
  r.impostorIndexes.forEach((x) => impostorHits[x]++);
  startHits[r.startingPlayerIndex]++;
}
check('2000 turun hepsi geçerli', bad === 0, `-> ${bad} bozuk`);
check('kelime her zaman seçilen kategoriden geliyor', bad === 0);
check('7 kategorinin hepsi kullanılıyor', seenCategories.size === 7, `-> ${seenCategories.size}`);
check('sahtekâr dağılımı dengeli', impostorHits.every((n) => n > 300 && n < 500), `-> ${impostorHits}`);
check('başlayan oyuncu dağılımı dengeli', startHits.every((n) => n > 300 && n < 500), `-> ${startHits}`);

// 2) Çoklu sahtekâr
bad = 0;
const players9 = Array.from({ length: 9 }, (_, i) => `O${i + 1}`);
for (let i = 0; i < 500; i++) {
  const r = createRound({ settings: settingsFor({ players: players9, impostorCount: 2 }), categories, roundNumber: 1 });
  if (r.impostorIndexes.length !== 2) bad++;
  if (r.impostorIndexes[0] === r.impostorIndexes[1]) bad++;
}
check('2 sahtekâr her zaman farklı iki oyuncu', bad === 0, `-> ${bad}`);

// 3) Sahtekâr sayısı asla oyuncu sayısına eşit olamaz
const extreme = createRound({ settings: settingsFor({ players: ['A', 'B', 'C'], impostorCount: 3 }), categories, roundNumber: 1 });
check('3 oyuncu/3 sahtekâr istense bile en fazla 2 atanır', extreme.impostorIndexes.length === 2);

// 4) Tek kategori seçiliyse sadece o kategoriden gelir
const onlyCities = settingsFor({ selectedCategoryIds: ['sehirler'] });
bad = 0;
for (let i = 0; i < 300; i++) {
  if (createRound({ settings: onlyCities, categories, roundNumber: 1 }).categoryId !== 'sehirler') bad++;
}
check('tek kategori seçiliyse havuz o kategoriyle sınırlı', bad === 0);

// 5) Kategori seçili değilse null
check('boş havuzda createRound null döner',
  createRound({ settings: settingsFor({ selectedCategoryIds: [] }), categories, roundNumber: 1 }) === null);

// 6) Arka arkaya aynı kelime gelmez
bad = 0;
for (let i = 0; i < 300; i++) {
  const prev = 'İstanbul';
  const r = createRound({ settings: onlyCities, categories, roundNumber: 2, previousWord: prev });
  if (r.word === prev) bad++;
}
check('önceki turun kelimesi tekrar gelmiyor', bad === 0, `-> ${bad}`);

// 7) İpucu modu çözümü
check('hint modu + hint var -> hint', resolveClueMode('hint', 'Eczacı') === 'hint');
check('hint modu + hint yok -> category', resolveClueMode('hint', null) === 'category');
check('none modu değişmez', resolveClueMode('none', 'Eczacı') === 'none');
const hintRound = createRound({ settings: settingsFor({ impostorClueMode: 'hint' }), categories, roundNumber: 1 });
check('gerçek veride hint modu korunuyor', hintRound.effectiveClueMode === 'hint' && !!hintRound.hint);

// 8) Rol gösterme akışı (5 oyuncu)
let s = run(createInitialState(categories),
  { type: ACTIONS.SET_PLAYER_COUNT, count: 5 },
  { type: ACTIONS.START_GAME, categories });
check('START_GAME turu kuruyor', s.phase === 'reveal' && s.round !== null);
check('revealIndex 0 başlar', s.round.revealIndex === 0);

for (let i = 0; i < 4; i++) s = run(s, { type: ACTIONS.NEXT_REVEAL });
check('4 ilerleyişte hâlâ reveal', s.phase === 'reveal' && s.round.revealIndex === 4);
s = run(s, { type: ACTIONS.NEXT_REVEAL });
check('5. oyuncudan sonra discussion', s.phase === 'discussion');
s = run(s, { type: ACTIONS.NEXT_REVEAL });
check('discussion fazında NEXT_REVEAL yok sayılır', s.phase === 'discussion');

// 9) Tam olarak impostorCount kadar sahtekâr, gerisi dedektif
const r9 = createRound({ settings: settingsFor({ players: players9, impostorCount: 2 }), categories, roundNumber: 1 });
const roles = players9.map((_, i) => isImpostor(r9, i));
check('9 oyuncuda tam 2 sahtekâr 7 dedektif',
  roles.filter(Boolean).length === 2 && roles.filter((x) => !x).length === 7);

// 10) pickDistinctIndexes sınırları
check('istenen sayı toplamdan büyükse taşmaz', pickDistinctIndexes(10, 3).length === 3);
check('0 istenirse boş döner', pickDistinctIndexes(0, 5).length === 0);

console.log(`\n${pass} gecti, ${fail} kaldi`);
process.exit(fail === 0 ? 0 : 1);
