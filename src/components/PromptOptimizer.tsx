'use client';

import { useState, useEffect } from 'react';
import CopyButton from './CopyButton';

const MAX_CHARS = 5000;
const MAX_HISTORY = 5;

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: number;
}

export default function PromptOptimizer() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('promptHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('promptHistory', JSON.stringify(newHistory));
  };

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) {
      setError('Enter a prompt to optimize');
      return;
    }

    if (inputPrompt.length > MAX_CHARS) {
      setError(`Maximum ${MAX_CHARS} characters`);
      return;
    }

    setLoading(true);
    setError('');
    setOptimizedPrompt('');

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Optimization failed');
      }

      if (data.success && data.optimizedPrompt) {
        setOptimizedPrompt(data.optimizedPrompt);

        // Add to history
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          input: inputPrompt,
          output: data.optimizedPrompt,
          timestamp: Date.now(),
        };

        const newHistory = [newItem, ...history].slice(0, MAX_HISTORY);
        saveHistory(newHistory);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setInputPrompt(item.input);
    setOptimizedPrompt(item.output);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('promptHistory');
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleOptimize();
    }
  };

  const charCount = inputPrompt.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="w-full max-w-container mx-auto space-y-8 animate-fade-in">
      {/* History Toggle */}
      {history.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs uppercase tracking-wider text-text-secondary hover:text-accent transition-colors duration-200"
          >
            {showHistory ? 'HIDE HISTORY' : `HISTORY (${history.length})`}
          </button>
        </div>
      )}

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <span className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Previous Prompts
            </span>
            <button
              onClick={clearHistory}
              className="text-xs uppercase tracking-wider text-text-dim hover:text-accent transition-colors duration-200"
            >
              CLEAR ALL
            </button>
          </div>

          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadHistoryItem(item)}
                className="w-full text-left px-4 py-3 border border-border hover:border-border-hover bg-bg-secondary hover:bg-bg-primary transition-all duration-200 group"
              >
                <p className="text-xs text-text-dim font-mono truncate group-hover:text-text-secondary">
                  {item.input}
                </p>
                <p className="text-xs text-text-dim mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <label htmlFor="input" className="text-xs uppercase tracking-wider text-text-secondary font-light">
            Input
          </label>
          <span className={`text-xs font-mono ${isNearLimit ? 'text-accent' : 'text-text-dim'}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>

        <textarea
          id="input"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here..."
          maxLength={MAX_CHARS}
          className="
            w-full h-48 px-4 py-3
            bg-bg-primary border border-border
            text-text-primary font-mono text-sm
            placeholder:text-text-dim placeholder:font-sans
            resize-none
            focus:border-accent
            transition-colors duration-200
          "
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleOptimize}
        disabled={loading || !inputPrompt.trim()}
        className={`
          w-full px-6 py-4
          bg-bg-primary border border-border
          text-sm uppercase tracking-wider font-light
          transition-all duration-150
          disabled:opacity-30 disabled:cursor-not-allowed
          ${loading
            ? 'animate-border-pulse'
            : 'hover:bg-text-primary hover:text-bg-primary hover:border-text-primary'
          }
        `}
      >
        {loading ? 'OPTIMIZING...' : 'OPTIMIZE'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="border border-accent/50 bg-accent/5 px-4 py-3">
          <p className="text-xs text-accent uppercase tracking-wider">
            ERROR: {error}
          </p>
        </div>
      )}

      {/* Output Section */}
      {optimizedPrompt && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-baseline justify-between">
            <label htmlFor="output" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Output
            </label>
            <CopyButton text={optimizedPrompt} />
          </div>

          <textarea
            id="output"
            value={optimizedPrompt}
            readOnly
            className="
              w-full h-64 px-4 py-3
              bg-bg-secondary border border-border/50
              text-text-primary font-mono text-sm
              resize-none
              cursor-default
            "
          />
        </div>
      )}
    </div>
  );
}
