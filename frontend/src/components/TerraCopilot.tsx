import { useState } from 'react';
import { askCopilot } from '../services/api';
import { X, Send, Bot, Loader2, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  source?: string;
  experiment_id?: string;
}

const SUGGESTIONS = [
  'What land-cover class was detected?',
  'Explain the quantum kernel used.',
  'What changed between these images?',
  'What are the limitations of this analysis?',
  'Describe the EuroSAT dataset.',
  'Explain the features used for predictions.',
];

const TerraCopilot = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'I am Terra Copilot — a dataset-grounded assistant for this project. I answer questions using loaded datasets, analysis results, and verified project documentation. Ask me about classifications, quantum experiments, change detection, or the EuroSAT dataset.',
      source: 'system',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const q = query.trim();
    if (!q || loading) return;
    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await askCopilot(q);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: res.answer,
          source: res.source,
          experiment_id: res.experiment_id,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: 'Failed to reach the backend. The API may be disconnected or starting up.',
          source: 'error',
        },
      ]);
    }
    setLoading(false);
  };

  const sourceLabel = (s?: string) => {
    if (!s || s === 'none') return null;
    const labels: Record<string, string> = {
      experiment_record: 'Experiment Record',
      dataset_metadata: 'Dataset Metadata',
      project_documentation: 'Project Documentation',
      system: 'System',
      error: 'Error',
    };
    return labels[s] || s;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Terra Copilot</span>
        </div>
        <button onClick={onClose} className="text-textMuted hover:text-textMain"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`text-[13px] leading-relaxed p-3 rounded-lg max-w-[92%] ${
                msg.role === 'user'
                  ? 'bg-primary/15 text-textMain border border-primary/20'
                  : 'bg-background text-textMuted border border-border'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'ai' && msg.source && sourceLabel(msg.source) && (
              <div className="flex items-center gap-1 text-[9px] text-accentCyan mt-1 ml-1 opacity-80">
                <ExternalLink className="w-2.5 h-2.5" />
                Source: {sourceLabel(msg.source)}
                {msg.experiment_id && <span className="font-mono"> ({msg.experiment_id})</span>}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-textMuted italic">
            <Loader2 className="w-3 h-3 animate-spin" />
            Searching available context…
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {SUGGESTIONS.slice(0, 3).map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); }}
              className="text-[10px] bg-surfaceHover px-2 py-1 rounded text-textMuted hover:text-primary hover:bg-primary/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about datasets, results, or methods…"
            className="w-full bg-background border border-border rounded pl-3 pr-9 py-2 text-sm text-textMain focus:outline-none focus:border-primary placeholder:text-textMuted/40"
          />
          <button
            onClick={handleSend}
            disabled={!query.trim() || loading}
            className="absolute right-2 top-2 text-primary disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerraCopilot;
