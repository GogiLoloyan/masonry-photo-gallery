import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { logWebVitals, reportWebVitals } from './utils/reportWebVitals';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Report Web Vitals
// In development: logs to console
// In production: can be sent to analytics
reportWebVitals(import.meta.env.DEV ? logWebVitals : undefined);
