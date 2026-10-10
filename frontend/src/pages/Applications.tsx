import { Grid, Droplets, Building2, Trees, Leaf, Map as MapIcon, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apps = [
  {
    id: 'flood',
    title: 'Flood Monitoring',
    description: 'Detect inundated areas and assess flood damage using SAR and optical imagery.',
    icon: Droplets,
    color: 'bg-blue-500',
    available: true,
  },
  {
    id: 'urban',
    title: 'Urban Growth',
    description: 'Track city expansion, infrastructure development, and urban sprawl over time.',
    icon: Building2,
    color: 'bg-purple-500',
    available: true,
  },
  {
    id: 'agriculture',
    title: 'Agriculture & Vegetation',
    description: 'Monitor crop health, yield estimation, and seasonal vegetation changes.',
    icon: Leaf,
    color: 'bg-green-500',
    available: true,
  },
  {
    id: 'water',
    title: 'Water Monitoring',
    description: 'Analyze reservoir levels, coastline changes, and water quality indicators.',
    icon: Grid,
    color: 'bg-cyan-500',
    available: true,
  },
  {
    id: 'forest',
    title: 'Forest & Environmental',
    description: 'Track deforestation, logging activities, and general forest health.',
    icon: Trees,
    color: 'bg-emerald-600',
    available: true,
  },
  {
    id: 'landcover',
    title: 'Land-Cover Mapping',
    description: 'Classify terrain into categorical maps (urban, forest, water, agriculture).',
    icon: MapIcon,
    color: 'bg-amber-500',
    available: true,
  }
];

const Applications = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-textMain tracking-tight">Applications Gallery</h2>
          <p className="text-textMuted mt-1">Ready-made workflows for specific Earth-observation use cases.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(app => (
            <div key={app.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
              <div className={`h-24 ${app.color} bg-opacity-10 relative overflow-hidden flex items-center justify-center`}>
                <app.icon className={`w-12 h-12 ${app.color.replace('bg-', 'text-')} opacity-20 absolute -right-2 -bottom-2 scale-150 transform group-hover:scale-110 transition-transform duration-500`} />
                <app.icon className={`w-8 h-8 ${app.color.replace('bg-', 'text-')} relative z-10`} />
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-textMain text-lg">{app.title}</h3>
                  {!app.available && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-surfaceHover text-textMuted px-2 py-1 rounded">Coming Soon</span>
                  )}
                </div>
                <p className="text-sm text-textMuted leading-relaxed mb-6 flex-1">
                  {app.description}
                </p>
                
                <button
                  onClick={() => navigate('/earth-analysis', { state: { app: app.id } })}
                  disabled={!app.available}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    app.available 
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20' 
                      : 'bg-surfaceHover text-textMuted cursor-not-allowed border border-border'
                  }`}
                >
                  {app.available ? 'OPEN ANALYSIS' : 'UNAVAILABLE'}
                  {app.available && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Applications;
