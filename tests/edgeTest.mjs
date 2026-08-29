// Faz 5 uc durum taramasi
import { fileURLToPath } from 'node:url';

// Yollar bu dosyanin konumuna gore cozuluyor: depo baska bir bilgisayara
// klonlandiginda da calissin diye.
const ROOT = fileURLToPath(new URL('../src', import.meta.url));
const SRC = new URL('../src', import.meta.url).href;

const { CATEGORIES } = await import(`${SRC}/data/categories.js`);
const { validateCategories } = await import(`${SRC}/data/validateCategories.js`);
const { gameReducer, createInitialState, ACTIONS } = await import(`${SRC}/game/gameReducer.js`);
const { getSetupIssues } = await import(`${SRC}/game/setupValidation.js`);
const { createRound } = await import(`${SRC}/game/roundSetup.js`);

const categories = validateCategories(CATEGORIES).categories;
const ids = categories.map((c) => c.id);

let pass = 0, fail = 0;
const check = (label, condition, detail = '') => {
  if (condition) { pass++; console.log('  OK   ' + label); }
  else { fail++; console.log('  FAIL ' + label + ' ' + detail); }
};
const run = (state, ...actions) => actions.reduce((s, a) => gameReducer(s, a), state);
const base = createInitialState(categories);

// --- 20 oyuncu ile tam tur ---
let s = run(base, { type: ACTIONS.SET_PLAYER_COUNT, count: 20 }, { type: ACTIONS.SET_IMPOSTOR_COUNT, count: 2 });
check('20 oyuncu kurulabilir', s.settings.players.length === 20);
check('20 oyuncuda 2 sahtekar secilebilir', s.settings.impostorCount === 2);
s = run(s, { type: ACTIONS.START_GAME, categories });
check('20 oyuncu ile oyun baslar', s.phase === 'reveal');
check('20 oyuncuda tam 2 sahtekar', s.round.impostorIndexes.length === 2);
for (let i = 0; i < 20; i++) s = run(s, { type: ACTIONS.NEXT_REVEAL });
check('20 rol dagitimi sonrasi tartisma', s.phase === 'discussion', s.phase);
s = run(s, { type: ACTIONS.GO_TO_VOTING });
for (let voter = 0; voter < 20; voter++) {
  const target = voter === 0 ? 1 : 0;
  s = run(s, { type: ACTIONS.CAST_VOTE, targetIndex: target });
}
check('20 oyuncu oylamasi sonuclanir', s.phase === 'result');
check('20 oyuncuda puan dizisi tam', s.scores.length === 20);

// --- 3 oyuncu (en az) ---
let min = run(base, { type: ACTIONS.START_GAME, categories });
check('3 oyuncu ile oyun baslar', min.phase === 'reveal');
check('3 oyuncuda 1 sahtekar', min.round.impostorIndexes.length === 1);

// --- Tek kategori ---
const single = run(base,
  { type: ACTIONS.SET_ALL_CATEGORIES, selected: false, categoryIds: ids },
  { type: ACTIONS.TOGGLE_CATEGORY, categoryId: ids[0] },
  { type: ACTIONS.START_GAME, categories });
check('tek kategori ile oyun baslar', single.phase === 'reveal');
check('kelime o kategoriden gelir', single.round.categoryId === ids[0]);

// Tek kategoride 30 tur ust uste: hep gecerli kelime, arka arkaya tekrar yok
let prev = null, repeats = 0, invalid = 0;
const onlyOne = categories.filter((c) => c.id === ids[0]);
for (let i = 0; i < 30; i++) {
  const round = createRound({
    settings: single.settings, categories: onlyOne, roundNumber: i + 1, previousWord: prev,
  });
  if (!round) { invalid++; continue; }
  if (round.word === prev) repeats++;
  prev = round.word;
}
check('tek kategoride 30 tur sorunsuz', invalid === 0);
check('arka arkaya ayni kelime hic gelmedi', repeats === 0, String(repeats));

// --- Uzun isimler ---
const longName = 'Abdurrahmanoğulları' + 'x'.repeat(30);
const longs = run(base,
  { type: ACTIONS.SET_PLAYER_NAME, index: 0, name: longName },
  { type: ACTIONS.START_GAME, categories });
check('cok uzun isim oyunu bozmaz', longs.phase === 'reveal');
check('uzun isim kirpilmadan saklanir', longs.settings.players[0] === longName);

// --- Bosluklu / gorunmez isimler ---
const blanks = run(base,
  { type: ACTIONS.SET_PLAYER_NAME, index: 0, name: '   ' },
  { type: ACTIONS.SET_PLAYER_NAME, index: 1, name: '\t' },
  { type: ACTIONS.START_GAME, categories });
check('sadece bosluk iceren isim varsayilana doner',
      blanks.settings.players[0] === 'Oyuncu 1' && blanks.settings.players[1] === 'Oyuncu 2',
      JSON.stringify(blanks.settings.players));

// --- Sure sinirlari ---
check('en kisa sure 30 sn', run(base, { type: ACTIONS.SET_DURATION, seconds: 0 }).settings.durationSeconds === 30);
check('en uzun sure 600 sn', run(base, { type: ACTIONS.SET_DURATION, seconds: 100000 }).settings.durationSeconds === 600);
check('sayi olmayan sure alt sinira duser',
      run(base, { type: ACTIONS.SET_DURATION, seconds: NaN }).settings.durationSeconds === 30);

// --- Kategori bosaltilip oyun baslatilamaz ---
const empty = run(base, { type: ACTIONS.SET_ALL_CATEGORIES, selected: false, categoryIds: ids });
check('kategorisiz baslatilamaz', getSetupIssues(empty.settings, categories).canStart === false);
check('kategorisiz START_GAME yok sayilir', run(empty, { type: ACTIONS.START_GAME, categories }).phase === 'setup');

// --- Bilinmeyen kategori id'si secili kalirsa ---
const ghost = { ...base, settings: { ...base.settings, selectedCategoryIds: ['boyle-bir-kategori-yok'] } };
check('bilinmeyen kategori id -> baslatilamaz', getSetupIssues(ghost.settings, categories).canStart === false);
check('bilinmeyen kategori id cokme yapmaz', run(ghost, { type: ACTIONS.START_GAME, categories }).phase === 'setup');

// --- Veri butunlugu ---
check('7 kategori var', categories.length === 7, String(categories.length));
check('her kategoride 25 kelime', categories.every((c) => c.words.length === 25),
      categories.map((c) => c.words.length).join(','));
check('her kelimenin ipucu var', categories.every((c) => c.words.every((w) => w.hint && w.hint.length > 0)));
const leaks = [];
categories.forEach((c) => {
  const words = c.words.map((w) => w.word.toLocaleLowerCase('tr'));
  c.words.forEach((w) => { if (words.includes(w.hint.toLocaleLowerCase('tr'))) leaks.push(c.id + ':' + w.word); });
});
check('hicbir ipucu kendi kategorisindeki bir kelime degil', leaks.length === 0, leaks.join(', '));

console.log('\n' + pass + ' gecti, ' + fail + ' kaldi');
process.exit(fail === 0 ? 0 : 1);
