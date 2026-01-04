export interface OptimizeRequest {
  prompt: string;
}

export interface OptimizeResponse {
  optimizedPrompt?: string;
  success: boolean;
  error?: string;
  message?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface APIError {
  error: string;
  message: string;
  statusCode: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
