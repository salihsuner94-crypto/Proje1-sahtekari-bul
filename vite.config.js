import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Servis çalışanı (service worker) yeni sürüm çıktığında kendini günceller;
      // kullanıcıya "güncelle" düğmesi göstermemize gerek kalmıyor.
      registerType: 'autoUpdate',

      // Uygulama künyesi public/manifest.webmanifest dosyasında elle duruyor.
      // Sebebi: eklenti manifest bağlantısını yalnızca üretim derlemesine ekliyor,
      // elle yazınca geliştirme sunucusunda da (telefondan) test edebiliyoruz.
      manifest: false,

      // public/ içindeki bu dosyalar da çevrimdışı önbelleğe alınsın.
      includeAssets: ['favicon.svg', 'favicon-64.png', 'apple-touch-icon.png', 'manifest.webmanifest'],
      workbox: {
        // Oyun tamamen istemci tarafında çalışıyor: tüm dosyaları önbelleğe alınca
        // uçak modunda bile açılıyor.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },

      devOptions: {
        // Geliştirme sunucusunda da PWA'yı test edebilelim diye açık.
        enabled: true,
      },
    }),
  ],
  server: {
    // open: true dersen npm run dev tarayıcıyı kendisi açar
    port: 5173,
  },
});
