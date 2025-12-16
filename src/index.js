// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@ant-design/v5-patch-for-react-19'; // React 19 compatibility patch for Ant Design v5
import App from './App';
import 'antd/dist/reset.css'; // Ant Design v5 CSS
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
