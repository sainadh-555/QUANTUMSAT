import React from 'react';
import { FlaskConical } from 'lucide-react';

const QuantumLab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Quantum Laboratory</h2>
      <div className="bg-surface p-6 rounded-lg border border-surfaceHover shadow-sm">
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-surfaceHover rounded">
          <div className="text-center">
            <FlaskConical className="w-10 h-10 mx-auto text-secondary mb-3 opacity-50" />
            <p className="text-textMuted text-sm">Select a dataset in the Land-Cover Explorer to begin quantum kernel training.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumLab;
