import { useState, useRef } from 'react';
import { trainClassical, predictImage } from '../services/api';
import { Play, Loader2, AlertCircle, CheckCircle2, Settings2, BarChart2, Upload, Crosshair } from 'lucide-react';

const SAMPLE_IMG = import.meta.env.BASE_URL + 'sample.svg';

const LandCover = () => {
  const [modelType, setModelType] = useState('RBF-SVM');
  const [samples, setSamples] = useState(50);
  const [classes, setClasses] = useState(['AnnualCrop', 'Forest', 'Residential', 'River']);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Prediction state
  const [predictFile, setPredictFile] = useState<File | null>(null);
  const [predictUrl, setPredictUrl] = useState<string>(SAMPLE_IMG);
  const [predictResult, setPredictResult] = useState<any>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleClass = (cls: string) => {
    setClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPredictFile(file);
      setPredictUrl(URL.createObjectURL(file));
      setPredictResult(null);
      setPredictError(null);
    }
  };

  const handleTrain = async () => {
    if (classes.length < 2) { setError('Select at least 2 classes.'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const fd = new FormData();
      fd.append('model_type', modelType);
      fd.append('classes', classes.join(','));
      fd.append('samples_per_class', String(samples));
      const res = await trainClassical(fd);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || 'Request failed');
    }
    setLoading(false);
  };

  const handlePredict = async () => {
    setPredictLoading(true); setPredictError(null); setPredictResult(null);
    try {
      const fd = new FormData();
      if (predictFile) {
        fd.append('image', predictFile);
      } else {
        // If sample, we need to fetch it as a blob first
        const response = await fetch(SAMPLE_IMG);
        const blob = await response.blob();
        fd.append('image', blob, 'sample.svg');
      }
      const res = await predictImage(fd);
      setPredictResult(res);
    } catch (e: any) {
      setPredictError(e?.response?.data?.detail || e.message || 'Prediction failed');
    }
    setPredictLoading(false);
  };

  const availableClasses = ['AnnualCrop', 'Forest', 'HerbaceousVegetation', 'Highway', 'Industrial', 'Pasture', 'PermanentCrop', 'Residential', 'River', 'SeaLake'];

  return (
    <div className="flex h-full min-h-0">
      {/* Config panel */}
      <div className="w-72 bg-surface border-r border-border p-4 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Training Config</h3>
        </div>

        <label className="text-xs text-textMuted mb-1.5">Algorithm</label>
        <select value={modelType} onChange={e => setModelType(e.target.value)} className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary">
          <option value="RBF-SVM">SVM (RBF Kernel)</option>
          <option value="Random Forest">Random Forest</option>
        </select>

        <label className="text-xs text-textMuted mb-1.5">Samples per class</label>
        <input type="number" min={10} max={500} value={samples} onChange={e => setSamples(Number(e.target.value))} className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary" />

        <label className="text-xs text-textMuted mb-1.5">Target classes</label>
        <div className="bg-background border border-border rounded p-2 mb-4 space-y-1 max-h-48 overflow-y-auto">
          {availableClasses.map(cls => (
            <label key={cls} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
              <input type="checkbox" checked={classes.includes(cls)} onChange={() => toggleClass(cls)} className="accent-primary" />
              <span className={classes.includes(cls) ? 'text-textMain' : 'text-textMuted'}>{cls}</span>
            </label>
          ))}
        </div>

        <button onClick={handleTrain} disabled={loading} className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 mt-auto">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Training…' : 'Train New Model'}
        </button>
      </div>

      {/* Main panel */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
        
        {/* Prediction Section */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Crosshair className="w-4 h-4 text-accentCyan" /> Single Image Prediction</h2>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="w-32 h-32 bg-black rounded border border-border overflow-hidden shrink-0 relative group flex items-center justify-center">
              <img src={predictUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              <div onClick={() => fileRef.current?.click()} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs text-white gap-1 font-medium">
                <Upload className="w-3 h-3" /> Upload
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            
            <div className="flex-1 flex flex-col items-start">
              <p className="text-xs text-textMuted mb-4 leading-relaxed">
                Upload a single satellite image (or use the default sample) to predict its land-cover class using the currently active model. 
                If no model is active, the backend will attempt to auto-train a lightweight SVM on EuroSAT.
              </p>
              
              <div className="flex items-center gap-3">
                <button onClick={handlePredict} disabled={predictLoading} className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent border border-accent/30 rounded text-sm font-medium hover:bg-accent/30 transition-colors disabled:opacity-50">
                  {predictLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                  {predictLoading ? 'Analysing…' : 'Predict Class'}
                </button>
                {predictResult && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-surfaceHover border border-border rounded text-sm font-bold text-accentCyan">
                    Prediction: {predictResult.prediction}
                  </div>
                )}
              </div>
              
              {predictError && (
                <div className="mt-3 text-xs text-danger flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {predictError}</div>
              )}
            </div>
          </div>
        </div>

        {/* Training Results Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 mt-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Training Results</h2>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 rounded mb-4">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-danger">Classification Failed</div>
                <div className="text-xs text-textMuted mt-1">{error}</div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-40 text-textMuted border border-dashed border-border rounded">
              <p className="text-sm">Configure the model and run training to generate evaluation metrics.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-40 text-primary border border-border rounded bg-surfaceHover/50">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-xs">Extracting features and training model…</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-accent/10 border border-accent/30 rounded">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-accent">Model Trained Successfully</div>
                  <div className="text-[10px] text-textMuted font-mono mt-0.5">This model is now active for single-image predictions. (ID: {result.experiment_id})</div>
                </div>
              </div>

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandCover;
