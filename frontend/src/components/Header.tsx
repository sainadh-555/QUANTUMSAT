import { useEffect, useState } from 'react';
import { Bot, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { getHealth } from '../services/api';

interface HeaderProps {
  toggleCopilot: () => void;
  copilotOpen: boolean;
}

type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected';

const Header = ({ toggleCopilot, copilotOpen }: HeaderProps) => {
  const [conn, setConn] = useState<ConnectionState>('Connecting');

  useEffect(() => {
    getHealth()
      .then(() => setConn('Connected'))
      .catch(() => setConn('Disconnected'));
  }, []);

  return (
    <header className="h-12 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="text-xs text-textMuted">Quantum-Enhanced Earth Observation Analysis</div>
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-xs">
          {conn === 'Connected' && <><Wifi className="w-3 h-3 text-accent" /><span className="text-textMuted">Connected</span></>}
          {conn === 'Connecting' && <><Loader2 className="w-3 h-3 text-warning animate-spin" /><span className="text-textMuted">Connecting</span></>}
          {conn === 'Disconnected' && <><WifiOff className="w-3 h-3 text-danger" /><span className="text-danger">Disconnected</span></>}
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
