// Faz 4 mantik testi: oylama, kazanan hesabi, puanlama, tur dongusu
import { fileURLToPath } from 'node:url';

// Yollar bu dosyanin konumuna gore cozuluyor: depo baska bir bilgisayara
// klonlandiginda da calissin diye.
const ROOT = fileURLToPath(new URL('../src', import.meta.url));
const SRC = new URL('../src', import.meta.url).href;

const { CATEGORIES } = await import(`${SRC}/data/categories.js`);
const { validateCategories } = await import(`${SRC}/data/validateCategories.js`);
const { gameReducer, createInitialState, ACTIONS } = await import(`${SRC}/game/gameReducer.js`);
const { resolveVoting, tallyVotes, awardPoints, getVotersByTarget } = await import(`${SRC}/game/voting.js`);

const categories = validateCategories(CATEGORIES).categories;

let pass = 0, fail = 0;
const check = (label, condition, detail = '') => {
  if (condition) { pass++; console.log('  OK   ' + label); }
  else { fail++; console.log('  FAIL ' + label + ' ' + detail); }
};
const run = (state, ...actions) => actions.reduce((s, a) => gameReducer(s, a), state);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- 1) Sayim ----------
check('oylar dogru sayilir', same(tallyVotes({ 0: 2, 1: 2, 2: 0 }, 3), [1, 0, 2]));
check('bozuk oy sayima girmez', same(tallyVotes({ 0: 9, 1: -1, 2: 1 }, 3), [0, 1, 0]));
check('kim kime oy verdi', same(getVotersByTarget({ 0: 1, 2: 1, 1: 0 }, 3), [[1], [0, 2], []]));

// ---------- 2) Tek sahtekar ----------
let r = resolveVoting({ votes: { 0: 3, 1: 3, 2: 3, 3: 0, 4: 3 }, impostorIndexes: [3], playerCount: 5 });
check('sahtekar bulunursa dedektifler kazanir', r.winner === 'detectives' && same(r.accusedIndexes, [3]));
check('yakalanan sahtekar kaydedilir', same(r.caughtIndexes, [3]));

r = resolveVoting({ votes: { 0: 1, 1: 0, 2: 1, 3: 1, 4: 1 }, impostorIndexes: [3], playerCount: 5 });
check('yanlis kisi suclanirsa sahtekar kazanir', r.winner === 'impostors' && r.caughtIndexes.length === 0);

r = resolveVoting({ votes: { 0: 1, 1: 0, 2: 1, 3: 0, 4: 2 }, impostorIndexes: [1], playerCount: 5 });
check('kesim cizgisinde beraberlik -> karar yok', r.isUndecided === true);
check('beraberlikte sahtekar kazanir', r.winner === 'impostors');
check('beraberlikte kimse suclanmaz', same(r.accusedIndexes, []));

// ---------- 3) Iki sahtekar ----------
const votes2 = { 0: 2, 1: 2, 2: 5, 3: 5, 4: 2, 5: 0, 6: 5, 7: 2, 8: 5 };
r = resolveVoting({ votes: votes2, impostorIndexes: [2, 5], playerCount: 9 });
check('2 sahtekar da bulunursa dedektifler kazanir',
      r.winner === 'detectives' && same([...r.accusedIndexes].sort(), [2, 5]), JSON.stringify(r.accusedIndexes));

const votes2b = { 0: 2, 1: 2, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1, 7: 3, 8: 3 };
r = resolveVoting({ votes: votes2b, impostorIndexes: [2, 5], playerCount: 9 });
check('tek sahtekar bulunursa sahtekarlar kazanir', r.winner === 'impostors', r.winner);
check('yakalanan tek sahtekar listede', same(r.caughtIndexes, [2]), JSON.stringify(r.caughtIndexes));

const votes2c = { 0: 2, 1: 2, 2: 5, 3: 5, 4: 1, 5: 1, 6: 3, 7: 3, 8: 4 };
r = resolveVoting({ votes: votes2c, impostorIndexes: [2, 5], playerCount: 9 });
check('2. sirada beraberlik -> karar yok', r.isUndecided === true && r.winner === 'impostors',
      JSON.stringify(r.tally));

// ---------- 4) Puanlama ----------
check('dedektif galibiyeti: her dedektif +1, sahtekar 0',
      same(awardPoints([0, 0, 0, 0, 0], 'detectives', [2]), [1, 1, 0, 1, 1]));
check('sahtekar galibiyeti: sahtekar +2, dedektif 0',
      same(awardPoints([0, 0, 0, 0, 0], 'impostors', [2]), [0, 0, 2, 0, 0]));
check('puanlar birikir', same(awardPoints([3, 1, 4], 'detectives', [1]), [4, 1, 5]));
check('iki sahtekar da +2 alir', same(awardPoints([0, 0, 0], 'impostors', [0, 2]), [2, 0, 2]));

