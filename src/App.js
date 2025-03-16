// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainTest from './components/MainTest';
import ResultsPage from './components/ResultsPage';
import CreateTest from './components/CreateTest';
import CustomTest from './components/CustomTest';
import CustomResults from './components/CustomResults';
import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainTest />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/create" element={<CreateTest />} />
          <Route path="/custom/:testId" element={<CustomTest />} />
          <Route path="/custom/:testId/results" element={<CustomResults />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
