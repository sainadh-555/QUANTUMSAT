import { useEffect, useState } from 'react';
import { getExperiments } from '../services/api';
import { Database, Clock, Activity, HardDrive } from 'lucide-react';

const Results = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getExperiments()
      .then((data) => {
        setExperiments(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Experiment Results</h2>
        <button className="text-sm bg-surfaceHover px-3 py-1.5 rounded-md hover:text-primary transition-colors border border-transparent hover:border-surfaceHover">
          Export to CSV
        </button>
      </div>

      {loading ? (
        <div className="text-textMuted text-sm text-center py-12">Loading experiment records...</div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg text-center">
          <p className="text-red-400">Failed to connect to backend to retrieve results.</p>
        </div>
      ) : experiments.length === 0 ? (
        <div className="bg-surface p-12 rounded-lg border border-surfaceHover text-center">
          <HardDrive className="w-12 h-12 text-textMuted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-textMain mb-2">No Experiments Found</h3>
          <p className="text-sm text-textMuted max-w-md mx-auto">
            You haven't run any classical or quantum analyses yet. 
            Navigate to Land-Cover Analysis or Quantum Analysis to start a training run.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp: any) => (
            <div key={exp.experiment_id} className="bg-surface p-5 rounded-lg border border-surfaceHover shadow-sm hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-textMain">{exp.module} Run</h3>
                  <div className="text-xs font-mono text-textMuted mt-1">ID: {exp.experiment_id}</div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium bg-primary/20 text-primary rounded border border-primary/30">
                  {exp.model_type}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm">
                  <Activity className="w-4 h-4 mr-2 text-accentGreen" />
                  <span className="text-textMuted w-20">Accuracy:</span>
                  <span className="font-medium">{(exp.metrics?.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-accentCyan" />
                  <span className="text-textMuted w-20">Runtime:</span>
                  <span className="font-medium">{exp.runtime_seconds ? `${exp.runtime_seconds}s` : 'Unknown'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Database className="w-4 h-4 mr-2 text-secondary" />
                  <span className="text-textMuted w-20">Samples:</span>
                  <span className="font-medium">{exp.config?.samples || 'N/A'} per class</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
