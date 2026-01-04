'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

export default function CopyButton({ text, disabled = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || disabled) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={disabled || !text}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-bg-primary border border-border
        text-xs uppercase tracking-wider font-light
        transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed
        ${copied
          ? 'text-accent border-accent scale-105'
          : 'text-text-primary hover:border-border-hover'
        }
        ${!disabled && !copied ? 'hover:bg-bg-secondary hover:scale-105' : ''}
      `}
    >
      {copied ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            className="animate-scale-in"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="animate-fade-in">COPIED</span>
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            className="transition-transform duration-200 group-hover:scale-110"
          >
            <rect x="9" y="9" width="13" height="13" rx="0" ry="0" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>COPY</span>
        </>
      )}
    </button>
  );
}
