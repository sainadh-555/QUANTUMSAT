import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EarthExplorer from './pages/EarthExplorer';
import EarthAnalysis from './pages/EarthAnalysis';
import Applications from './pages/Applications';
import QuantumLab from './pages/QuantumLab';
import Results from './pages/Results';
import TerraCopilot from './components/TerraCopilot';
import { CaptureProvider } from './context/CaptureContext';

function AppContent() {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const location = useLocation();
  const isQuantumMode = location.pathname.includes('/quantum-lab');

  useEffect(() => {
    if (isQuantumMode) {
      document.body.classList.add('quantum-mode');
    } else {
      document.body.classList.remove('quantum-mode');
    }
  }, [isQuantumMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-textMain transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-colors duration-300">
        <Header
          toggleCopilot={() => setCopilotOpen(!copilotOpen)}
          copilotOpen={copilotOpen}
        />
        <div className="flex-1 overflow-hidden flex relative">
          <main className="flex-1 h-full relative">
            <Routes>
              <Route path="/" element={<EarthExplorer />} />
              <Route path="/earth-analysis" element={<EarthAnalysis />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/quantum-lab" element={<QuantumLab />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </main>
          
          {/* Slide-out Copilot Panel */}
          <aside className={`transition-all duration-300 ease-in-out bg-surface border-l border-border z-10 flex-shrink-0 ${copilotOpen ? 'w-96' : 'w-0 overflow-hidden border-none'}`}>
            {copilotOpen && <TerraCopilot onClose={() => setCopilotOpen(false)} />}
          </aside>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/QUANTUMSAT">
      <CaptureProvider>
        <AppContent />
      </CaptureProvider>
    </Router>
  );
}

export default App;
