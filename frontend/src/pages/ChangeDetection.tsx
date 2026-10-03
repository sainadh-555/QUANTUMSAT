import { Upload, SplitSquareHorizontal, Layers } from 'lucide-react';

const ChangeDetection = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold tracking-wide">Satellite Change Detection</h2>
      </div>
      
      <div className="flex-1 bg-surface border border-surfaceHover rounded-lg p-6 flex flex-col min-h-0 relative">
        <div className="grid grid-cols-2 gap-6 h-64 shrink-0">
          {/* T1 Image */}
          <div className="bg-background border border-surfaceHover border-dashed rounded-lg flex flex-col items-center justify-center relative hover:border-primary/50 transition-colors cursor-pointer group">
            <Upload className="w-8 h-8 text-textMuted group-hover:text-primary mb-3" />
            <h3 className="font-medium text-textMain mb-1">Time 1 (Reference)</h3>
            <p className="text-xs text-textMuted">Click to load pre-event imagery</p>
          </div>
          
          {/* T2 Image */}
          <div className="bg-background border border-surfaceHover border-dashed rounded-lg flex flex-col items-center justify-center relative hover:border-primary/50 transition-colors cursor-pointer group">
            <Upload className="w-8 h-8 text-textMuted group-hover:text-primary mb-3" />
            <h3 className="font-medium text-textMain mb-1">Time 2 (Analysis)</h3>
            <p className="text-xs text-textMuted">Click to load post-event imagery</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center shrink-0">
          <button className="flex items-center px-6 py-2.5 bg-surfaceHover text-textMuted rounded-md border border-surfaceHover cursor-not-allowed opacity-50">
            <SplitSquareHorizontal className="w-4 h-4 mr-2" />
            Generate Difference Mask
          </button>
        </div>

        <div className="mt-6 flex-1 bg-background border border-surfaceHover rounded-lg flex flex-col items-center justify-center text-textMuted relative overflow-hidden">
          <Layers className="w-12 h-12 mb-4 opacity-10" />
          <p className="text-sm">Change mask will appear here after analysis.</p>
        </div>
      </div>
    </div>
  );
};

export default ChangeDetection;
