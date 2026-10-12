import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initEmbed } from '@/core/share-link/embed';
import { App } from './App';
import '@/theme/global.css';

initEmbed();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
