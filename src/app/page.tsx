import PromptOptimizer from '@/components/PromptOptimizer';

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12 md:px-8 md:py-16">
      <div className="max-w-container mx-auto space-y-16">
        {/* Header */}
        <header className="space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest">
            PROMPTPOWER
          </h1>
          <p className="text-xs md:text-sm text-text-secondary uppercase tracking-wide font-light">
            Optimize your AI prompts
          </p>
        </header>

        {/* Main Content */}
        <PromptOptimizer />

        {/* Footer */}
        <footer className="pt-16 border-t border-border">
          <div className="flex items-center justify-center gap-4 text-xs text-text-dim">
            <kbd className="px-2 py-1 border border-border text-text-dim font-mono text-xs">
              Ctrl/Cmd + Enter
            </kbd>
            <span className="text-text-dim">to optimize</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
