import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/global.css';

// StrictMode geliştirme sırasında olası hataları (temizlenmeyen sayaçlar gibi)
// erkenden yakalamak için efektleri iki kez çalıştırır. Faz 3'teki geri sayımı
// bu sayede doğru yazdığımızdan emin olacağız.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
