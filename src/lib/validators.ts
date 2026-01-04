import { ValidationResult } from '@/types';

const MAX_PROMPT_LENGTH = 5000;
const MIN_PROMPT_LENGTH = 3;

// Dangerous patterns that could indicate injection attacks
const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /eval\(/gi,
  /expression\(/gi,
];

/**
 * Validates prompt input for security and business rules
 * Prevents: XSS, injection attacks, API abuse
 */
export function validatePrompt(prompt: string): ValidationResult {
  // Check if prompt exists
  if (!prompt || typeof prompt !== 'string') {
    return {
      isValid: false,
      error: 'Prompt is required and must be a string',
    };
  }

  // Trim whitespace
  const trimmedPrompt = prompt.trim();

  // Check minimum length
  if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt must be at least ${MIN_PROMPT_LENGTH} characters long`,
    };
  }

  // Check maximum length (prevent API abuse and excessive costs)
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters`,
    };
  }

  // Check for dangerous patterns (XSS prevention)
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedPrompt)) {
      return {
        isValid: false,
        error: 'Prompt contains potentially malicious content',
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitizes text to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates environment variables on startup
 */
export function validateEnvironment(): void {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  if (process.env.GEMINI_API_KEY.length < 20) {
    throw new Error('GEMINI_API_KEY appears to be invalid (too short)');
  }
}
