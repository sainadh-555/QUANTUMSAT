import { useEffect, useState } from 'react';
import { getSystemStatus } from '../services/api';
import { Layers, Info, AlertTriangle, Upload, MapPin } from 'lucide-react';

const EarthExplorer = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  return (
    <div className="flex flex-col h-full">
      {/* Context bar */}
      <div className="flex items-center gap-6 px-4 py-2 bg-surface border-b border-border text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-textMuted">Layer:</span>
          <span className="text-textMain">RGB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-textMuted">Source:</span>
          <span className="text-textMain">{imageFile ? imageFile.name : 'No image loaded'}</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main canvas */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Satellite imagery"
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="text-center p-8 max-w-lg">
              {loading ? (
                <p className="text-textMuted text-sm">Checking system status…</p>
              ) : eurosat?.available ? (
                <>
                  <MapPin className="w-10 h-10 text-accent mx-auto mb-4 opacity-60" />
                  <h2 className="text-lg font-semibold mb-2">EuroSAT Dataset Available</h2>
                  <p className="text-sm text-textMuted mb-6">
                    {eurosat.classes?.length || 0} land-cover classes detected. Upload an image to start analysis,
                    or navigate to Land-Cover Analysis to train a classifier.
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 text-primary border border-primary/30 rounded text-sm cursor-pointer hover:bg-primary/25 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Satellite Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-4 opacity-60" />
                  <h2 className="text-lg font-semibold mb-2">No Dataset Installed</h2>
                  <p className="text-sm text-textMuted mb-3">
                    The EuroSAT dataset was not found. Download it from{' '}
                    <a href="https://github.com/phelber/eurosat" target="_blank" rel="noreferrer" className="text-primary underline">
                      github.com/phelber/eurosat
                    </a>{' '}
                    and place the extracted folders in <code className="text-xs bg-surfaceHover px-1 py-0.5 rounded">data/EuroSAT/2750/</code>.
                  </p>
                  <p className="text-sm text-textMuted mb-6">
                    You can still upload your own satellite images for analysis.
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 text-primary border border-primary/30 rounded text-sm cursor-pointer hover:bg-primary/25 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right metadata panel */}
        <div className="w-64 bg-surface border-l border-border p-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-semibold text-textMain mb-4 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accentCyan" />
            Image Metadata
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-background rounded p-2.5 border border-border">
              <div className="text-textMuted mb-0.5">Dataset</div>
              <div className="text-textMain">{eurosat?.available ? 'EuroSAT (Sentinel-2)' : 'Not loaded'}</div>
            </div>
            <div className="bg-background rounded p-2.5 border border-border">
              <div className="text-textMuted mb-0.5">Resolution</div>
              <div className="text-textMain">10 m/px (Sentinel-2)</div>
            </div>
            <div className="bg-background rounded p-2.5 border border-border">
              <div className="text-textMuted mb-0.5">Patch Size</div>
              <div className="text-textMain">64 × 64 px</div>
            </div>
            <div className="bg-background rounded p-2.5 border border-border">
              <div className="text-textMuted mb-0.5">Available Classes</div>
              <div className="text-textMain">{eurosat?.classes?.length || 0}</div>
            </div>
            {imageFile && (
              <div className="bg-background rounded p-2.5 border border-border">
                <div className="text-textMuted mb-0.5">Uploaded File</div>
                <div className="text-textMain truncate">{imageFile.name}</div>
                <div className="text-textMuted">{(imageFile.size / 1024).toFixed(1)} KB</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthExplorer;