// ---------- 5) Reducer akisi ----------
const base = createInitialState(categories);
let s = run(base, { type: ACTIONS.SET_PLAYER_COUNT, count: 4 }, { type: ACTIONS.START_GAME, categories });
for (let i = 0; i < 4; i++) s = run(s, { type: ACTIONS.NEXT_REVEAL });
s = run(s, { type: ACTIONS.GO_TO_VOTING });
check('oylama fazina girildi', s.phase === 'voting' && s.currentVoterIndex === 0);

check('kendine oy verilemez', run(s, { type: ACTIONS.CAST_VOTE, targetIndex: 0 }) === s);
check('gecersiz index reddedilir', run(s, { type: ACTIONS.CAST_VOTE, targetIndex: 99 }) === s);
check('index yerine cop gelirse reddedilir', run(s, { type: ACTIONS.CAST_VOTE, targetIndex: null }) === s);

let v = run(s, { type: ACTIONS.CAST_VOTE, targetIndex: 1 });
check('oy sonrasi sira ilerler', v.currentVoterIndex === 1 && v.votes[0] === 1);
check('tek oydan sonra hala oylamada', v.phase === 'voting');

v = run(v,
  { type: ACTIONS.CAST_VOTE, targetIndex: 2 },
  { type: ACTIONS.CAST_VOTE, targetIndex: 1 },
  { type: ACTIONS.CAST_VOTE, targetIndex: 1 });
check('herkes oy verince sonuc fazina gecilir', v.phase === 'result', v.phase);
check('4 oyun hepsi kaydedildi', Object.keys(v.votes).length === 4);
check('sonuc uretildi', v.result !== null && Array.isArray(v.result.tally));
check('puanlar dagitildi', v.scores.some((score) => score > 0), JSON.stringify(v.scores));
check('sonuc fazinda oy kabul edilmez', run(v, { type: ACTIONS.CAST_VOTE, targetIndex: 0 }) === v);

// ---------- 6) Yeni tur ----------
const next = run(v, { type: ACTIONS.START_NEXT_ROUND, categories });
check('yeni tur rol dagitimina doner', next.phase === 'reveal');
check('tur numarasi artar', next.round.number === 2, String(next.round.number));
check('yeni turda kelime degisir', next.round.word !== v.round.word);
check('puanlar korunur', same(next.scores, v.scores));
check('oylar sifirlanir', Object.keys(next.votes).length === 0 && next.currentVoterIndex === 0);
check('sonuc temizlenir', next.result === null);
check('oyuncular ayni kalir', same(next.settings.players, v.settings.players));
check('yanlis fazda START_NEXT_ROUND yok sayilir',
      run(base, { type: ACTIONS.START_NEXT_ROUND, categories }).phase === 'setup');
check('categories gelmezse yeni tur baslamaz', gameReducer(v, { type: ACTIONS.START_NEXT_ROUND }) === v);

// ---------- 7) Oyunu bitir ----------
const finished = run(v, { type: ACTIONS.RESET_GAME });
check('oyunu bitir kuruluma doner', finished.phase === 'setup' && finished.round === null);
check('oyunu bitirince puanlar sifirlanir', same(finished.scores, []));
check('ayarlar korunur', finished.settings.players.length === 4);

// ---------- 8) Iki turluk tam dongu, puan birikimi ----------
let game = run(base, { type: ACTIONS.SET_PLAYER_COUNT, count: 5 }, { type: ACTIONS.START_GAME, categories });
let totalBefore = 0;
for (let round = 1; round <= 2; round++) {
  for (let i = 0; i < 5; i++) game = run(game, { type: ACTIONS.NEXT_REVEAL });
  game = run(game, { type: ACTIONS.GO_TO_VOTING });
  const impostor = game.round.impostorIndexes[0];
  for (let voter = 0; voter < 5; voter++) {
    const target = voter === impostor ? (impostor + 1) % 5 : impostor;
    game = run(game, { type: ACTIONS.CAST_VOTE, targetIndex: target });
  }
  check(round + '. tur: sahtekar yakalandi, dedektifler kazandi', game.result.winner === 'detectives',
        game.result.winner);
  const total = game.scores.reduce((a, b) => a + b, 0);
  check(round + '. turda 4 dedektif +1 aldi', total - totalBefore === 4, String(total - totalBefore));
  totalBefore = total;
  if (round === 1) game = run(game, { type: ACTIONS.START_NEXT_ROUND, categories });
}
check('2 tur sonunda toplam puan 8', game.scores.reduce((a, b) => a + b, 0) === 8,
      JSON.stringify(game.scores));

console.log('\n' + pass + ' gecti, ' + fail + ' kaldi');
process.exit(fail === 0 ? 0 : 1);
