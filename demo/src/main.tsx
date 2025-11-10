import React from 'react';
import ReactDOM from 'react-dom/client';
import { DemoIndex } from './components/DemoIndex';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoIndex />
  </React.StrictMode>
);

