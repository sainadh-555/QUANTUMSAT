import { useEffect, useState } from 'react';
import { getSystemStatus } from '../services/api';
import { Layers, Info, AlertTriangle, Upload, MapPin, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const SAMPLE_IMG = import.meta.env.BASE_URL + 'sample.svg';

const EarthExplorer = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the sample SVG as the default loaded image
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_IMG);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    getSystemStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const eurosat = status?.datasets?.eurosat;
  const isSample = selectedImage === 'sample.svg';

  return (
    <div className="flex flex-col h-full">
      {/* Context bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border text-xs shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-textMuted">Layer:</span>
            <span className="text-textMain">RGB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-textMuted">Source:</span>
            <span className="text-textMain">{imageFile ? imageFile.name : (isSample ? 'sample.svg (Default)' : 'No image loaded')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Image
            <input type="file" accept="image/jpeg, image/png" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main canvas */}
        <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
          
          {!eurosat?.available && !loading && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-surface/90 backdrop-blur border border-warning/50 rounded shadow-lg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <div className="text-xs">
                <span className="font-semibold text-warning block">No Dataset Installed</span>
                <span className="text-textMuted">EuroSAT is not loaded on the backend.</span>
              </div>
            </div>
          )}

          <TransformWrapper initialScale={1} minScale={0.1} maxScale={10} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-1 bg-surface/80 backdrop-blur p-1 rounded border border-border shadow-lg">
                  <button onClick={() => zoomIn()} className="p-2 hover:bg-background rounded text-textMain" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => zoomOut()} className="p-2 hover:bg-background rounded text-textMain" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={() => resetTransform()} className="p-2 hover:bg-background rounded text-textMain" title="Reset View"><Maximize className="w-4 h-4" /></button>
                </div>
                
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Satellite imagery"
                    className="max-w-[80%] max-h-[80%] object-contain shadow-2xl ring-1 ring-border"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Right metadata panel */}
        <div className="w-64 bg-surface border-l border-border p-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-semibold text-textMain mb-4 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accentCyan" />
            Image Metadata
          </h3>

          <div className="space-y-4 text-xs">
            {/* Uploaded or Sample Image Info */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Current Source</h4>
              <div className="bg-background rounded p-2.5 border border-border">
                <div className="text-textMuted mb-0.5">Filename</div>
                <div className="text-textMain truncate">{imageFile ? imageFile.name : 'sample.svg'}</div>
                
                <div className="text-textMuted mt-2 mb-0.5">Format</div>
                <div className="text-textMain uppercase">{imageFile ? imageFile.type.split('/')[1] : 'SVG Vector'}</div>
                
                {imageFile && (
                  <>
                    <div className="text-textMuted mt-2 mb-0.5">File Size</div>
                    <div className="text-textMain">{(imageFile.size / 1024).toFixed(1)} KB</div>
                  </>
                )}
              </div>
            </div>

            {/* Backend Dataset Info */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Backend Dataset</h4>
              <div className="bg-background rounded p-2.5 border border-border">
                <div className="text-textMuted mb-0.5">Dataset Status</div>
                <div className={eurosat?.available ? 'text-accent' : 'text-warning'}>
                  {eurosat?.available ? 'Loaded (EuroSAT)' : 'Not Installed'}
                </div>

                <div className="text-textMuted mt-2 mb-0.5">Known Resolution</div>
                <div className="text-textMain">{eurosat?.available ? '10 m/px (Sentinel-2)' : 'Unknown'}</div>

                <div className="text-textMuted mt-2 mb-0.5">Patch Size</div>
                <div className="text-textMain">{eurosat?.available ? '64 × 64 px' : 'Unknown'}</div>

                <div className="text-textMuted mt-2 mb-0.5">Available Classes</div>
                <div className="text-textMain">{eurosat?.available ? eurosat.classes.length : '0'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthExplorer;
