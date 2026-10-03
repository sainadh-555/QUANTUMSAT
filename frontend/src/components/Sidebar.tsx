import { NavLink } from 'react-router-dom';
import { Globe, Map, Focus, FlaskConical, Database } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/', icon: Globe, label: 'Earth Explorer' },
    { to: '/land-cover', icon: Map, label: 'Land-Cover Analysis' },
    { to: '/change-detection', icon: Focus, label: 'Change Detection' },
    { to: '/quantum-lab', icon: FlaskConical, label: 'Quantum Analysis' },
    { to: '/results', icon: Database, label: 'Results' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-surfaceHover h-full flex flex-col shrink-0">
      <div className="p-5 border-b border-surfaceHover">
        <h1 className="text-lg font-bold text-textMain tracking-wider">TERRA QUANTUM</h1>
        <div className="text-xs text-accentGreen mt-1 font-medium">AI + Quantum Earth Intelligence</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink 
                to={link.to} 
                className={({isActive}) => `flex items-center px-5 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'}`}
              >
                <link.icon className="w-4 h-4 mr-3" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-surfaceHover text-xs text-textMuted font-mono">
        VNQFF-09
      </div>
    </aside>
  );
};

export default Sidebar;
