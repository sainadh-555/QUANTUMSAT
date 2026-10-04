import { useState, useRef } from 'react';
import { compareImages } from '../services/api';
import { Upload, Loader2, AlertCircle, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

const ChangeDetection = () => {
  const [img1, setImg1] = useState<{ file: File; url: string } | null>(null);
  const [img2, setImg2] = useState<{ file: File; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [method, setMethod] = useState<'statistical' | 'quantum'>('statistical');
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: any) => void) => {
    const file = e.target.files?.[0];
    if (file) setter({ file, url: URL.createObjectURL(file) });
  };

  const handleCompare = async () => {
    if (!img1 || !img2) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('image1', img1.file);
      fd.append('image2', img2.file);
      fd.append('method', method);
      const res = await compareImages(fd);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || 'Comparison failed');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
        <ArrowRightLeft className="w-5 h-5 text-accentCyan" />
        Satellite Change Detection
      </h2>

      {/* Upload area */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* T1 */}
        <div
          onClick={() => ref1.current?.click()}
          className="bg-surface border border-border rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors min-h-[180px] relative overflow-hidden"
        >
          {img1 ? (
            <img src={img1.url} alt="Time 1" className="max-h-40 object-contain" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-textMuted mb-2" />
              <div className="text-sm font-medium text-textMain">Time 1 — Reference</div>
              <div className="text-xs text-textMuted mt-1">Click to upload earlier image</div>
            </>
          )}
          <input ref={ref1} type="file" accept="image/*" onChange={e => handleFile(e, setImg1)} className="hidden" />
        </div>

        {/* T2 */}
        <div
          onClick={() => ref2.current?.click()}
          className="bg-surface border border-border rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors min-h-[180px] relative overflow-hidden"
        >
          {img2 ? (
            <img src={img2.url} alt="Time 2" className="max-h-40 object-contain" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-textMuted mb-2" />
              <div className="text-sm font-medium text-textMain">Time 2 — Analysis</div>
              <div className="text-xs text-textMuted mt-1">Click to upload later image</div>
            </>
          )}
          <input ref={ref2} type="file" accept="image/*" onChange={e => handleFile(e, setImg2)} className="hidden" />
        </div>
      </div>

      {/* Method Selection */}
      <div className="mb-5 bg-surface border border-border rounded p-4">
        <h3 className="text-xs font-semibold text-textMuted mb-3 uppercase tracking-wider">Analysis Method</h3>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input 
              type="radio" 
              name="method" 
              value="statistical" 
              checked={method === 'statistical'} 
              onChange={() => setMethod('statistical')}
              className="accent-primary" 
            />
            <span className={method === 'statistical' ? 'text-textMain font-medium' : 'text-textMuted'}>Statistical Baseline</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input 
              type="radio" 
              name="method" 
              value="quantum" 
              checked={method === 'quantum'} 
              onChange={() => setMethod('quantum')}
              className="accent-primary" 
            />
            <span className={method === 'quantum' ? 'text-textMain font-medium' : 'text-textMuted'}>Quantum Kernel (Pseudo-labeling)</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!img1 || !img2 || loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors mb-5"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
        {loading ? 'Analysing Difference…' : 'Generate Change Mask'}
      </button>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 rounded mb-4">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-danger">Comparison Failed</div>
            <div className="text-xs text-textMuted mt-1">{error}</div>
            <button onClick={handleCompare} className="text-xs text-primary mt-2 hover:underline">Retry</button>
          </div>
        </div>
      )}

      {result && img1 && img2 && (
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="text-sm text-accent font-medium">Change Detection Complete</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Slider Comparison */}
            <div className="bg-surface border border-border rounded p-4">
              <h4 className="text-xs font-semibold text-textMuted mb-3 flex justify-between">
                <span>Before</span>
                <span>After</span>
              </h4>
              <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden border border-border rounded select-none group">
                <img src={img1.url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Before" />
                <img 
                  src={img2.url} 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                  alt="After" 
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} 
                />
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-accentCyan flex items-center justify-center pointer-events-none" 
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-4 h-4 bg-accentCyan rounded-full shadow flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-background rotate-90" />
                    <div className="w-2 h-0.5 bg-background absolute" />
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={sliderPos} 
                  onChange={e => setSliderPos(Number(e.target.value))} 
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10" 
                />
              </div>
            </div>

            {/* Difference Mask */}
            <div className="bg-surface border border-border rounded p-4 text-center">
              <h4 className="text-xs font-semibold text-textMuted mb-3">Detected Change Mask</h4>
              <div className="relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center bg-black rounded overflow-hidden">
                <img
                  src={`data:image/png;base64,${result.change_map_b64}`}
                  alt="Change mask"
                  className="max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background border border-border rounded p-3 text-center">
              <div className="text-lg font-bold text-textMain">{result.statistics.change_percentage}%</div>
              <div className="text-[10px] text-textMuted uppercase tracking-wider">Changed Area</div>
            </div>
            <div className="bg-background border border-border rounded p-3 text-center">
              <div className="text-lg font-bold text-textMain">{result.statistics.changed_patches}</div>
              <div className="text-[10px] text-textMuted uppercase tracking-wider">Changed Patches</div>
            </div>
            <div className="bg-background border border-border rounded p-3 text-center">
              <div className="text-lg font-bold text-textMain">{result.statistics.total_patches}</div>
              <div className="text-[10px] text-textMuted uppercase tracking-wider">Total Patches</div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{result.warning}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeDetection;
