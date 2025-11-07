import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// CSS removed - focusing on functional evolutionary game

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);