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
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-textMain">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          <Header toggleCopilot={() => setCopilotOpen(!copilotOpen)} copilotOpen={copilotOpen} />
          
          <div className="flex-1 overflow-hidden relative flex">
            {/* Main Workspace Area */}
            <main className="flex-1 overflow-y-auto p-6 bg-background z-0">
              <Routes>
                <Route path="/" element={<EarthExplorer />} />
                <Route path="/land-cover" element={<LandCover />} />
                <Route path="/change-detection" element={<ChangeDetection />} />
                <Route path="/quantum-lab" element={<QuantumLab />} />
                <Route path="/results" element={<Results />} />
                <Route path="*" element={<div className="text-textMuted text-center mt-20">Workspace not found.</div>} />
              </Routes>
            </main>

            {/* AI Copilot Slide-over */}
            {copilotOpen && (
              <div className="w-80 lg:w-96 shrink-0 bg-surface border-l border-surfaceHover h-full shadow-2xl z-10">
                <TerraCopilot onClose={() => setCopilotOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
