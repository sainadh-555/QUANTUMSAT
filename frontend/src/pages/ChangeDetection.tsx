const ChangeDetection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Satellite-Image Change Detection</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-lg border border-surfaceHover shadow-sm text-center">
          <p className="text-textMuted text-sm mb-4">Earlier Image (T1)</p>
          <div className="h-32 bg-background border border-surfaceHover rounded flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <span className="text-xs text-primary">Click to upload</span>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-surfaceHover shadow-sm text-center">
          <p className="text-textMuted text-sm mb-4">Later Image (T2)</p>
          <div className="h-32 bg-background border border-surfaceHover rounded flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <span className="text-xs text-primary">Click to upload</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeDetection;
