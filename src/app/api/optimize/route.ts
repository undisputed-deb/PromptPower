import { NextRequest, NextResponse } from 'next/server';
import { optimizePrompt } from '@/lib/gemini';
import { validatePrompt } from '@/lib/validators';
import rateLimiter from '@/lib/rateLimiter';
import { OptimizeResponse } from '@/types';

/**
 * Get client IP address from request
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  if (cfConnecting) return cfConnecting;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;

  return 'unknown';
}

/**
 * CORS headers for API security
 * Only allow requests from same origin or localhost
 */
function getCORSHeaders(origin: string | null): HeadersInit {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return NextResponse.json({}, { headers: getCORSHeaders(origin) });
}

/**
 * POST /api/optimize
 * Optimizes user prompt using Gemini API
 *
 * Security features:
 * - Rate limiting (10 req/min per IP)
 * - Input validation (length, malicious patterns)
 * - CORS protection
 * - Error sanitization (no internal details exposed)
 * - API key never exposed to client
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCORSHeaders(origin);

  try {
    // SECURITY: Rate limiting (prevents API abuse)
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimiter.checkLimit(clientIP);

    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetTime);
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        } as OptimizeResponse,
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetDate.toISOString(),
          },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Request body must be valid JSON',
        } as OptimizeResponse,
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { prompt } = body;

    // SECURITY: Input validation (prevents injection, XSS, API abuse)
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: validation.error || 'Invalid prompt',
        } as OptimizeResponse,
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Call Gemini API (API key is server-side only)
    const optimizedPrompt = await optimizePrompt(prompt);

    // Success response with rate limit headers
    return NextResponse.json(
      {
        success: true,
        optimizedPrompt,
      } as OptimizeResponse,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    // SECURITY: Error sanitization (never expose internal details)
    console.error('API Error:', error);

    // Determine appropriate error message
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let statusCode = 500;

    if (error instanceof Error) {
      // Only expose safe error messages to client
      if (error.message.includes('quota') || error.message.includes('try again later')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        statusCode = 503;
      } else if (error.message.includes('safety') || error.message.includes('blocked')) {
        errorMessage = error.message; // Safe to expose
        statusCode = 400;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: errorMessage,
      } as OptimizeResponse,
      {
        status: statusCode,
        headers: corsHeaders,
      }
    );
  }
}

/**
 * Reject other HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST, OPTIONS' } }
  );
}
