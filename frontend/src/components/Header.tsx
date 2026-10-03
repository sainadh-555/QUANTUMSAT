const Header = () => {
  return (
    <header className="h-16 bg-surface border-b border-surfaceHover flex items-center justify-between px-6">
      <div className="text-sm text-textMuted font-medium">
        Quantum-Enhanced Earth Observation Analysis
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-xs">
          <span className="w-2 h-2 rounded-full bg-accentGreen mr-2"></span>
          Backend: Connected
        </div>
      </div>
    </header>
  );
};

export default Header;
