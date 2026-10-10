import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Wifi, WifiOff, Loader2, Info, RefreshCw, ChevronRight, Database, Bell } from 'lucide-react';
import { getHealth } from '../services/api';

interface HeaderProps {
  toggleCopilot: () => void;
  copilotOpen: boolean;
}

type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected';

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/': return 'Earth Explorer';
    case '/land-cover': return 'Earth Analysis';
    case '/applications': return 'Earth Modules';
    case '/quantum-lab': return 'Quantum Mode';
    case '/results': return 'Results & History';
    case '/settings': return 'Settings';
    default: return 'Earth Intelligence';
  }
};

const Header = ({ toggleCopilot, copilotOpen }: HeaderProps) => {
  const [conn, setConn] = useState<ConnectionState>('Connecting');
  const location = useLocation();

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
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-5 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-2 text-sm text-textMain font-medium">
        <span className="text-textMuted tracking-wide text-xs">DHARA</span>
        <ChevronRight className="w-3.5 h-3.5 text-textMuted" />
        <span>{getPageTitle(location.pathname)}</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Data Source */}
        <div className="flex items-center gap-1.5 text-[11px] text-textMuted border-r border-border pr-4">
          <Database className="w-3 h-3 text-primary" />
          <span>CDSE Sentinel-2</span>
        </div>

        {/* Connection status */}
        <div className="group relative flex items-center gap-1.5 text-xs cursor-help">
          {conn === 'Connected' && <><Wifi className="w-3.5 h-3.5 text-accent" /><span className="text-textMuted font-medium">API Online</span></>}
          {conn === 'Connecting' && <><Loader2 className="w-3.5 h-3.5 text-warning animate-spin" /><span className="text-textMuted font-medium">Connecting...</span></>}
          {conn === 'Disconnected' && <><WifiOff className="w-3.5 h-3.5 text-danger" /><span className="text-danger font-medium">API Offline</span></>}
          
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-3 w-64 bg-surface border border-border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-3 pointer-events-none group-hover:pointer-events-auto">
            <h4 className="font-semibold text-textMain flex items-center gap-1.5 mb-1"><Info className="w-3.5 h-3.5 text-primary" /> API Status: {conn}</h4>
            <p className="text-[10px] text-textMuted mb-2">
              {conn === 'Connected' 
                ? 'Backend is online. Machine learning, Qiskit experiments, and Copilot are fully functional.' 
                : 'The Python API is currently unreachable. You can still explore the frontend, but classification and quantum tasks will fail.'}
            </p>
            {conn !== 'Connected' && (
              <button onClick={checkHealth} className="flex items-center gap-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2 py-1.5 rounded transition-colors w-full justify-center font-medium">
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        <button className="text-textMuted hover:text-textMain transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-surface"></span>
        </button>

        {/* Gemini API Key */}
        <div className="relative group">
          <input
            type="password"
            placeholder="Gemini API Key..."
            className="bg-background border border-border rounded px-2.5 py-1 text-xs text-textMain focus:outline-none focus:border-primary w-36 focus:w-48 transition-all placeholder:text-textMuted"
            defaultValue={localStorage.getItem('gemini_api_key') || ''}
            onChange={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 pointer-events-none text-[10px] text-textMuted">
            Required for Advanced Gemini AI Vision Analysis. Keys are stored locally in your browser.
          </div>
        </div>

        {/* Copilot toggle */}
        <button
          onClick={toggleCopilot}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
            copilotOpen
              ? 'bg-primary/15 text-primary border-primary/30'
              : 'text-textMuted border-border hover:text-textMain hover:bg-surfaceHover hover:border-textMuted/30'
          }`}
        >
          <Bot className="w-4 h-4" />
          Terra Copilot
        </button>
      </div>
    </header>
  );
};

export default Header;
