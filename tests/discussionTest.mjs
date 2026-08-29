// Faz 3 mantik testi: saat bicimi + tartisma fazi gecisleri + bilgi sizintisi kontrolu
import { readFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';

// Yollar bu dosyanin konumuna gore cozuluyor: depo baska bir bilgisayara
// klonlandiginda da calissin diye.
const ROOT = fileURLToPath(new URL('../src', import.meta.url));
const SRC = new URL('../src', import.meta.url).href;

const { CATEGORIES } = await import(`${SRC}/data/categories.js`);
const { validateCategories } = await import(`${SRC}/data/validateCategories.js`);
const { gameReducer, createInitialState, ACTIONS } = await import(`${SRC}/game/gameReducer.js`);
const { formatClock, describeClock, formatDuration } = await import(`${SRC}/utils/time.js`);

const categories = validateCategories(CATEGORIES).categories;

let pass = 0;
let fail = 0;
const check = (label, condition, detail = '') => {
  if (condition) { pass++; console.log(`  OK   ${label}`); }
  else { fail++; console.log(`  FAIL ${label} ${detail}`); }
};

const run = (state, ...actions) => actions.reduce((s, a) => gameReducer(s, a), state);

// 1) Saat bicimi
check('3 dk -> 03:00', formatClock(180000) === '03:00', `-> ${formatClock(180000)}`);
check('10 dk -> 10:00', formatClock(600000) === '10:00', `-> ${formatClock(600000)}`);
check('0 -> 00:00', formatClock(0) === '00:00', `-> ${formatClock(0)}`);
check('1 ms kala 00:01 gorunur', formatClock(1) === '00:01', `-> ${formatClock(1)}`);
check('negatif deger 00:00a kirpilir', formatClock(-5000) === '00:00', `-> ${formatClock(-5000)}`);
check('59.5 sn -> 01:00 (yukari yuvarlar)', formatClock(59500) === '01:00', `-> ${formatClock(59500)}`);
check('65 sn -> 01:05', formatClock(65000) === '01:05', `-> ${formatClock(65000)}`);
check('ekran okuyucu metni', describeClock(90000) === '1 dakika 30 saniye kaldi'.replace('kaldi', 'kaldı'),
      `-> ${describeClock(90000)}`);
check('formatDuration bozulmadi', formatDuration(180) === '3 dk' && formatDuration(210) === '3 dk 30 sn');

// 2) Faz gecisleri
const base = createInitialState(categories);
const started = run(base, { type: ACTIONS.START_GAME, categories });
check('START_GAME -> reveal', started.phase === 'reveal');

let s = started;
for (let i = 0; i < started.settings.players.length; i++) s = run(s, { type: ACTIONS.NEXT_REVEAL });
check('son oyuncudan sonra -> discussion', s.phase === 'discussion', `-> ${s.phase}`);

const voting = run(s, { type: ACTIONS.GO_TO_VOTING });
check('GO_TO_VOTING -> voting', voting.phase === 'voting', `-> ${voting.phase}`);
check('oylamaya girerken oylar sifir', Object.keys(voting.votes).length === 0 && voting.currentVoterIndex === 0);
check('tur bilgisi korunur', voting.round && voting.round.word === s.round.word);
check('ayarlar korunur', voting.settings.players.length === 3);

// 3) Ayni anda iki kez tetiklenirse (sure bitti + butona basildi)
const twice = run(s, { type: ACTIONS.GO_TO_VOTING }, { type: ACTIONS.GO_TO_VOTING });
check('ikinci GO_TO_VOTING sessizce yok sayilir', twice.phase === 'voting' && twice === voting ? true : twice.phase === 'voting',
      `-> ${twice.phase}`);
check('ikinci cagri yeni state uretmez (referans ayni)',
      gameReducer(voting, { type: ACTIONS.GO_TO_VOTING }) === voting);

// 4) Yanlis fazdan cagri
check('setup fazinda GO_TO_VOTING yok sayilir',
      run(base, { type: ACTIONS.GO_TO_VOTING }).phase === 'setup');
check('reveal fazinda GO_TO_VOTING yok sayilir',
      run(started, { type: ACTIONS.GO_TO_VOTING }).phase === 'reveal');

// 5) Oylamadan kuruluma donus
const backToSetup = run(voting, { type: ACTIONS.RESET_GAME });
check('RESET_GAME -> setup', backToSetup.phase === 'setup' && backToSetup.round === null);

// 6) Tartisma ekrani kelimeyi sizdirmamali (kaynak kod taramasi)
const leakyPattern = /round\.(word|hint|categoryName|categoryId|impostorIndexes|effectiveClueMode)/;
for (const file of [
  'components/screens/DiscussionScreen.jsx',
  'components/discussion/CountdownTimer.jsx',
  'components/discussion/TurnOrder.jsx',
]) {
  const source = readFileSync(`${ROOT}/${file}`, 'utf8');
  const match = source.match(leakyPattern);
  check(`${file} kelimeyi/kategoriyi gostermiyor`, match === null, `-> ${match && match[0]}`);
}

// 7) Gecici test paneli kaldirildi mi
const appSource = readFileSync(`${ROOT}/App.jsx`, 'utf8');
check('App.jsx icinde debug paneli kalmadi',
      !appSource.includes('debug-panel') && !appSource.includes('PhasePlaceholder'));
const cssSource = readFileSync(`${ROOT}/styles/global.css`, 'utf8');
check('debug paneli CSSi de silindi', !cssSource.includes('debug-panel'));

console.log(`\n${pass} gecti, ${fail} kaldi`);
process.exit(fail === 0 ? 0 : 1);
