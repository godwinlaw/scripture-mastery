import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initTheme } from './lib/theme';
import './styles.css';

// Apply the saved theme before the first paint so the boot splash and sign-in
// screen are already themed (no flash), and keep 'system' following the OS.
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
