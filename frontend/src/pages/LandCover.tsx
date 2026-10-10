import { useState, useEffect, useRef } from 'react';
import { trainClassical, trainQuantum, predictImage, getSystemStatus } from '../services/api';
import { Play, Loader2, AlertCircle, Settings2, BarChart2, Upload, Crosshair, ChevronLeft, Map, AlertTriangle } from 'lucide-react';
import { useCapture } from '../context/CaptureContext';

const SAMPLE_IMG = import.meta.env.BASE_URL + 'sample.svg';

const LandCover = () => {
  const [modelType, setModelType] = useState('RBF-SVM');
  const [samples, setSamples] = useState(50);
  const [classes, setClasses] = useState(['AnnualCrop', 'Forest', 'Residential', 'River']);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    getSystemStatus().then(setSystemStatus).catch(console.error);
  }, []);
  
  // Prediction state
  const { captures, sharedRegion } = useCapture();
  const [predictFile, setPredictFile] = useState<File | null>(null);
  
  // Use the latest capture if available, otherwise fallback to sample
  const initialImg = captures.length > 0 ? captures[captures.length - 1].imageBase64 : SAMPLE_IMG;
  const [predictUrl, setPredictUrl] = useState<string>(initialImg);
  
  const [predictResult, setPredictResult] = useState<any>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleClass = (cls: string) => {
    setClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPredictFile(file);
      setPredictUrl(URL.createObjectURL(file));
      setPredictResult(null);
      setPredictError(null);
      
      // Auto-analyze upon upload
      setPredictLoading(true);
      try {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('classes', classes.join(','));
        if (result?.model_type?.includes('Quantum')) {
          fd.append('use_quantum', 'true');
        }
        const res = await predictImage(fd);
        setPredictResult(res);
      } catch (err: any) {
        setPredictError(err?.response?.data?.detail || err.message || 'Prediction failed');
      }
      setPredictLoading(false);
    }
  };

  const handleTrain = async () => {
    if (classes.length < 2) { setError('Select at least 2 classes.'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const fd = new FormData();
      fd.append('classes', classes.join(','));
      
      let actualModelType = modelType;
      // Auto logic: use Quantum if samples are small, else Classical
      if (modelType === 'Auto') {
        actualModelType = samples <= 30 ? 'Quantum' : 'RBF-SVM';
      }

      let res;
      if (actualModelType === 'Quantum') {
        fd.append('samples_per_class', String(Math.min(samples, 30)));
        fd.append('qubits', '4');
        fd.append('reps', '1');
        fd.append('entanglement', 'linear');
        res = await trainQuantum(fd);
      } else {
        fd.append('model_type', actualModelType);
        fd.append('samples_per_class', String(samples));
        res = await trainClassical(fd);
      }
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
      } else if (predictUrl !== SAMPLE_IMG && predictUrl.startsWith('data:image')) {
        const arr = predictUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){ u8arr[n] = bstr.charCodeAt(n); }
        const file = new File([u8arr], 'capture.jpg', {type:mime});
        fd.append('image', file);
      } else {
        const response = await fetch(SAMPLE_IMG);
        const blob = await response.blob();
        fd.append('image', blob, 'sample.svg');
      }
      
      if (result?.model_type?.includes('Quantum')) {
        fd.append('use_quantum', 'true');
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
    <div className="flex h-full min-h-0 relative">
      {/* Config panel toggle */}
      <div className={`absolute top-4 z-10 transition-all duration-300 ${configOpen ? 'left-72' : 'left-4'}`}>
        <button 
          onClick={() => setConfigOpen(!configOpen)} 
          className="flex items-center justify-center w-8 h-8 bg-surface border border-border rounded-full shadow-lg text-textMuted hover:text-textMain hover:border-primary/50 transition-colors"
          title={configOpen ? "Close Model Settings" : "Open Model Settings"}
        >
          {configOpen ? <ChevronLeft className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Config panel */}
      <div className={`bg-surface border-r border-border flex flex-col shrink-0 overflow-y-auto transition-all duration-300 ${configOpen ? 'w-72 p-4' : 'w-0 p-0 overflow-hidden border-none'}`}>
        <div className={`flex items-center gap-2 mb-5 pb-3 border-b border-border ${configOpen ? 'opacity-100' : 'opacity-0'}`}>
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Training Config</h3>
        </div>

        <div className="mb-4 p-2.5 bg-background border border-border rounded">
          <h4 className="text-[10px] font-semibold text-textMuted mb-2 uppercase tracking-wider">Dataset Status</h4>
          {systemStatus ? (
            <div className="text-xs flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${systemStatus.datasets?.eurosat?.available ? 'bg-accent' : 'bg-warning'}`} />
              <span className={systemStatus.datasets?.eurosat?.available ? 'text-accent font-medium' : 'text-warning font-medium'}>
                {systemStatus.datasets?.eurosat?.available ? 'Ready' : 'Not Ready'}
              </span>
              <span className="text-textMuted truncate">{systemStatus.datasets?.eurosat?.message}</span>
            </div>
          ) : (
            <div className="text-xs text-textMuted flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" /> <span className="truncate">Checking (may download)...</span>
            </div>
          )}
        </div>

        <label className="text-xs text-textMuted mb-1.5">Algorithm</label>
        <select value={modelType} onChange={e => setModelType(e.target.value)} className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary">
          <option value="RBF-SVM">SVM (RBF Kernel)</option>
          <option value="Random Forest">Random Forest</option>
          <option value="Quantum">Quantum SVM (Qiskit)</option>
          <option value="Auto">Auto-Decide (Hybrid)</option>
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

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto bg-black relative flex flex-col">
        {/* Prediction UI Overlay */}
        <div className="absolute inset-0 flex flex-col">
          <div className="p-4 bg-surface/90 backdrop-blur border-b border-border flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg font-semibold text-textMain flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Land-Cover Classification
              </h2>
              <p className="text-xs text-textMuted mt-1 max-w-xl">
                Upload a satellite patch to predict its land-cover class using the active model. 
                If no model is active, the backend will auto-train a lightweight SVM on EuroSAT.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-surfaceHover text-textMain border border-border rounded text-sm hover:bg-border transition-colors">
                <Upload className="w-4 h-4" /> Upload Image
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

              <button onClick={handlePredict} disabled={predictLoading} className="flex items-center gap-2 px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50">
                {predictLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                {predictLoading ? 'Analysing…' : 'Classify Imagery'}
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-8">
            <img 
              src={predictUrl} 
              alt="Preview" 
              className="max-w-[70%] max-h-[70%] object-contain shadow-2xl ring-1 ring-border rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            
            {predictError && (
              <div className="absolute bottom-10 bg-danger/10 border border-danger p-6 rounded-xl shadow-2xl max-w-md animate-in slide-in-from-bottom-4 z-[3000]">
                <div className="text-xs text-danger uppercase tracking-widest mb-1 font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Prediction Error</div>
                <div className="text-sm text-textMain">{predictError}</div>
              </div>
            )}
            
            {predictResult && (
              <div className="absolute bottom-10 bg-surface/95 backdrop-blur border border-accentCyan/30 p-6 rounded-xl shadow-2xl max-w-md animate-in slide-in-from-bottom-4">
                <div className="text-xs text-textMuted uppercase tracking-widest mb-1 font-semibold">Classification Result</div>
                <div className="text-3xl font-bold text-accentCyan mb-2">{predictResult.prediction}</div>
                <div className="text-sm text-textMain">{predictResult.message}</div>
                
                {predictResult.probabilities && (
                  <div className="w-full mt-4 bg-background border border-border rounded p-3">
                    <h4 className="text-[9px] font-semibold text-textMuted uppercase tracking-widest mb-2">Class Probabilities</h4>
                    <div className="space-y-1.5">
                      {Object.entries(predictResult.probabilities).map(([cls, prob]: [string, any]) => (
                        <div key={cls} className="flex items-center gap-2">
                          <div className="w-20 text-[9px] font-medium text-textMain truncate">{cls}</div>
                          <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                            <div className="h-full bg-accentCyan transition-all duration-1000" style={{ width: `${prob * 100}%` }}></div>
                          </div>
                          <div className="w-8 text-right text-[9px] font-mono text-accentCyan">{(prob * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-2">
                  {predictResult.extracted_features && (
                    <div className="flex-1 bg-background border border-border rounded p-3">
                      <h4 className="text-[9px] font-semibold text-textMuted uppercase tracking-widest mb-2">Image Features</h4>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div><span className="text-danger">R:</span> {predictResult.extracted_features[0].toFixed(1)}</div>
                        <div><span className="text-success">G:</span> {predictResult.extracted_features[1].toFixed(1)}</div>
                        <div><span className="text-primary">B:</span> {predictResult.extracted_features[2].toFixed(1)}</div>
                        <div><span className="text-textMuted">GLI:</span> {predictResult.extracted_features[3].toFixed(3)}</div>
                      </div>
                    </div>
                  )}
                  
                  {predictUrl !== SAMPLE_IMG && sharedRegion && (
                    <div className="flex-1 bg-background border border-border rounded p-3">
                      <h4 className="text-[9px] font-semibold text-textMuted uppercase tracking-widest mb-2">Copernicus Metadata</h4>
                      <div className="text-[9px] font-mono text-textMuted space-y-1">
                        <div className="truncate" title={sharedRegion.bbox}>BBOX: {sharedRegion.bbox.substring(0, 15)}...</div>
                        <div>Date: {sharedRegion.dateStart} to {sharedRegion.dateEnd}</div>
                        <div>Cloud Cover: &lt;{sharedRegion.cloudCover}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {predictError && (
              <div className="absolute bottom-10 bg-surface/95 backdrop-blur border border-danger/50 p-4 rounded-lg shadow-2xl text-danger flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {predictError}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Training Results Overlay */}
        {result && (
          <div className="absolute top-20 right-4 w-96 max-h-[80vh] overflow-y-auto bg-surface/95 backdrop-blur border border-border p-4 rounded-lg shadow-2xl z-20">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> Training Results
              </h2>
              <button onClick={() => setResult(null)} className="text-textMuted hover:text-textMain text-xs">Close</button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-background border border-border rounded p-3">
                <div className="text-xs text-textMuted mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-accentCyan">{(result.metrics.accuracy * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-background border border-border rounded p-3">
                <div className="text-xs text-textMuted mb-1">Macro F1</div>
                <div className="text-2xl font-bold text-primary">{(result.metrics.macro_f1 * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-20 right-4 w-96 bg-danger/10 border border-danger/30 rounded p-4 z-20 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-danger">Classification Failed</div>
                <div className="text-xs text-textMuted mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default LandCover;
