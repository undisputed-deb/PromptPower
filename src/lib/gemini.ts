import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Validate API key on module load
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// System instruction for prompt optimization
const SYSTEM_INSTRUCTION = `You are an expert AI prompt engineer. Your task is to optimize user prompts to make them more effective, clear, and likely to produce high-quality results from AI models.

When optimizing prompts, you should:
1. Make the prompt more specific and detailed
2. Add relevant context and constraints
3. Structure the prompt logically
4. Include desired output format when applicable
5. Remove ambiguity and vagueness
6. Add examples if helpful
7. Ensure the prompt is clear and actionable

Return ONLY the optimized prompt without any explanations, meta-commentary, or additional text. Do not include phrases like "Here's the optimized prompt:" or "Optimized version:". Just return the improved prompt directly.`;

/**
 * Optimizes a user prompt using Google's Gemini API
 * @param userPrompt - The original prompt to optimize
 * @returns Optimized prompt string
 * @throws Error if API call fails
 */
export async function optimizePrompt(userPrompt: string): Promise<string> {
  try {
    // Get the generative model (using gemini-2.5-flash - latest stable model with better quotas)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Generate optimized prompt
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const optimizedPrompt = response.text();

    if (!optimizedPrompt || optimizedPrompt.trim().length === 0) {
      throw new Error('Gemini API returned empty response');
    }

    return optimizedPrompt.trim();
  } catch (error) {
    // Log error server-side only (never expose to client)
    console.error('Gemini API Error:', error);

    // Determine error type and throw appropriate message
    if (error instanceof Error) {
      // Check for quota/billing errors
      if (error.message.includes('quota') || error.message.includes('billing')) {
        throw new Error('API quota exceeded. Please try again later.');
      }

      // Check for invalid API key
      if (error.message.includes('API key') || error.message.includes('invalid')) {
        throw new Error('API configuration error. Please contact support.');
      }

      // Check for safety filter blocks
      if (error.message.includes('safety') || error.message.includes('blocked')) {
        throw new Error('Content was blocked by safety filters. Please modify your prompt.');
      }
    }

    // Generic error message (don't expose internal details)
    throw new Error('Failed to optimize prompt. Please try again.');
  }
}

/**
 * Health check for Gemini API
 * @returns true if API is accessible, false otherwise
 */
export async function checkGeminiHealth(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('test');
    await result.response;
    return true;
  } catch (error) {
    console.error('Gemini health check failed:', error);
    return false;
  }
}
