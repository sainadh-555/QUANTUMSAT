import { useEffect, useState } from 'react';
import { getSystemStatus } from '../services/api';
import { Database, Server, Cpu } from 'lucide-react';

const Overview = () => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    getSystemStatus().then(setStatus).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-lg border border-surfaceHover shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Project Overview</h2>
        <p className="text-textMuted text-sm">
          A platform exploring the intersection of Classical and Quantum Machine Learning applied to satellite earth observation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-lg border border-surfaceHover">
          <div className="flex items-center mb-4 text-accentCyan">
            <Database className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-textMain">Datasets</h3>
          </div>
          <div className="text-sm text-textMuted space-y-2">
            <div className="flex justify-between">
              <span>EuroSAT</span>
              <span className={status?.datasets?.eurosat?.available ? 'text-accentGreen' : 'text-red-400'}>
                {status?.datasets?.eurosat?.available ? 'Available' : 'Missing'}
              </span>
            </div>
            {status?.datasets?.eurosat?.available && (
              <div className="text-xs">
                Classes: {status.datasets.eurosat.classes.join(', ')}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg border border-surfaceHover">
          <div className="flex items-center mb-4 text-primary">
            <Server className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-textMain">Backend Connection</h3>
          </div>
          <div className="text-sm text-textMuted space-y-2">
            <div className="flex justify-between">
              <span>API Status</span>
              <span className={status ? 'text-accentGreen' : 'text-yellow-400'}>
                {status ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg border border-surfaceHover">
          <div className="flex items-center mb-4 text-secondary">
            <Cpu className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-textMain">Dependencies</h3>
          </div>
          <div className="text-sm text-textMuted space-y-2">
            <div className="flex justify-between">
              <span>Qiskit</span>
              <span className={status?.dependencies?.qiskit ? 'text-accentGreen' : 'text-red-400'}>
                {status?.dependencies?.qiskit ? 'Installed' : 'Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Scikit-Learn</span>
              <span className={status?.dependencies?.scikit_learn ? 'text-accentGreen' : 'text-red-400'}>
                {status?.dependencies?.scikit_learn ? 'Installed' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
