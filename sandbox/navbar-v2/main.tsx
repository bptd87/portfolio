import React from 'react';
import ReactDOM from 'react-dom/client';
// If your project has a global CSS entry (Tailwind), import it here:
// import '../../index.css';
import { SandboxApp } from './SandboxApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SandboxApp />
  </React.StrictMode>
);