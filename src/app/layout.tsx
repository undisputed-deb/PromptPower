import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PromptPower - AI Prompt Optimizer',
  description: 'Optimize your AI prompts with Google Gemini. Clean, minimal, and powerful.',
  keywords: ['AI', 'prompt', 'optimization', 'Gemini', 'ChatGPT', 'Claude'],
  authors: [{ name: 'PromptPower' }],
  openGraph: {
    title: 'PromptPower - AI Prompt Optimizer',
    description: 'Optimize your AI prompts with Google Gemini',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
