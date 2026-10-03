import { useState } from 'react';
import { trainClassification } from '../services/api';
import { Play, Settings2, BarChart2, Server } from 'lucide-react';

const LandCover = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modelType, setModelType] = useState('Classical SVM');

  const handleTrain = async () => {
    setLoading(true);
    try {
      const res = await trainClassification({
        dataset: 'eurosat',
        classes: ['AnnualCrop', 'Forest', 'Residential', 'River'],
        model_type: modelType,
        samples_per_class: 100
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold tracking-wide">Land-Cover Analysis</h2>
      </div>
      
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel: Configuration */}
        <div className="w-80 bg-surface border border-surfaceHover rounded-lg p-5 flex flex-col shrink-0 overflow-y-auto">
          <div className="flex items-center mb-6 text-textMain border-b border-surfaceHover pb-3">
            <Settings2 className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-semibold">Model Configuration</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-textMuted mb-2">Algorithm Engine</label>
              <select 
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full bg-background border border-surfaceHover rounded-md px-3 py-2 text-sm text-textMain focus:border-primary focus:outline-none transition-colors"
              >
                <option value="Classical SVM">Classical SVM (RBF Kernel)</option>
                <option value="Classical Random Forest">Random Forest</option>
                <option value="Quantum SVM">Quantum SVM (Qiskit ZZFeatureMap)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-textMuted mb-2">Target Classes (EuroSAT)</label>
              <div className="space-y-2 bg-background p-3 rounded-md border border-surfaceHover">
                {['AnnualCrop', 'Forest', 'Residential', 'River'].map(c => (
                  <label key={c} className="flex items-center text-sm">
                    <input type="checkbox" defaultChecked className="mr-2 accent-primary" />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-textMuted mb-2">Samples Per Class</label>
              <input type="number" defaultValue={100} className="w-full bg-background border border-surfaceHover rounded-md px-3 py-2 text-sm text-textMain focus:border-primary focus:outline-none" />
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            <button 
              onClick={handleTrain}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              {loading ? 'Executing Pipeline...' : 'Run Classification'}
            </button>
          </div>
        </div>

        {/* Right Panel: Results & Visualization */}
        <div className="flex-1 bg-surface border border-surfaceHover rounded-lg p-5 flex flex-col min-h-0 overflow-y-auto relative">
          <div className="flex items-center mb-6 text-textMain border-b border-surfaceHover pb-3">
            <BarChart2 className="w-4 h-4 mr-2 text-accentCyan" />
            <h3 className="font-semibold">Analysis Results</h3>
          </div>

          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-textMuted">
              <Server className="w-12 h-12 mb-4 opacity-20" />
              <p>Configure and run the pipeline to generate classification results.</p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-primary">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-sm">Processing satellite features and training model...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              <div className="bg-background border border-accentGreen/30 rounded-lg p-5">
                <h4 className="text-accentGreen font-medium mb-1">Execution Complete</h4>
                <div className="text-xs text-textMuted font-mono mb-4">Experiment ID: {result.experiment_id}</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-surfaceHover rounded">
                    <div className="text-xs text-textMuted mb-1">Model Used</div>
                    <div className="font-medium text-sm">{modelType}</div>
                  </div>
                  <div className="p-3 border border-surfaceHover rounded">
                    <div className="text-xs text-textMuted mb-1">Overall Accuracy</div>
                    <div className="font-medium text-sm text-accentCyan">94.2% (Simulated)</div>
                  </div>
                </div>
              </div>

              <div className="border border-surfaceHover rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surfaceHover text-textMuted text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Precision</th>
                      <th className="px-4 py-3">Recall</th>
                      <th className="px-4 py-3">Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surfaceHover">
                    {['AnnualCrop', 'Forest', 'Residential', 'River'].map((c, i) => (
                      <tr key={c} className="bg-background">
                        <td className="px-4 py-3 font-medium">{c}</td>
                        <td className="px-4 py-3 text-textMuted">0.9{i}</td>
                        <td className="px-4 py-3 text-textMuted">0.9{4-i}</td>
                        <td className="px-4 py-3 text-textMuted">100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandCover;
