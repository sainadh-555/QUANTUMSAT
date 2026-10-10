import React, { useState, useRef } from 'react';
import { Droplets, Building2, Trees, Leaf, Map as MapIcon, ArrowRight, UploadCloud, Loader2, AlertTriangle } from 'lucide-react';
import { compareImages } from '../services/api';

const apps = [
  { id: 'flood', module: 'MODULE #1', badge: 'Disaster Watch', title: 'Flood Impact Intelligence', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'urban', module: 'MODULE #2', badge: 'High Impact', title: 'Urban Encroachment', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'agriculture', module: 'MODULE #3', badge: 'Agri-Tech', title: 'Crop Stress & Drought', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'water', module: 'MODULE #4', badge: 'Eco Watch', title: 'Water Body & Reservoir', icon: MapIcon, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { id: 'forest', module: 'MODULE #5', badge: 'Conservation', title: 'Forest Loss & Reserve', icon: Trees, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'coastal', module: 'MODULE #6', badge: 'Coastal Watch', title: 'Coastal Erosion Predictor', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-50' },
  { id: 'heat', module: 'MODULE #7', badge: 'Civic Impact', title: 'Urban Heat Island', icon: Building2, color: 'text-orange-500', bg: 'bg-orange-50' },
];

const Applications = () => {
  const [activeApp, setActiveApp] = useState(apps[0]);
  
  // Image Upload State
  const [t1File, setT1File] = useState<File | null>(null);
  const [t1Url, setT1Url] = useState<string | null>(null);
  const [t2File, setT2File] = useState<File | null>(null);
  
  const [method, setMethod] = useState<'auto' | 'statistical' | 'quantum'>('auto');
  const [t2Url, setT2Url] = useState<string | null>(null);
  
  const t1Ref = useRef<HTMLInputElement>(null);
  const t2Ref = useRef<HTMLInputElement>(null);

  // Analysis State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleT1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setT1File(e.target.files[0]);
      setT1Url(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleT2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setT2File(e.target.files[0]);
      setT2Url(URL.createObjectURL(e.target.files[0]));
    }
  };

  const runAnalysis = async () => {
    if (!t1File || !t2File) {
      setError("Please upload both T1 and T2 satellite scenes.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const fd = new FormData();
      fd.append('image1', t1File);
      fd.append('image2', t2File);
      fd.append('method', method);
      if (method === 'quantum' || method === 'auto') {
        fd.append('use_quantum', 'true');
      }
      
      const res = await compareImages(fd);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Analysis failed.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto">
        
        {/* Modules Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {apps.map(app => (
            <div 
              key={app.id} 
              onClick={() => setActiveApp(app)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${activeApp.id === app.id ? 'border-primary shadow-md bg-surfaceHover' : 'border-border bg-surface hover:border-primary/50'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-textMuted">{app.module}</span>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${app.bg} ${app.color}`}>{app.badge}</span>
              </div>
              <div className="flex items-center gap-3">
                <app.icon className={`w-5 h-5 ${app.color}`} />
                <h3 className="font-semibold text-textMain text-sm leading-tight">{app.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Active Module Panel */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-border flex justify-between items-center bg-surfaceHover">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">{activeApp.module} - {activeApp.badge}</span>
              <h2 className="text-xl font-bold text-textMain">Earth Intelligence Module</h2>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value as any)}
                className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-textMain focus:outline-none focus:border-primary"
              >
                <option value="auto">Auto Mode (Recommended)</option>
                <option value="quantum">Quantum Mode (ZZFeatureMap)</option>
                <option value="statistical">Classical AI Mode</option>
              </select>
              <button 
                onClick={runAnalysis}
                disabled={loading || !t1File || !t2File}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Run Module Analysis'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col lg:flex-row gap-6">
            
            {/* T1 Scene */}
            <div className="flex-1 bg-background border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="text-xs font-semibold text-textMuted flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> REFERENCE SATELLITE SCENE (T1)
                </h3>
                <button onClick={() => t1Ref.current?.click()} className="text-xs text-primary hover:underline">Upload PNG/JPG</button>
                <input ref={t1Ref} type="file" accept="image/*" onChange={handleT1Upload} className="hidden" />
              </div>
              <div className="flex-1 min-h-[200px] flex items-center justify-center bg-[#0B0F19] relative group">
                {t1Url ? (
                  <img src={t1Url} alt="T1" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="text-xs text-textMuted">No Image Uploaded</div>
                )}
              </div>
            </div>

            {/* T2 Scene */}
            <div className="flex-1 bg-background border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="text-xs font-semibold text-textMuted flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> TARGET ANALYSIS SCENE (T2)
                </h3>
                <button onClick={() => t2Ref.current?.click()} className="text-xs text-primary hover:underline">Upload PNG/JPG</button>
                <input ref={t2Ref} type="file" accept="image/*" onChange={handleT2Upload} className="hidden" />
              </div>
              <div className="flex-1 min-h-[200px] flex items-center justify-center bg-[#0B0F19] relative group">
                {t2Url ? (
                  <img src={t2Url} alt="T2" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="text-xs text-textMuted">No Image Uploaded</div>
                )}
              </div>
            </div>

            {/* Parameters */}
            <div className="w-full lg:w-72 bg-background border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-textMuted mb-6 flex items-center gap-2">
                MODULE PARAMETERS
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2"><span className="text-textMain">Settlement Proximity:</span> <span className="text-textMuted">1.2 km</span></div>
                  <input type="range" className="w-full accent-primary" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2"><span className="text-textMain">Agri Density:</span> <span className="text-textMuted">45%</span></div>
                  <input type="range" className="w-full accent-primary" defaultValue={45} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2"><span className="text-textMain">Critical Infrastructure:</span> <span className="text-textMuted">8 assets</span></div>
                  <input type="range" className="w-full accent-primary" defaultValue={20} />
                </div>
              </div>
              
              <div className="mt-8 text-[10px] text-textMuted italic border-t border-border pt-4">
                Quantum Kernel SVM (ZZFeatureMap)
              </div>
            </div>
          </div>
          
          {/* Results Area */}
          {(result || error) && (
            <div className="p-6 border-t border-border bg-background">
              {error ? (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Analysis Failed</div>
                    {error}
                  </div>
                </div>
              ) : (
                <div className="flex gap-6 items-start animate-in slide-in-from-bottom-4">
                  <div className="w-48 shrink-0">
                    <img src={`data:image/png;base64,${result.change_map_b64}`} alt="Difference" className="w-full rounded-lg shadow-lg border border-border" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-textMain mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accentCyan"></span> Analysis Complete
                    </h3>
                    <div className="text-xs text-textMuted mb-4 leading-relaxed">{result.warning}</div>
                    
                    <div className="flex gap-4">
                      <div className="bg-surface border border-border rounded-lg p-3 w-32">
                        <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Impact Area</div>
                        <div className="text-xl font-bold text-danger">{result.statistics.change_percentage.toFixed(1)}%</div>
                      </div>
                      <div className="bg-surface border border-border rounded-lg p-3 w-48">
                        <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Pipeline Engine</div>
                        <div className="text-[11px] font-bold text-primary truncate">
                          {result.statistics.method_used === 'quantum' ? 'Quantum SVM (ZZFeatureMap)' : 'Statistical Baseline'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Applications;
