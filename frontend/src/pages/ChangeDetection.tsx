import { useState } from 'react';
import { compareImages } from '../services/api';
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle, ArrowRightLeft, Camera, Calendar, Play, UploadCloud } from 'lucide-react';
import { useCapture } from '../context/CaptureContext';
import { Link } from 'react-router-dom';

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

const ChangeDetection = () => {
  const { captures } = useCapture();
  
  // Selection state
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [method, setMethod] = useState<'auto' | 'statistical' | 'quantum'>('auto');

  const handleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(prev => prev.filter(i => i !== index));
    } else {
      if (selectedIndices.length < 2) {
        setSelectedIndices(prev => [...prev, index].sort((a, b) => a - b));
      } else {
        // If 2 already selected, replace the second one
        setSelectedIndices([selectedIndices[0], index].sort((a, b) => a - b));
      }
    }
  };

  const handleCompare = async () => {
    if (selectedIndices.length !== 2) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const img1Data = captures[selectedIndices[0]].imageBase64;
      const img2Data = captures[selectedIndices[1]].imageBase64;
      
      const file1 = dataURLtoFile(img1Data, `image1_${captures[selectedIndices[0]].date}.jpg`);
      const file2 = dataURLtoFile(img2Data, `image2_${captures[selectedIndices[1]].date}.jpg`);

      const fd = new FormData();
      fd.append('image1', file1);
      fd.append('image2', file2);
      fd.append('method', method);
      const res = await compareImages(fd);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || 'Comparison failed');
    }
    setLoading(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newId = `capture_${Date.now()}`;
          // Generate a fake bounds for uploaded images
          addCapture({
            id: newId,
            date: file.name.replace('.jpg', '').replace('.png', '') || new Date().toISOString().split('T')[0],
            imageBase64: event.target.result as string,
            bounds: [80.4, 16.3, 80.5, 16.4]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const img1 = selectedIndices.length > 0 ? captures[selectedIndices[0]] : null;
  const img2 = selectedIndices.length > 1 ? captures[selectedIndices[1]] : null;

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-accentCyan" />
          Multi-Temporal Change Detection
        </h2>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-4 py-1.5 bg-surface border border-border rounded text-xs text-textMuted hover:text-textMain hover:border-primary/50 transition-colors flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload Custom Snapshot
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          {captures.length > 0 && (
            <div className="text-xs text-textMuted bg-surface border border-border px-3 py-1.5 rounded">
              {captures.length} Snapshots Available
            </div>
          )}
        </div>
      </div>

      {captures.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-surface border border-border border-dashed rounded-lg text-center p-6">
          <Camera className="w-12 h-12 text-textMuted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-textMain mb-2">No Snapshots Captured</h3>
          <p className="text-sm text-textMuted max-w-md mb-6">
            To perform change detection, you need to capture regions of interest from the Copernicus data. Go to the Earth Explorer, load a satellite image, and click "Take Photo".
          </p>
          <Link to="/" className="px-5 py-2.5 bg-primary text-white rounded font-medium text-sm hover:bg-primary/90 transition-colors">
            Go to Earth Explorer
          </Link>
        </div>
      ) : (
        <>
          {/* Timeline UI */}
          <div className="bg-surface border border-border rounded-lg p-5 mb-6">
            <h3 className="text-sm font-semibold text-textMain mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Chronological Snapshot Timeline
            </h3>
            <p className="text-xs text-textMuted mb-4">
              Select exactly <strong>two</strong> snapshots from your captures to analyze the differences over time.
            </p>
            
            <div className="flex gap-4 overflow-x-auto pb-4">
              {captures.map((capture, idx) => {
                const isSelected = selectedIndices.includes(idx);
                const isFirst = selectedIndices.indexOf(idx) === 0;
                
                return (
                  <div 
                    key={capture.id}
                    onClick={() => handleSelect(idx)}
                    className={`relative shrink-0 w-40 cursor-pointer rounded-lg border-2 transition-all ${
                      isSelected ? 'border-primary shadow-lg shadow-primary/20 scale-105 z-10' : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="h-28 w-full bg-black overflow-hidden rounded-t-md relative">
                      <img src={capture.imageBase64} alt={capture.date} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            {isFirst ? 'Time 1 (Reference)' : 'Time 2 (Analysis)'}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-background rounded-b-md text-center border-t border-border/50">
                      <div className="text-xs font-semibold text-textMain">{capture.date}</div>
                      <div className="text-[9px] text-textMuted truncate mt-0.5">
                        Bounds: {capture.bounds[0].toFixed(2)}, {capture.bounds[1].toFixed(2)}...
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analysis Section */}
          <div className="flex items-end justify-between mb-5 bg-surface border border-border rounded-lg p-5">
            <div>
              <h3 className="text-xs font-semibold text-textMuted mb-3 uppercase tracking-wider">Analysis Configuration</h3>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="method" 
                    value="auto" 
                    checked={method === 'auto'} 
                    onChange={() => setMethod('auto')}
                    className="accent-primary" 
                  />
                  <span className={method === 'auto' ? 'text-textMain font-medium' : 'text-textMuted'}>AUTO (Recommended)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="method" 
                    value="statistical" 
                    checked={method === 'statistical'} 
                    onChange={() => setMethod('statistical')}
                    className="accent-primary" 
                  />
                  <span className={method === 'statistical' ? 'text-textMain font-medium' : 'text-textMuted'}>AI Mode (Classical)</span>
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
                  <span className={method === 'quantum' ? 'text-textMain font-medium' : 'text-textMuted'}>Quantum Mode</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={selectedIndices.length !== 2 || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Analysing Difference…' : 'Analyze Changes'}
            </button>
          </div>

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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="text-sm text-accent font-medium">Change Detection Complete</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Slider Comparison */}
                <div className="bg-surface border border-border rounded p-4">
                  <h4 className="text-xs font-semibold text-textMuted mb-3 flex justify-between">
                    <span>{img1.date} (Before)</span>
                    <span>{img2.date} (After)</span>
                  </h4>
                  <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden border border-border rounded select-none group">
                    <img src={img1.imageBase64} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Before" />
                    <img 
                      src={img2.imageBase64} 
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
              <div className="grid grid-cols-4 gap-3">
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
                <div className="bg-background border border-border rounded p-3 text-center">
                  <div className="text-lg font-bold text-accentCyan uppercase">{result.statistics.method_used === 'statistical fallback' ? 'Classical' : result.statistics.method_used}</div>
                  <div className="text-[10px] text-textMuted uppercase tracking-wider">Pipeline Used</div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex gap-2 w-full mt-2">
                <div className="flex-1 bg-background border border-border rounded p-3">
                  <h4 className="text-[9px] font-semibold text-textMuted uppercase tracking-widest mb-2">Copernicus Metadata (Time 1)</h4>
                  <div className="text-[9px] font-mono text-textMuted space-y-1">
                    <div className="truncate" title={img1.bounds.join(',')}>BBOX: {img1.bounds[0].toFixed(2)}, {img1.bounds[1].toFixed(2)}, {img1.bounds[2].toFixed(2)}, {img1.bounds[3].toFixed(2)}</div>
                    <div>Date: {img1.date}</div>
                  </div>
                </div>
                <div className="flex-1 bg-background border border-border rounded p-3">
                  <h4 className="text-[9px] font-semibold text-textMuted uppercase tracking-widest mb-2">Copernicus Metadata (Time 2)</h4>
                  <div className="text-[9px] font-mono text-textMuted space-y-1">
                    <div className="truncate" title={img2.bounds.join(',')}>BBOX: {img2.bounds[0].toFixed(2)}, {img2.bounds[1].toFixed(2)}, {img2.bounds[2].toFixed(2)}, {img2.bounds[3].toFixed(2)}</div>
                    <div>Date: {img2.date}</div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{result.warning}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChangeDetection;
