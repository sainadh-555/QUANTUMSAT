import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Globe, Focus, FlaskConical, GitCompare, History, BookOpen, Settings } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/land-cover', icon: Globe, label: 'Land-Cover Explorer' },
    { to: '/change-detection', icon: Focus, label: 'Change Detection' },
    { to: '/quantum-lab', icon: FlaskConical, label: 'Quantum Laboratory' },
    { to: '/compare', icon: GitCompare, label: 'Model Comparison' },
    { to: '/history', icon: History, label: 'Experiment History' },
    { to: '/docs', icon: BookOpen, label: 'Data & Docs' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-surfaceHover h-full flex flex-col">
      <div className="p-4 border-b border-surfaceHover">
        <h1 className="text-lg font-bold text-textMain tracking-wide">QUANTUM EARTH<br/><span className="text-sm font-normal text-textMuted">INTELLIGENCE</span></h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink 
                to={link.to} 
                className={({isActive}) => `flex items-center px-4 py-2 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'}`}
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-surfaceHover text-xs text-textMuted">
        Project ID: VNQFF-09
      </div>
    </aside>
  );
};

export default Sidebar;
