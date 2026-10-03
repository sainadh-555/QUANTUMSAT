import { Cpu, Terminal, ShieldAlert } from 'lucide-react';

const QuantumLab = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold tracking-wide">Quantum Analysis</h2>
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded border border-primary/20">
          Qiskit Aer Simulator
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left: Circuit Config */}
        <div className="col-span-1 bg-surface border border-surfaceHover rounded-lg p-5 flex flex-col overflow-y-auto">
          <div className="flex items-center mb-6 text-textMain border-b border-surfaceHover pb-3">
            <Cpu className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-semibold">Circuit Configuration</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-textMuted mb-2">Feature Map</label>
              <select className="w-full bg-background border border-surfaceHover rounded-md px-3 py-2 text-sm text-textMain focus:border-primary focus:outline-none">
                <option>ZZFeatureMap</option>
                <option>ZFeatureMap</option>
                <option>PauliFeatureMap</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-2">Qubits</label>
                <input type="number" defaultValue={4} disabled className="w-full bg-background border border-surfaceHover rounded-md px-3 py-2 text-sm text-textMuted opacity-70" />
                <p className="text-[10px] text-textMuted mt-1 mt-1">Locked to feature count</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-2">Repetitions</label>
                <input type="number" defaultValue={2} className="w-full bg-background border border-surfaceHover rounded-md px-3 py-2 text-sm text-textMain focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-textMuted mb-2">Entanglement</label>
              <select className="w-full bg-background border border-surfaceHover rounded-md px-3 py-2 text-sm text-textMain focus:border-primary focus:outline-none">
                <option>Linear</option>
                <option>Full</option>
                <option>Circular</option>
              </select>
            </div>

            <div className="p-3 bg-amber-900/10 border border-amber-500/20 rounded-md">
              <div className="flex items-start">
                <ShieldAlert className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-500/90 leading-relaxed">
                  Execution is bounded to the local Aer Simulator to prevent API token exhaustion. Explicit IBM Quantum hardware execution requires a configured token.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quantum Execution Output */}
        <div className="col-span-2 bg-surface border border-surfaceHover rounded-lg p-5 flex flex-col relative overflow-hidden">
          <div className="flex items-center mb-6 text-textMain border-b border-surfaceHover pb-3">
            <Terminal className="w-4 h-4 mr-2 text-accentCyan" />
            <h3 className="font-semibold">Kernel Execution Matrix</h3>
          </div>
          
          <div className="flex-1 bg-background border border-surfaceHover rounded-lg flex items-center justify-center font-mono text-xs text-textMuted">
            <div className="text-center">
              <p className="mb-2 opacity-50">No circuit loaded.</p>
              <p className="opacity-50">Select a dataset in Land-Cover Analysis to generate the quantum kernel.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumLab;
