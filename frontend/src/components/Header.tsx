import { useEffect, useState } from 'react';
import { Bot, Wifi, WifiOff, Loader2, Info, RefreshCw } from 'lucide-react';
import { getHealth } from '../services/api';

interface HeaderProps {
  toggleCopilot: () => void;
  copilotOpen: boolean;
}

type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected';

const Header = ({ toggleCopilot, copilotOpen }: HeaderProps) => {
  const [conn, setConn] = useState<ConnectionState>('Connecting');

  const checkHealth = () => {
    setConn('Connecting');
    getHealth()
      .then(() => setConn('Connected'))
      .catch(() => setConn('Disconnected'));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header className="h-12 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="text-xs text-textMuted">Quantum-Enhanced Earth Observation Analysis</div>
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="group relative flex items-center gap-1.5 text-xs cursor-help">
          {conn === 'Connected' && <><Wifi className="w-3 h-3 text-accent" /><span className="text-textMuted">Connected</span></>}
          {conn === 'Connecting' && <><Loader2 className="w-3 h-3 text-warning animate-spin" /><span className="text-textMuted">Connecting</span></>}
          {conn === 'Disconnected' && <><WifiOff className="w-3 h-3 text-danger" /><span className="text-danger font-medium">Backend Unavailable</span></>}
          
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-3 pointer-events-none group-hover:pointer-events-auto">
            <h4 className="font-semibold text-textMain flex items-center gap-1.5 mb-1"><Info className="w-3.5 h-3.5 text-primary" /> API Status: {conn}</h4>
            <p className="text-[10px] text-textMuted mb-2">
              {conn === 'Connected' 
                ? 'Backend is online. Machine learning, Qiskit experiments, and Copilot are fully functional.' 
                : 'The Python API is currently unreachable. You can still explore the frontend, but classification and quantum tasks will fail.'}
            </p>
            {conn !== 'Connected' && (
              <button onClick={checkHealth} className="flex items-center gap-1 text-[10px] bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded transition-colors w-full justify-center">
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
            )}
          </div>
        </div>

        {/* Copilot toggle */}
        <button
          onClick={toggleCopilot}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
            copilotOpen
              ? 'bg-primary/15 text-primary border-primary/30'
              : 'text-textMuted border-border hover:text-textMain hover:bg-surfaceHover'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          Terra Copilot
        </button>
      </div>
    </header>
  );
};

export default Header;
