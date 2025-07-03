import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { authGuard } from './middleware/authGuard';

// Initialize auth guard before rendering the app
authGuard.initialize().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}).catch((error) => {
  console.error('Auth guard initialization failed:', error);
  // Still render the app even if auth guard fails
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
