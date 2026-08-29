import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * Tüm test dosyalarını sırayla çalıştırır: npm test
 *
 * Her testi ayrı bir Node süreci olarak başlatıyoruz. Sebebi: testler bitince
 * process.exit çağırıyor; aynı süreçte çalıştırsaydık ilk test biterken
 * diğerlerini de öldürürdü.
 */

const SUITES = [
  ['Kurulum ve durum yönetimi', 'reducerTest.mjs'],
  ['Tur kurulumu ve rol dağıtımı', 'roundTest.mjs'],
  ['Tartışma turu ve sayaç', 'discussionTest.mjs'],
  ['Oylama, sonuç ve puanlama', 'votingTest.mjs'],
  ['Uç durumlar ve veri bütünlüğü', 'edgeTest.mjs'],
];

// Proje kodu Vite tarzı uzantısız import kullanıyor; bu yükleyici onu Node'a çeviriyor.
const loader = new URL('./register.mjs', import.meta.url).href;

let failedSuites = 0;

for (const [name, file] of SUITES) {
  console.log(`\n=== ${name} ===`);

  // Node calistirilacak dosyayi yol olarak bekliyor (file:// adresi olarak degil).
  const testPath = fileURLToPath(new URL(`./${file}`, import.meta.url));
  const result = spawnSync(process.execPath, ['--import', loader, testPath], {
    stdio: 'inherit',
  });

  if (result.status !== 0) failedSuites += 1;
}

console.log('\n' + '='.repeat(50));

if (failedSuites === 0) {
  console.log(`✅ ${SUITES.length} test grubunun hepsi geçti.`);
  process.exit(0);
}

console.log(`❌ ${failedSuites} / ${SUITES.length} test grubu başarısız.`);
process.exit(1);
