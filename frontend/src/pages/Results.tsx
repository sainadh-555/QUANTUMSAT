import { useEffect, useState } from 'react';
import { getExperiments } from '../services/api';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';

const Results = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getExperiments()
      .then(data => { setExperiments(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="p-6 overflow-y-auto h-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Experiment Results</h2>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48 text-textMuted">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading experiments…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 rounded">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div className="text-sm text-danger">Failed to load experiments from backend.</div>
        </div>
      )}

      {!loading && !error && experiments.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-textMuted">
          <BarChart3 className="w-10 h-10 opacity-15 mb-3" />
          <p className="text-sm">No experiments have been run yet.</p>
          <p className="text-xs mt-1">Navigate to Land-Cover Analysis or Quantum Analysis to generate real results.</p>
        </div>
      )}

      {experiments.length > 0 && (
        <div className="space-y-3">
          {experiments.map((exp: any) => (
            <div key={exp.experiment_id} className="bg-surface border border-border rounded p-4 hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-semibold">{exp.module}</div>
                  <div className="text-[10px] font-mono text-textMuted mt-0.5">{exp.experiment_id} · {exp.timestamp?.split('T')[0]}</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 rounded">
                  {exp.model_type}
                </span>
              </div>
              <div className="flex gap-6 text-xs text-textMuted">
                {exp.metrics?.accuracy != null && (
                  <span>Accuracy: <span className="text-textMain font-medium">{(exp.metrics.accuracy * 100).toFixed(1)}%</span></span>
                )}
                {exp.metrics?.macro_f1 != null && (
                  <span>F1: <span className="text-textMain font-medium">{(exp.metrics.macro_f1 * 100).toFixed(1)}%</span></span>
                )}
                {exp.runtime_seconds != null && (
                  <span>Runtime: <span className="text-textMain font-medium">{exp.runtime_seconds}s</span></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
