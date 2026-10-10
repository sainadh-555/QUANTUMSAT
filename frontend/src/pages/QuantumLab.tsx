import { useState, useRef } from 'react';
import { trainQuantum, predictImage } from '../services/api';
import { Atom, Play, Loader2, AlertCircle, CheckCircle2, AlertTriangle, Upload, Crosshair } from 'lucide-react';
import { useCapture } from '../context/CaptureContext';

const SAMPLE_IMG = import.meta.env.BASE_URL + 'sample.svg';

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

const QuantumLab = () => {
  const [qubits] = useState(4);
  const [reps, setReps] = useState(1);
  const [entanglement, setEntanglement] = useState('linear');
  const [samples, setSamples] = useState(15);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Prediction state
  const { captures } = useCapture();
  const initialImg = captures.length > 0 ? captures[captures.length - 1].imageBase64 : SAMPLE_IMG;
  const [predictFile, setPredictFile] = useState<File | null>(null);
  const [predictUrl, setPredictUrl] = useState<string>(initialImg);
  const [predictResult, setPredictResult] = useState<any>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPredictFile(file);
      setPredictUrl(URL.createObjectURL(file));
      setPredictResult(null);
      setPredictError(null);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('classes', 'AnnualCrop,Forest,Residential,River');
      fd.append('samples_per_class', String(samples));
      fd.append('qubits', String(qubits));
      fd.append('reps', String(reps));
      fd.append('entanglement', entanglement);
      const res = await trainQuantum(fd);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || 'Quantum experiment failed');
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
        const file = dataURLtoFile(predictUrl, 'capture.jpg');
        fd.append('image', file);
      } else {
        const response = await fetch(SAMPLE_IMG);
        const blob = await response.blob();
        fd.append('image', blob, 'sample.svg');
      }
      fd.append('use_quantum', 'true');
      const res = await predictImage(fd);
      setPredictResult(res);
    } catch (e: any) {
      setPredictError(e?.response?.data?.detail || e.message || 'Prediction failed');
    }
    setPredictLoading(false);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Config */}
      <div className="w-72 bg-surface border-r border-border p-4 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
          <Atom className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Circuit Configuration</h3>
        </div>

        <label className="text-xs text-textMuted mb-1.5">Feature Map</label>
        <select className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary">
          <option>ZZFeatureMap</option>
        </select>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-textMuted mb-1.5 block">Qubits</label>
            <input type="number" value={qubits} disabled className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMuted opacity-60" />
            <div className="text-[9px] text-textMuted mt-1">Fixed to feature count</div>
          </div>
          <div>
            <label className="text-xs text-textMuted mb-1.5 block">Repetitions</label>
            <input
              type="number"
              min={1}
              max={4}
              value={reps}
              onChange={e => setReps(Number(e.target.value))}
              className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <label className="text-xs text-textMuted mb-1.5">Entanglement</label>
        <select
          value={entanglement}
          onChange={e => setEntanglement(e.target.value)}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary"
        >
          <option value="linear">Linear</option>
          <option value="full">Full</option>
          <option value="circular">Circular</option>
        </select>

        <label className="text-xs text-textMuted mb-1.5">Samples per class</label>
        <input
          type="number"
          min={5}
          max={30}
          value={samples}
          onChange={e => setSamples(Number(e.target.value))}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-sm text-textMain mb-4 focus:outline-none focus:border-primary"
        />
        <div className="text-[9px] text-textMuted mb-4">Bounded to ≤30 for simulator feasibility.</div>

        <div className="p-3 bg-warning/10 border border-warning/20 rounded mb-4 text-xs text-warning flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Execution uses the local Aer Simulator. IBM Quantum hardware requires a configured token and explicit confirmation.</span>
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 mt-auto"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Executing…' : 'Run Quantum Experiment'}
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 relative">
        
        {/* Quota Panel */}
        <div className="flex items-center justify-between bg-surface/50 border border-border p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <div>
              <div className="text-xs font-semibold text-textMain tracking-wide">IBM QUANTUM SERVICE</div>
              <div className="text-[10px] text-textMuted font-mono">STATUS: UNAVAILABLE · USING LOCAL AER SIMULATOR</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-textMuted font-mono mb-0.5">QUOTA REMAINING</div>
            <div className="text-sm font-bold text-accentCyan font-mono">UNLIMITED (LOCAL)</div>
          </div>
        </div>

        {/* Prediction Section */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Crosshair className="w-4 h-4 text-accentCyan" /> Quantum Single Image Prediction</h2>
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
                Upload a single satellite image (or use the default sample) to predict its land-cover class using the currently active quantum model. 
                You must train a quantum model first before predicting.
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

        <div className="flex items-center gap-2 mb-4 mt-4 pt-4 border-t border-border">
          <Atom className="w-4 h-4 text-accentCyan" />
          <h2 className="text-sm font-semibold">Quantum Kernel Output</h2>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 rounded mb-4">
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-danger">Experiment Failed</div>
              <div className="text-xs text-textMuted mt-1">{error}</div>
              <button onClick={handleRun} className="text-xs text-primary mt-2 hover:underline">Retry</button>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="flex flex-col h-64 text-textMuted bg-surfaceHover/30 border border-border rounded-lg p-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-5">
              <Atom className="w-64 h-64" />
            </div>
            <h3 className="text-lg font-bold text-textMain mb-2 font-display tracking-wide">DHARA Quantum Mode</h3>
            <p className="text-sm max-w-lg leading-relaxed mb-4">
              You are now in the dedicated quantum-computing workspace. Here you can run supported Qiskit workflows like 
              quantum-kernel classification on Earth observation data.
            </p>
            <ul className="text-xs space-y-2 mb-6">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Classical feature extraction is performed first.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Compact features are converted to quantum circuits using ZZFeatureMap.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Execution runs on the local Aer Simulator (noiseless).</li>
            </ul>
            <p className="text-xs mt-auto font-mono text-accentCyan opacity-70">AWAITING_CIRCUIT_CONFIGURATION...</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-64 text-primary bg-surfaceHover/20 border border-border rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] opacity-20"></div>
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-medium tracking-wide">BUILDING QUANTUM KERNEL MATRIX...</p>
            <p className="text-[10px] text-textMuted mt-2 uppercase tracking-widest font-mono">Simulating {samples * 4} states · Est. Time 30-120s</p>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-accent">Quantum Experiment Complete</div>
                <div className="text-[10px] text-textMuted font-mono mt-1">ID: {result.experiment_id} · {result.runtime_seconds}s</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Accuracy', value: `${(result.metrics.accuracy * 100).toFixed(1)}%` },
                { label: 'Macro F1', value: `${(result.metrics.macro_f1 * 100).toFixed(1)}%` },
                { label: 'Circuit Depth', value: result.circuit?.depth || '-' },
                { label: 'Qubits', value: result.circuit?.width || '-' },
              ].map(m => (
                <div key={m.label} className="bg-background border border-border rounded p-3 text-center">
                  <div className="text-lg font-bold">{m.value}</div>
                  <div className="text-[10px] text-textMuted mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Visual Circuit representation */}
            <div className="bg-[#0B0F19] border border-border rounded p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-semibold text-accentCyan uppercase tracking-widest font-mono">Quantum Circuit Architecture</h4>
                <div className="text-[10px] text-textMuted font-mono">ZZFeatureMap · {result.circuit?.reps} Reps · {result.circuit?.entanglement} Entanglement</div>
              </div>
              
              <div className="flex flex-col gap-4 font-mono text-[10px] min-w-max">
                {Array.from({ length: result.circuit?.width || 4 }).map((_, q) => (
                  <div key={q} className="flex items-center">
                    <div className="text-textMuted w-12 text-right pr-4 font-bold text-accent">q_{q} |0⟩</div>
                    
                    <div className="h-px bg-border w-6"></div>
                    <div className="w-8 h-8 bg-surface border border-accent flex items-center justify-center text-accent font-bold rounded shadow-lg shadow-accent/20">H</div>
                    
                    {Array.from({ length: result.circuit?.reps || 1 }).map((_, r) => (
                      <div key={r} className="flex items-center">
                         <div className="h-px bg-border w-6"></div>
                         <div className="w-8 h-8 bg-primary/10 border border-primary text-primary flex items-center justify-center font-bold rounded">Rz</div>
                         
                         <div className="h-px bg-border w-6"></div>
                         {result.circuit?.entanglement === 'linear' ? (
                           <div className="w-8 h-8 bg-surface border border-accentCyan text-accentCyan flex items-center justify-center rounded-full font-bold shadow-lg shadow-accentCyan/10">
                             {q % 2 === 0 ? '•' : '⊕'}
                           </div>
                         ) : result.circuit?.entanglement === 'full' ? (
                           <div className="w-8 h-8 bg-surface border border-accentCyan text-accentCyan flex items-center justify-center rounded-full font-bold shadow-lg shadow-accentCyan/10">
                             ⊕
                           </div>
                         ) : (
                           <div className="w-8 h-8 bg-surface border border-border text-textMuted flex items-center justify-center rounded font-bold">I</div>
                         )}
                      </div>
                    ))}
                    
                    <div className="h-px bg-border w-6"></div>
                    <div className="w-8 h-8 bg-surface border border-border flex items-center justify-center rounded">
                      <Atom className="w-4 h-4 text-textMuted" />
                    </div>
                    <div className="h-px bg-border flex-1 min-w-[24px]"></div>
                  </div>
                ))}
              </div>
            </div>

            {result.metrics.confusion_matrix && (
              <div>
                <h4 className="text-xs font-semibold text-textMuted mb-2">Confusion Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="text-xs border-collapse">
                    <thead><tr><th className="p-1.5"></th>{['Crop', 'Forest', 'Resid.', 'River'].map(c => <th key={c} className="p-1.5 text-textMuted">{c}</th>)}</tr></thead>
                    <tbody>
                      {result.metrics.confusion_matrix.map((row: number[], i: number) => (
                        <tr key={i}>
                          <td className="p-1.5 text-textMuted font-medium">{['Crop', 'Forest', 'Resid.', 'River'][i]}</td>
                          {row.map((v: number, j: number) => (
                            <td key={j} className={`p-1.5 text-center border border-border ${i === j ? 'bg-accent/15 text-accent font-bold' : 'bg-background text-textMuted'}`}>{v}</td>
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

export default QuantumLab;
