import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EarthExplorer from './pages/EarthExplorer';
import LandCover from './pages/LandCover';
import QuantumLab from './pages/QuantumLab';
import ChangeDetection from './pages/ChangeDetection';
import Results from './pages/Results';
import TerraCopilot from './components/TerraCopilot';

function App() {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <Router basename="/QUANTUMSAT">
      <div className="flex h-screen w-screen overflow-hidden bg-background text-textMain">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            toggleCopilot={() => setCopilotOpen(!copilotOpen)}
            copilotOpen={copilotOpen}
          />
          <div className="flex-1 overflow-hidden flex">
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<EarthExplorer />} />
                <Route path="/land-cover" element={<LandCover />} />
                <Route path="/change-detection" element={<ChangeDetection />} />
                <Route path="/quantum-lab" element={<QuantumLab />} />
                <Route path="/results" element={<Results />} />
              </Routes>
            </main>
            {copilotOpen && (
              <aside className="w-96 shrink-0 border-l border-border bg-surface">
                <TerraCopilot onClose={() => setCopilotOpen(false)} />
              </aside>
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
