# 🕵️ Sahtekârı Bul

Tek cihazda, sırayla oynanan Spyfall tarzı kelime oyunu. 3–20 kişi, telefon elden ele.

## Oyun nasıl oynanır?

1. **Kurulum** — Oyuncu isimlerini gir, kategorileri seç, süreyi ve sahtekâr ayarlarını yap.
2. **Rol dağıtımı** — Telefon sırayla herkese gider. Dedektifler kelimeyi görür, sahtekâr(lar) görmez.
3. **Tartışma** — Herkes sırayla kelimeyle ilgili **sözlü** bir ipucu verir. Uygulama sadece süreyi ve sırayı takip eder.
4. **Oylama** — Telefon tekrar dolaşır, herkes gizlice sahtekâr sandığı kişiye oy verir.
5. **Sonuç** — Kelime, sahtekârlar, oy dağılımı ve puanlar açıklanır.

**Kazanma kuralları**

- En çok oy alan ilk N kişi suçlanır (N = o turdaki sahtekâr sayısı).
- Dedektiflerin kazanması için suçlananların **tamamının** sahtekâr olması gerekir.
- Kesim çizgisinde oylar eşitse masa karar verememiş sayılır ve **sahtekâr kazanır**.
- Puan: dedektifler kazanırsa her dedektif **+1**, sahtekâr kazanırsa her sahtekâr **+2**.

## Çalıştırma

Node.js 20 veya üzeri gerekiyor.

```bash
npm install      # bir kez
npm run dev      # geliştirme sunucusu -> http://localhost:5173
```

Diğer komutlar:

```bash
npm run build    # dist/ klasörüne üretim derlemesi
npm run preview  # derlenmiş sürümü yerelde çalıştır
```

### Telefondan test etmek

```bash
npm run dev -- --host 0.0.0.0
```

Terminalde yazan `Network:` adresini (örn. `http://192.168.1.111:5173/`) telefonun tarayıcısına yaz. Telefon aynı Wi-Fi ağında olmalı. Açılmıyorsa: Windows Güvenlik Duvarı'nda 5173 portuna izin gerekebilir, telefonda açık bir VPN varsa kapat.

## Ana ekrana ekleme (PWA)

Uygulama bir PWA'dır: telefonda ana ekrana eklenince kendi ikonuyla, tarayıcı çubuğu olmadan açılır ve internetsiz de çalışır.

- **iPhone (Safari):** Paylaş → "Ana Ekrana Ekle". HTTP üzerinden de çalışır.
- **Android (Chrome):** Menü → "Uygulamayı yükle". Chrome'un tam PWA kurulumu **HTTPS** ister; yerel ağdaki `http://` adresinde bu seçenek çıkmaz, bunun yerine basit bir kısayol eklenir. Tam kurulum için yayınlanmış adresi kullan (aşağıdaki Yayınlama bölümü).

İkonu değiştirmek istersen `public/` klasöründeki `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` ve `favicon.svg` dosyalarını değiştir. Uygulama adı, renkleri ve ekran yönü `public/manifest.webmanifest` dosyasında.

## Yayınlama

### GitHub Pages (otomatik)

`main` dalına her `git push` yapıldığında `.github/workflows/deploy.yml` çalışır, projeyi derler ve yayınlar:

**https://salihsuner94-crypto.github.io/Proje1-sahtekari-bul/**

GitHub Pages projeyi kök dizinde değil bir alt yolda yayınladığı için dosya yollarının `/Proje1-sahtekari-bul/` ön ekiyle üretilmesi gerekir. Bunu `vite.config.js` içindeki `base` ayarı yapar ve yalnızca `GITHUB_PAGES=true` ortam değişkeni verildiğinde devreye girer — böylece aynı kod kök dizinde yayınlandığında da (Vercel, `npm run preview`) bozulmaz.

Yayının durumunu deponun **Actions** sekmesinden izleyebilirsin.

### Vercel (isteğe bağlı)

`vercel.json` dosyası duruyor; depoyu Vercel'e bağlarsan orada da kök dizinde yayınlanır. İki yöntem birbirini engellemez.

## ⭐ Kategori ve kelime eklemek

Tek dosyayı değiştirmen yeterli: **`src/data/categories.js`**

Her kelime bir nesnedir ve iki alanı vardır:

```js
{ word: 'Doktor', hint: 'Eczacı' }
```

