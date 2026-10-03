import { useState } from 'react';
import { trainClassical } from '../services/api';
import { Play, Loader2, AlertCircle, CheckCircle2, Settings2, BarChart2 } from 'lucide-react';

const LandCover = () => {
  const [modelType, setModelType] = useState('RBF-SVM');
  const [samples, setSamples] = useState(50);
  const [classes, setClasses] = useState(['AnnualCrop', 'Forest', 'Residential', 'River']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleClass = (cls: string) => {
    setClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleTrain = async () => {
    if (classes.length < 2) { setError('Select at least 2 classes.'); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('model_type', modelType);
      fd.append('classes', classes.join(','));
      fd.append('samples_per_class', String(samples));
      const res = await trainClassical(fd);
      setResult(res);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e.message || 'Request failed';
      setError(msg);
    }
    setLoading(false);
  };

  const availableClasses = ['AnnualCrop', 'Forest', 'HerbaceousVegetation', 'Highway', 'Industrial', 'Pasture', 'PermanentCrop', 'Residential', 'River', 'SeaLake'];

  return (
    <div className="flex h-full min-h-0">
      {/* Config panel */}
      <div className="w-72 bg-surface border-r border-border p-4 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Configuration</h3>
        </div>

        <label className="text-xs text-textMuted mb-1.5">Algorithm</label>
        <select
          value={modelType}
          onChange={e => setModelType(e.target.value)}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary"
        >
          <option value="RBF-SVM">SVM (RBF Kernel)</option>
          <option value="Random Forest">Random Forest</option>
        </select>

        <label className="text-xs text-textMuted mb-1.5">Samples per class</label>
        <input
          type="number"
          min={10}
          max={500}
          value={samples}
          onChange={e => setSamples(Number(e.target.value))}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary"
        />

        <label className="text-xs text-textMuted mb-1.5">Target classes</label>
        <div className="bg-background border border-border rounded p-2 mb-4 space-y-1 max-h-48 overflow-y-auto">
          {availableClasses.map(cls => (
            <label key={cls} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={classes.includes(cls)}
                onChange={() => toggleClass(cls)}
                className="accent-primary"
              />
              <span className={classes.includes(cls) ? 'text-textMain' : 'text-textMuted'}>{cls}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleTrain}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 mt-auto"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Training…' : 'Run Classification'}
        </button>
      </div>

      {/* Results panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-4 h-4 text-accentCyan" />
          <h2 className="text-lg font-semibold">Analysis Results</h2>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 rounded mb-4">
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-danger">Classification Failed</div>
              <div className="text-xs text-textMuted mt-1">{error}</div>
              <button onClick={handleTrain} className="text-xs text-primary mt-2 hover:underline">Retry</button>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-textMuted">
            <BarChart2 className="w-10 h-10 opacity-15 mb-3" />
            <p className="text-sm">Configure the model and run classification to generate results.</p>
            <p className="text-xs mt-1 text-textMuted">The EuroSAT dataset must be installed on the backend.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-64 text-primary">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Extracting features and training model…</p>
            <p className="text-xs text-textMuted mt-1">This may take a few seconds.</p>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-accent">Classification Complete</div>
                <div className="text-[10px] text-textMuted font-mono mt-1">ID: {result.experiment_id} · {result.runtime_seconds}s</div>
              </div>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Accuracy', value: `${(result.metrics.accuracy * 100).toFixed(1)}%` },
                { label: 'Macro F1', value: `${(result.metrics.macro_f1 * 100).toFixed(1)}%` },
                { label: 'Train Set', value: result.n_train },
                { label: 'Test Set', value: result.n_test },
              ].map(m => (
                <div key={m.label} className="bg-background border border-border rounded p-3 text-center">
                  <div className="text-lg font-bold text-textMain">{m.value}</div>
                  <div className="text-[10px] text-textMuted mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Confusion matrix */}
            {result.metrics.confusion_matrix && (
              <div>
                <h4 className="text-xs font-semibold text-textMuted mb-2">Confusion Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="p-1.5 text-textMuted"></th>
                        {result.classes.map((c: string) => (
                          <th key={c} className="p-1.5 text-textMuted font-medium">{c.slice(0, 6)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.metrics.confusion_matrix.map((row: number[], i: number) => (
                        <tr key={i}>
                          <td className="p-1.5 text-textMuted font-medium">{result.classes[i].slice(0, 6)}</td>
                          {row.map((val: number, j: number) => (
                            <td
                              key={j}
                              className={`p-1.5 text-center border border-border ${
                                i === j ? 'bg-accent/15 text-accent font-bold' : 'bg-background text-textMuted'
                              }`}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandCover;
