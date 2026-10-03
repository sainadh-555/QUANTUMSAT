import { useEffect, useState } from 'react';
import { Bot, Wifi, WifiOff } from 'lucide-react';
import { getSystemStatus } from '../services/api';

interface HeaderProps {
  toggleCopilot: () => void;
  copilotOpen: boolean;
}

const Header = ({ toggleCopilot, copilotOpen }: HeaderProps) => {
  const [backendStatus, setBackendStatus] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Error'>('Connecting');

  useEffect(() => {
    getSystemStatus()
      .then((res) => {
        if (res?.status === 'ok') setBackendStatus('Connected');
        else setBackendStatus('Error');
      })
      .catch(() => setBackendStatus('Disconnected'));
  }, []);

  return (
    <header className="h-14 bg-surface border-b border-surfaceHover flex items-center justify-between px-6 shrink-0">
      <div className="text-sm font-medium text-textMain flex items-center">
        Workspace Context
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-xs">
          {backendStatus === 'Connected' ? (
            <><Wifi className="w-3 h-3 text-accentGreen mr-1.5" /> <span className="text-textMuted">Connected</span></>
          ) : backendStatus === 'Connecting' ? (
            <><Wifi className="w-3 h-3 text-yellow-500 mr-1.5 animate-pulse" /> <span className="text-textMuted">Connecting...</span></>
          ) : (
            <><WifiOff className="w-3 h-3 text-red-500 mr-1.5" /> <span className="text-red-400">Disconnected</span></>
          )}
        </div>
        
        <button 
          onClick={toggleCopilot}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${copilotOpen ? 'bg-primary/20 text-primary border-primary/50' : 'bg-surfaceHover text-textMain border-transparent hover:border-surfaceHover hover:bg-surfaceHover/80'}`}
        >
          <Bot className="w-4 h-4 mr-2" />
          Terra Copilot
        </button>
      </div>
    </header>
  );
};

export default Header;
