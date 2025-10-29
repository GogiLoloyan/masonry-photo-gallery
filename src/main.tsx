import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Lazy load Web Vitals reporting - non-critical for initial render
if (import.meta.env.DEV) {
  import('./utils/reportWebVitals').then(({ reportWebVitals, logWebVitals }) => {
    reportWebVitals(logWebVitals);
  });
}
