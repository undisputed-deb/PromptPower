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

type Mode = 'freestyle' | 'structured';

export default function PromptOptimizer() {
  const [mode, setMode] = useState<Mode>('freestyle');

  // Freestyle mode states
  const [inputPrompt, setInputPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Structured mode states
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [task, setTask] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [examples, setExamples] = useState('');
  const [tone, setTone] = useState('');

  // Common states
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const buildStructuredPrompt = () => {
    let prompt = '';

    if (role) prompt += `Role: ${role}\n\n`;
    if (context) prompt += `Context: ${context}\n\n`;
    if (task) prompt += `Task: ${task}\n\n`;
    if (outputFormat) prompt += `Output Format: ${outputFormat}\n\n`;
    if (constraints) prompt += `Constraints: ${constraints}\n\n`;
    if (examples) prompt += `Examples: ${examples}\n\n`;
    if (tone) prompt += `Tone: ${tone}\n\n`;

    return prompt.trim();
  };

  const handleOptimize = async () => {
    const promptToOptimize = mode === 'freestyle' ? inputPrompt : buildStructuredPrompt();

    if (!promptToOptimize.trim()) {
      setError('Enter a prompt to optimize');
      return;
    }

    if (promptToOptimize.length > MAX_CHARS) {
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
        body: JSON.stringify({ prompt: promptToOptimize }),
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
          input: promptToOptimize,
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
    if (mode === 'freestyle') {
      setInputPrompt(item.input);
    }
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

  const charCount = mode === 'freestyle' ? inputPrompt.length : buildStructuredPrompt().length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="w-full max-w-container mx-auto space-y-8 animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex border border-border bg-bg-secondary">
          <button
            onClick={() => setMode('freestyle')}
            className={`px-8 py-3 text-xs uppercase tracking-wider font-light transition-all duration-200 ${
              mode === 'freestyle'
                ? 'bg-accent text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Freestyle
          </button>
          <button
            onClick={() => setMode('structured')}
            className={`px-8 py-3 text-xs uppercase tracking-wider font-light transition-all duration-200 ${
              mode === 'structured'
                ? 'bg-accent text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Structured
          </button>
        </div>
      </div>

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

      {/* Freestyle Mode */}
      {mode === 'freestyle' && (
        <div className="space-y-6">
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

          {/* Image Upload Section */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Upload Image (Optional)
            </label>

            {uploadedImage ? (
              <div className="relative border border-border p-4">
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 px-3 py-1 bg-accent text-bg-primary text-xs uppercase tracking-wider hover:bg-text-primary transition-colors duration-200"
                >
                  Remove
                </button>
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-w-full h-auto max-h-64 mx-auto"
                />
              </div>
            ) : (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border hover:border-border-hover transition-colors duration-200 px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-text-dim"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-4 text-xs text-text-secondary uppercase tracking-wider">
                    Click to upload image
                  </p>
                  <p className="mt-2 text-xs text-text-dim">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Structured Mode */}
      {mode === 'structured' && (
        <div className="space-y-6">
          {/* Role */}
          <div className="space-y-2">
            <label htmlFor="role" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Role <span className="text-accent">*</span>
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Expert Python developer, Marketing copywriter, Data analyst"
              className="
                w-full px-4 py-3
                bg-bg-primary border border-border
                text-text-primary text-sm
                placeholder:text-text-dim
                focus:border-accent
                transition-colors duration-200
              "
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <label htmlFor="context" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Context <span className="text-text-dim">(Optional)</span>
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide background information or context for the task"
              rows={3}
              className="
                w-full px-4 py-3
                bg-bg-primary border border-border
                text-text-primary text-sm
                placeholder:text-text-dim
                resize-none
                focus:border-accent
                transition-colors duration-200
              "
            />
          </div>

          {/* Task / Prompt */}
          <div className="space-y-2">
            <label htmlFor="task" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Task / Prompt <span className="text-accent">*</span>
            </label>
            <textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Describe what you want the AI to do"
              rows={4}
              className="
                w-full px-4 py-3
                bg-bg-primary border border-border
                text-text-primary text-sm
                placeholder:text-text-dim
                resize-none
                focus:border-accent
                transition-colors duration-200
              "
            />
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label htmlFor="outputFormat" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Output Format <span className="text-text-dim">(Optional)</span>
            </label>
            <input
              id="outputFormat"
              type="text"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              placeholder="e.g., JSON, Markdown, Bullet points, Step-by-step guide"
              className="
                w-full px-4 py-3
                bg-bg-primary border border-border
                text-text-primary text-sm
                placeholder:text-text-dim
                focus:border-accent
                transition-colors duration-200
              "
            />
          </div>

          {/* Constraints */}
          <div className="space-y-2">
            <label htmlFor="constraints" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Constraints <span className="text-text-dim">(Optional)</span>
            </label>
            <textarea
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Any limitations or requirements (e.g., word count, specific technologies, style guidelines)"
              rows={3}
              className="
                w-full px-4 py-3
                bg-bg-primary border border-border
                text-text-primary text-sm
                placeholder:text-text-dim
                resize-none
                focus:border-accent
                transition-colors duration-200
              "
            />
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <label htmlFor="examples" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Examples <span className="text-text-dim">(Optional)</span>
            </label>
            <textarea
              id="examples"
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Provide examples of desired output or similar scenarios"
              rows={3}
              className="
                w-full px-4 py-3
                bg-bg-primary border border-border
                text-text-primary text-sm
                placeholder:text-text-dim
                resize-none
                focus:border-accent
                transition-colors duration-200
              "
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <label htmlFor="tone" className="text-xs uppercase tracking-wider text-text-secondary font-light">
              Tone <span className="text-text-dim">(Optional)</span>
            </label>
            <input
              id="tone"
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g., Professional, Casual, Friendly, Technical, Creative"
              className="
                w-full px-4 py-3
                bg-bg-primary border border-border
                text-text-primary text-sm
                placeholder:text-text-dim
                focus:border-accent
                transition-colors duration-200
              "
            />
          </div>

          {/* Character count for structured */}
          <div className="flex justify-end">
            <span className={`text-xs font-mono ${isNearLimit ? 'text-accent' : 'text-text-dim'}`}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleOptimize}
        disabled={loading || (mode === 'freestyle' ? !inputPrompt.trim() : !role.trim() || !task.trim())}
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
        {loading ? 'OPTIMIZING...' : mode === 'structured' ? 'GENERATE STRUCTURED PROMPT' : 'OPTIMIZE'}
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
