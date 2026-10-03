import { useState } from 'react';
import { X, Send, Bot, Database } from 'lucide-react';

const TerraCopilot = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'I am Terra Copilot. I can answer questions grounded in the loaded datasets, analysis results, and validated Qiskit quantum experiments.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!query.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, content: query }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    // Mock retrieval for now
    setTimeout(() => {
      setMessages([...newMessages, { 
        role: 'ai', 
        content: "I cannot verify that from the datasets or analysis results currently available. Load the relevant dataset or run the required analysis first." 
      }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 border-b border-surfaceHover flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <Bot className="w-5 h-5 text-primary mr-2" />
          <h3 className="font-semibold text-textMain">Terra Copilot</h3>
        </div>
        <button onClick={onClose} className="text-textMuted hover:text-textMain"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`text-sm p-3 rounded-lg max-w-[90%] ${msg.role === 'user' ? 'bg-primary/20 text-textMain border border-primary/30' : 'bg-background border border-surfaceHover text-textMuted'}`}>
              {msg.content}
            </div>
            {msg.role === 'ai' && i > 0 && (
              <div className="flex items-center text-[10px] text-accentCyan mt-1 ml-1 opacity-70">
                <Database className="w-3 h-3 mr-1" />
                No grounded context found
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-textMuted flex items-center italic">
            <Bot className="w-3 h-3 mr-2 animate-pulse" />
            Searching dataset contexts...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-surfaceHover shrink-0 bg-background/50">
        <div className="flex flex-wrap gap-2 mb-3">
          <span onClick={() => setQuery("What land-cover class was detected?")} className="text-[10px] bg-surfaceHover px-2 py-1 rounded cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-textMuted">What was detected?</span>
          <span onClick={() => setQuery("Explain the quantum kernel used.")} className="text-[10px] bg-surfaceHover px-2 py-1 rounded cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-textMuted">Explain quantum kernel</span>
        </div>
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Terra Copilot..." 
            className="w-full bg-surface border border-surfaceHover rounded-md pl-3 pr-10 py-2 text-sm text-textMain focus:outline-none focus:border-primary placeholder:text-surfaceHover"
          />
          <button 
            onClick={handleSend}
            disabled={!query.trim() || loading}
            className="absolute right-2 top-2 text-primary hover:text-blue-400 disabled:opacity-30 disabled:hover:text-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerraCopilot;
