import { useEffect, useState } from 'react';
import { getSystemStatus } from '../services/api';
import { Layers, MapPin, Calendar, HardDrive, Info } from 'lucide-react';

const EarthExplorer = () => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    getSystemStatus().then(setStatus).catch(console.error);
  }, []);

  const eurosatAvailable = status?.datasets?.eurosat?.available;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Context Bar */}
      <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-surfaceHover shrink-0">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <Layers className="w-4 h-4 mr-2 text-primary" />
            <span className="text-textMuted mr-2">Layer:</span>
            <span className="font-medium text-textMain">RGB (Sentinel-2)</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span className="text-textMuted mr-2">Region:</span>
            <span className="font-medium text-textMain">EuroSAT Default</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span className="text-textMuted mr-2">Acquisition:</span>
            <span className="font-medium text-textMain">Unknown (Dataset)</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* The Map / Image Canvas */}
        <div className="flex-1 bg-black rounded-lg border border-surfaceHover relative overflow-hidden flex items-center justify-center">
          {/* Simulated Satellite View */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          
          <div className="text-center relative z-10 p-6 bg-surface/50 backdrop-blur-sm rounded-lg border border-surfaceHover max-w-md">
            {!eurosatAvailable ? (
              <>
                <HardDrive className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-textMain mb-2">EuroSAT Dataset Missing</h2>
                <p className="text-sm text-textMuted mb-4">
                  The EuroSAT satellite dataset was not found in the local data directory. 
                  Please download it and place it in `data/EuroSAT/2750/` to explore images here.
                </p>
                <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  Upload Custom Image
                </button>
              </>
            ) : (
              <>
                <MapPin className="w-10 h-10 text-accentGreen mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-textMain mb-2">EuroSAT Dataset Active</h2>
                <p className="text-sm text-textMuted mb-4">
                  27,000 labeled patches are available. Select an image patch from the side panel or run a land-cover analysis on the default region.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="w-72 bg-surface rounded-lg border border-surfaceHover p-4 shrink-0 overflow-y-auto">
          <h3 className="font-semibold text-textMain mb-4 flex items-center">
            <Info className="w-4 h-4 mr-2 text-accentCyan" />
            Selection Metadata
          </h3>
          
          <div className="space-y-4">
            <div className="bg-background rounded p-3 border border-surfaceHover">
              <div className="text-xs text-textMuted mb-1">Dataset</div>
              <div className="text-sm font-medium text-textMain">EuroSAT (Sentinel-2)</div>
            </div>
            
            <div className="bg-background rounded p-3 border border-surfaceHover">
              <div className="text-xs text-textMuted mb-1">Spatial Resolution</div>
              <div className="text-sm font-medium text-textMain">10m per pixel</div>
            </div>

            <div className="bg-background rounded p-3 border border-surfaceHover">
              <div className="text-xs text-textMuted mb-1">Available Classes</div>
              <div className="text-sm font-medium text-textMain">
                {status?.datasets?.eurosat?.classes?.length || 0} recognized land-cover types
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthExplorer;
