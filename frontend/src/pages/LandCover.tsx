import { useState } from 'react';
import { trainClassification } from '../services/api';
import { Play } from 'lucide-react';

const LandCover = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTrain = async () => {
    setLoading(true);
    try {
      const res = await trainClassification({
        dataset: 'eurosat',
        classes: ['AnnualCrop', 'Forest', 'Residential', 'River'],
        model_type: 'RBF-SVM',
        samples_per_class: 100
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Land-Cover Explorer</h2>
      
      <div className="bg-surface p-6 rounded-lg border border-surfaceHover shadow-sm">
        <h3 className="font-medium mb-4">Model Configuration</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-textMuted mb-1">Model Type</label>
            <select className="w-full bg-background border border-surfaceHover rounded px-3 py-2 text-sm">
              <option>RBF-SVM (Classical)</option>
              <option>Random Forest (Classical)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-textMuted mb-1">Samples per class</label>
            <input type="number" defaultValue={100} className="w-full bg-background border border-surfaceHover rounded px-3 py-2 text-sm" />
          </div>
        </div>
        
        <button 
          onClick={handleTrain}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded text-sm transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4 mr-2" />
          {loading ? 'Training...' : 'Train Model'}
        </button>
      </div>

      {result && (
        <div className="bg-surface p-6 rounded-lg border border-accentGreen/20 shadow-sm">
          <h3 className="font-medium text-accentGreen mb-2">Training Complete</h3>
          <p className="text-sm text-textMuted">Experiment ID: {result.experiment_id}</p>
        </div>
      )}
    </div>
  );
};

export default LandCover;
