import { NavLink } from 'react-router-dom';
import { Globe, Map, GitCompareArrows, Atom, BarChart3 } from 'lucide-react';

const links = [
  { to: '/', icon: Globe, label: 'Earth Explorer' },
  { to: '/land-cover', icon: Map, label: 'Land-Cover Analysis' },
  { to: '/change-detection', icon: GitCompareArrows, label: 'Change Detection' },
  { to: '/quantum-lab', icon: Atom, label: 'Quantum Analysis' },
  { to: '/results', icon: BarChart3, label: 'Results' },
];

const Sidebar = () => (
  <aside className="w-56 bg-surface border-r border-border flex flex-col shrink-0">
    <div className="px-4 py-5 border-b border-border">
      <div className="text-sm font-bold tracking-widest text-textMain">TERRA QUANTUM</div>
      <div className="text-[10px] text-accent mt-0.5 tracking-wide">AI + Quantum Earth Intelligence</div>
    </div>
    <nav className="flex-1 py-3">
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${
              isActive
                ? 'text-primary bg-primary/8 border-r-2 border-primary font-medium'
                : 'text-textMuted hover:text-textMain hover:bg-surfaceHover'
            }`
          }
        >
          <l.icon className="w-4 h-4" />
          {l.label}
        </NavLink>
      ))}
    </nav>
    <div className="px-4 py-3 border-t border-border text-[10px] text-textMuted font-mono">
      VNQFF-09
    </div>
  </aside>
);

export default Sidebar;