- **`word`** — dedektiflerin göreceği gerçek kelime.
- **`hint`** — "yanıltıcı ipucu" modunda sahtekârın göreceği kelime. Gerçek kelimeye *yakın* ama *aynı olmayan* bir şey olmalı: sahtekâr konuşmaya bir zemin bulsun ama gerçeği bilmesin.

### Yeni kelime eklemek

İlgili kategorinin `words` dizisine bir satır ekle:

```js
{
  id: 'meslekler',
  name: 'Meslekler',
  words: [
    { word: 'Doktor', hint: 'Eczacı' },
    { word: 'Öğretmen', hint: 'Okul Müdürü' },
    { word: 'Pilot', hint: 'Hostes' },   // <-- yeni satır
  ],
},
```

### Yeni kategori eklemek

Dosyadaki `CATEGORIES` dizisine yeni bir nesne ekle:

```js
{
  id: 'hayvanlar',        // benzersiz olmalı, küçük harf ve tire
  name: 'Hayvanlar',      // ekranda görünen ad
  words: [
    { word: 'Aslan', hint: 'Kaplan' },
    { word: 'Penguen', hint: 'Fok' },
    // en az 2 kelime gerekli
  ],
},
```

Kaydettiğinde sayfa kendiliğinden yenilenir, kategori kurulum ekranında çıkar.

### Uyulması gereken kurallar

| Kural | Ne olur uyulmazsa? |
|---|---|
| `id` benzersiz olmalı | Aynı `id`'li ikinci kategori yok sayılır |
| Her kategoride en az 2 kelime | Kategori oyuna alınmaz |
| Bir `hint`, kendi kategorisindeki bir kelime **olmamalı** | Sahtekâr ipucuna bakıp gerçek kelimeyi söyleyebilir |
| Aynı kelime bir kategoride iki kez olmamalı | Fazlası otomatik atılır |

Bozuk veri uygulamayı çökertmez: geçersiz kayıtlar elenir, sebebi tarayıcı konsoluna yazılır. Hiç geçerli kategori kalmazsa açılışta uyarı ekranı çıkar.

## Ayarlar

| Ayar | Değer |
|---|---|
| Oyuncu sayısı | 3–20 |
| Süre | 30 sn – 10 dk (varsayılan 3 dk), 30 sn adımlarla |
| Sahtekâr sayısı | 1 · 2 (2. sahtekâr en az 8 oyuncuda seçilebilir) |
| Sahtekârın gördüğü | Hiçbir şey · Sadece kategori · Yanıltıcı ipucu kelime |

Bu sınırlar `src/constants/gameConfig.js` dosyasında tek yerde duruyor.

## Proje yapısı

```
src/
├─ data/          categories.js (⭐ kelimeler burada) + veri doğrulama
├─ constants/     gameConfig.js — tüm sınırlar ve sabitler
├─ game/          oyun kuralları (saf fonksiyonlar, React'ten bağımsız)
│  ├─ gameReducer.js      tüm durum ve faz geçişleri
│  ├─ roundSetup.js       tur kurulumu: kategori, kelime, sahtekâr seçimi
│  ├─ setupValidation.js  kurulum ekranı doğrulaması
│  └─ voting.js           oy sayımı, kazanan, puanlama
├─ hooks/         useGameState, useCountdown, useTapGuard
├─ components/
│  ├─ ui/         Button, Card, RadioGroup, NumberStepper, ErrorText
│  ├─ setup/      oyuncu listesi, kategori seçici, ayarlar
│  ├─ role/       rol kartı
│  ├─ discussion/ geri sayım, konuşma sırası
│  ├─ voting/     oy listesi
│  ├─ result/     oy dökümü, puan tablosu
│  └─ screens/    her faz için bir ekran
└─ styles/        theme.css (renk/boşluk değişkenleri) + global.css
```

Oyunun tüm durumu tek bir `useReducer` içinde; ekranlar sadece "şunu yap" der, kuralları `game/` klasörü bilir. Bir kuralı değiştirmek istediğinde bileşenlerin içinde arama yapman gerekmez.

## Bilinmesi gerekenler

- **Kayıt tutulmaz.** Puanlar ve ayarlar sadece o oturum boyunca bellekte durur; sekmeyi kapatınca sıfırlanır. (Tasarım kararı.)
- **Sunucu yok.** Her şey tarayıcıda çalışır, veri hiçbir yere gönderilmez.
- **Tek cihaz.** Oyun telefonun elden ele dolaşmasına göre tasarlandı; ekran değiştikten sonra butonlar yarım saniye pasif kalır ki hızlı çift dokunma başkasının rolünü açmasın.
