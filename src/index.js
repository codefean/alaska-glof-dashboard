import React from 'react';
import { createRoot } from 'react-dom/client'; // ✅ use createRoot
import App2 from './App2'; // Import the new main component
import './styles/App2.css'; // Ensure your global styles are loaded

const container = document.getElementById('root');
const root = createRoot(container); // ✅ create the root
root.render(
  <React.StrictMode>
    <App2 />
  </React.StrictMode>
);