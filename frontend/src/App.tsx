import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import LandCover from './pages/LandCover';
import QuantumLab from './pages/QuantumLab';
import ChangeDetection from './pages/ChangeDetection';

function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/land-cover" element={<LandCover />} />
              <Route path="/quantum-lab" element={<QuantumLab />} />
              <Route path="/change-detection" element={<ChangeDetection />} />
              {/* Other routes can point to a Placeholder for now or be built fully */}
              <Route path="*" element={<div className="text-textMuted text-center mt-20">Work in Progress</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
