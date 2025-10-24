import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Fonction pour vérifier si l'application est lancée en mode standalone (PWA)
const isInStandaloneMode = () => 
  (window.matchMedia('(display-mode: standalone)').matches) || 
  (window.navigator as any).standalone || 
  document.referrer.includes('android-app://');

// Ajouter une classe au body si l'application est en mode standalone
if (isInStandaloneMode()) {
  document.body.classList.add('standalone-mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);