import { useState } from 'react';
import { Map, Droplets, GitCompareArrows } from 'lucide-react';
import LandCover from './LandCover';
import ChangeDetection from './ChangeDetection';

const EarthAnalysis = () => {
  const [activeTab, setActiveTab] = useState<'land' | 'ocean' | 'change'>('land');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Unified Header */}
      <div className="bg-surface border-b border-border shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-textMain tracking-tight">Earth Analysis</h2>
            <p className="text-sm text-textMuted mt-1">Unified analytics pipeline for Earth-observation data.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('land')}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors font-medium text-sm ${
              activeTab === 'land' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'
            }`}
          >
            <Map className="w-4 h-4" />
            LAND ANALYSIS
          </button>
          
          <button
            onClick={() => setActiveTab('ocean')}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors font-medium text-sm ${
              activeTab === 'ocean' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'
            }`}
          >
            <Droplets className="w-4 h-4" />
            OCEAN & WATER
          </button>

          <button
            onClick={() => setActiveTab('change')}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors font-medium text-sm ${
              activeTab === 'change' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'
            }`}
          >
            <GitCompareArrows className="w-4 h-4" />
            CHANGE DETECTION
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'land' && (
          <div className="absolute inset-0 overflow-y-auto">
            <LandCover />
          </div>
        )}
        
        {activeTab === 'ocean' && (
          <div className="absolute inset-0 overflow-y-auto p-6">
            <div className="flex flex-col items-center justify-center h-64 bg-surface border border-border border-dashed rounded-lg text-center p-6">
              <Droplets className="w-12 h-12 text-textMuted mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-textMain mb-2">Ocean & Water Analysis</h3>
              <p className="text-sm text-textMuted max-w-md">
                Water-body extent and coastal shoreline change models are currently under development. Please check back in a future update.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'change' && (
          <div className="absolute inset-0 overflow-hidden">
            {/* ChangeDetection already handles its own scroll container */}
            <ChangeDetection />
          </div>
        )}
      </div>
    </div>
  );
};

export default EarthAnalysis;
