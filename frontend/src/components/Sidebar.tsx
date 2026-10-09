import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, Map, GitCompareArrows, Atom, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const links = [
  { to: '/', icon: Globe, label: 'Earth Explorer' },
  { to: '/land-cover', icon: Map, label: 'Earth Analysis' },
  { to: '/change-detection', icon: GitCompareArrows, label: 'Applications' },
  { to: '/quantum-lab', icon: Atom, label: 'Quantum Mode' },
  { to: '/results', icon: BarChart3, label: 'Results & History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-300 z-40 relative`}>
      
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 bg-surface border border-border rounded-full p-1 text-textMuted hover:text-textMain hover:border-primary shadow-sm z-50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Brand Header */}
      <div className="h-16 px-4 flex flex-col justify-center border-b border-border overflow-hidden whitespace-nowrap">
        {collapsed ? (
          <div className="font-bold text-lg text-primary tracking-wider text-center mx-auto">D</div>
        ) : (
          <>
            <div className="text-[15px] font-bold tracking-widest text-textMain font-display">DHARA</div>
            <div className="text-[9px] text-primary mt-0.5 tracking-widest uppercase font-medium">Earth Intelligence</div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1 px-2">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group relative ${
                isActive
                  ? 'text-primary bg-primary/10 font-medium'
                  : 'text-textMuted hover:text-textMain hover:bg-surfaceHover'
              }`
            }
            title={collapsed ? l.label : undefined}
          >
            {({ isActive }) => (
              <>
                <l.icon className={`shrink-0 ${collapsed ? 'w-5 h-5 mx-auto' : 'w-[18px] h-[18px]'}`} />
                {!collapsed && <span className="text-[13px] whitespace-nowrap">{l.label}</span>}
                
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border overflow-hidden whitespace-nowrap flex items-center justify-center">
        {collapsed ? (
          <div className="w-6 h-6 rounded bg-surfaceHover flex items-center justify-center text-[8px] font-bold text-textMuted">V1</div>
        ) : (
          <div className="text-[10px] text-textMuted font-mono">DHARA v1.0.0</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
