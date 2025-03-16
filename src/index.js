// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css'; // Updated for antd v5
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
