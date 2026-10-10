import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/manrope';
import './styles.css';
import App from './App.jsx';
import { fetchCatalog } from './api.js';
import { loadCatalog } from './data';
import { extendDictionary } from './i18n';
import { StoreProvider } from './store.jsx';

// Avval backenddan menyu yuklanadi (javob bo'lmasa — namuna ma'lumotlar), keyin sayt chiziladi
loadCatalog(fetchCatalog, extendDictionary).finally(() => {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <StoreProvider>
          <App />
        </StoreProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});
